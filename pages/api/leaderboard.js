const players = [
  "Kr Kevin Roldan#EUW",
  "rACKSTAR#EUW",
  "16 01 98#CHAMA",
  "Borras#EUW",
  "MrPangoX#EUW",
  "King Heeft#EUW",
  "pelaospavotti#pel",
  "Andy Killer#2967",
  "TruenoDorado7#EUW",
  "22cm181cm79kg#3431",
  "Odin Skywalker#EUW"
];

const RIOT_KEY = process.env.RIOT_API_KEY;

const tierOrder = {
  CHALLENGER: 9,
  GRANDMASTER: 8,
  MASTER: 7,
  DIAMOND: 6,
  EMERALD: 5,
  PLATINUM: 4,
  GOLD: 3,
  SILVER: 2,
  BRONZE: 1,
  IRON: 0,
  UNRANKED: -1
};

const rankOrder = { I: 4, II: 3, III: 2, IV: 1 };

async function riotFetch(url) {
  const res = await fetch(url, {
    headers: { "X-Riot-Token": RIOT_KEY }
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return text ? JSON.parse(text) : null;
}

export default async function handler(req, res) {
  if (!RIOT_KEY) {
    return res.status(500).json({ error: "Falta RIOT_API_KEY en Vercel" });
  }

  const results = [];

  for (const player of players) {
    try {
      const [gameName, tagLine] = player.split("#");

      const accountData = await riotFetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
      );

      const summonerData = await riotFetch(
        `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}`
      );

      const rankedData = await riotFetch(
        `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}`
      );

      const solo = Array.isArray(rankedData)
        ? rankedData.find((q) => q.queueType === "RANKED_SOLO_5x5")
        : null;

      if (!solo) {
        results.push({
          name: player,
          tier: "UNRANKED",
          rank: "-",
          lp: 0,
          wins: 0,
          losses: 0,
          winrate: 0,
          debug: "Sin datos de Solo/Duo"
        });
        continue;
      }

      const totalGames = solo.wins + solo.losses;
      const winrate = totalGames ? Math.round((solo.wins / totalGames) * 100) : 0;

      results.push({
        name: player,
        tier: solo.tier,
        rank: solo.rank,
        lp: solo.leaguePoints,
        wins: solo.wins,
        losses: solo.losses,
        winrate
      });
    } catch (e) {
      results.push({
        name: player,
        tier: "UNRANKED",
        rank: "-",
        lp: 0,
        wins: 0,
        losses: 0,
        winrate: 0,
        debug: e.message
      });
    }
  }

  results.sort((a, b) => {
    const tierDiff = (tierOrder[b.tier] ?? -1) - (tierOrder[a.tier] ?? -1);
    if (tierDiff !== 0) return tierDiff;

    const rankDiff = (rankOrder[b.rank] ?? 0) - (rankOrder[a.rank] ?? 0);
    if (rankDiff !== 0) return rankDiff;

    return b.lp - a.lp;
  });

  return res.status(200).json(results);
}
