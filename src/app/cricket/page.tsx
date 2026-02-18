"use client";
import { useState, useEffect } from "react";

export default function Dream11Builder() {
  const [players, setPlayers] = useState(
    Array.from({ length: 11 }, (_, i) => ({
      id: i + 1,
      name: "Empty Slot",
      role: i < 2 ? "WK" : i < 6 ? "BAT" : i < 8 ? "AR" : "BOWL",
      img: null,
    })),
  );

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search API Logic (TheSportsDB)
  useEffect(() => {
    if (search.length < 3) {
      setResults([]);
      return;
    }
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${search}`,
        );
        const data = await res.json();
        setResults(data.player || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchPlayers, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const assignPlayer = (pData) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === activeId
          ? {
              ...p,
              name: pData.strPlayer,
              img: pData.strThumb,
              team: pData.strTeam,
            }
          : p,
      ),
    );
    setSearch("");
    setActiveId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1a1d23] p-5 rounded-3xl border border-white/10 sticky top-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Select Player
            </h3>
            <input
              className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm focus:border-green-500 outline-none mb-4"
              placeholder={activeId ? "Type name..." : "Click a card first"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!activeId}
            />
            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              {loading && (
                <p className="text-xs text-center text-gray-500">
                  Loading Stars...
                </p>
              )}
              {results.map((p) => (
                <button
                  key={p.idPlayer}
                  onClick={() => assignPlayer(p)}
                  className="w-full flex items-center gap-3 p-2 bg-white/5 hover:bg-green-600 rounded-2xl transition-all text-left group"
                >
                  <img
                    src={p.strThumb}
                    className="w-10 h-10 rounded-full object-cover"
                    alt=""
                  />
                  <div>
                    <p className="text-xs font-bold group-hover:text-white">
                      {p.strPlayer}
                    </p>
                    <p className="text-[10px] text-gray-500 group-hover:text-white/60">
                      {p.strTeam}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => setActiveId(player.id)}
              className={`relative h-64 rounded-[2rem] overflow-hidden transition-all duration-500 border-2 shadow-2xl ${
                activeId === player.id
                  ? "border-green-600 scale-105 ring-8 ring-green-600/10"
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />

              {player.img ? (
                <img
                  src={player.img}
                  className="absolute inset-0 w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1a1d23]">
                  <span className="text-4xl font-black text-white/5 uppercase italic"></span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-5 z-20 text-left">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-black bg-green-600 px-2 py-0.5 rounded italic">
                    #{player.id}
                  </span>
                </div>
                <h4
                  className={`text-sm font-black uppercase leading-tight tracking-tighter ${player.name === "Empty Slot" ? "text-gray-600" : "text-white"}`}
                >
                  {player.name}
                </h4>
              </div>
              {activeId === player.id && (
                <div className="absolute top-4 right-4 z-20">
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-ping" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
