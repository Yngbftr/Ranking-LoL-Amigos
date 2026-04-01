import { useEffect, useState } from "react";

export default function Home() {
  const [players, setPlayers] = useState([]);

  const fetchData = async () => {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();
    setPlayers(data);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>🏆 Ranking Solo/Duo</h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th>Rango</th>
            <th>LP</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Winrate</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.tier} {p.rank}</td>
              <td>{p.lp}</td>
              <td>{p.wins}</td>
              <td>{p.losses}</td>
              <td>{p.winrate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
