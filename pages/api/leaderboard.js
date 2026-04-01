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
  IRON: 0
};

export default async function handler(req, res) {
  try {
    const results = [];

    for (const player of players) {
      const [gameName, tagLine] = player.split("#");

      const accountRes = await fetch(
        `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${tagLine}?api_key=${RIOT_KEY}`
      );
      const accountData = await accountRes.json();

      const summonerRes = await fetch(
        `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${accountData.puuid}?api_key=${RIOT_KEY}`
      );
      const summonerData = await summonerRes.json();

      const rankedRes = await fetch(
        `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerData.id}?api_key=${RIOT_KEY}`
      );
      const rankedData = await rankedRes.json();

      const solo = rankedData.find(
        (q) => q.queueType === "RANKED_SOLO_5x5"
      );

      if (solo) {
        const winrate = Math.round(
          (solo.wins / (solo.wins + solo.losses)) * 100
        );

        results.push({
          name: player,
          tier: solo.tier,
          rank: solo.rank,
          lp: solo.leaguePoints,
          wins: solo.wins,
          losses: solo.losses,
          winrate
        });
      }
    }

    results.sort((a, b) => {
      if (tierOrder[b.tier] !== tierOrder[a.tier]) {
        return tierOrder[b.tier] - tierOrder[a.tier];
      }
      if (a.rank !== b.rank) {
        return a.rank.localeCompare(b.rank);
      }
      return b.lp - a.lp;
    });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Error" });
  }
}
