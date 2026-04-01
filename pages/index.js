import { useEffect, useState } from "react";

export default function Home() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setError("");
      const res = await fetch("/api/leaderboard");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error cargando datos");
      }

      if (!Array.isArray(data)) {
        throw new Error("La API no devolvió una lista de jugadores");
      }

      setPlayers(data);
    } catch (err) {
      setError(err.message || "Error desconocido");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 600000); // 10 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>🏆 Ranking Solo/Duo</h1>

      {loading && <p>Cargando jugadores...</p>}

      {!loading && error && (
        <div style={{ background: "#fee", padding: 12, border: "1px solid #f99", marginBottom: 20 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && players.length === 0 && (
        <p>No hay datos de Solo/Duo para mostrar.</p>
      )}

      {!loading && !error && players.length > 0 && (
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
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
              <tr key={p.name}>
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
      )}
    </div>
  );
}
