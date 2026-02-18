"use client";
import { useState, useEffect } from "react";

interface FormationPos {
  id: number;
  pos: string;
  x: string;
  y: string;
}

type FormationKey = "4-3-3" | "4-4-2" | "4-2-3-1" | "3-4-3";

const FORMATIONS: Record<FormationKey, FormationPos[]> = {
  "4-3-3": [
    { id: 1, pos: "ST", x: "50%", y: "12%" }, { id: 2, pos: "LW", x: "20%", y: "18%" }, { id: 3, pos: "RW", x: "80%", y: "18%" },
    { id: 4, pos: "CM", x: "30%", y: "42%" }, { id: 5, pos: "CDM", x: "50%", y: "55%" }, { id: 6, pos: "CM", x: "70%", y: "42%" },
    { id: 7, pos: "LB", x: "15%", y: "72%" }, { id: 8, pos: "CB", x: "40%", y: "78%" }, { id: 9, pos: "CB", x: "60%", y: "78%" },
    { id: 10, pos: "RB", x: "85%", y: "72%" }, { id: 11, pos: "GK", x: "50%", y: "92%" },
  ],
  "4-4-2": [
    { id: 1, pos: "ST", x: "42%", y: "12%" }, { id: 2, pos: "ST", x: "58%", y: "12%" },
    { id: 3, pos: "LM", x: "15%", y: "42%" }, { id: 4, pos: "CM", x: "40%", y: "45%" }, { id: 5, pos: "CM", x: "60%", y: "45%" }, { id: 6, pos: "RM", x: "85%", y: "42%" },
    { id: 7, pos: "LB", x: "15%", y: "72%" }, { id: 8, pos: "CB", x: "40%", y: "78%" }, { id: 9, pos: "CB", x: "60%", y: "78%" }, { id: 10, pos: "RB", x: "85%", y: "72%" },
    { id: 11, pos: "GK", x: "50%", y: "92%" },
  ],
  "4-2-3-1": [
    { id: 1, pos: "ST", x: "50%", y: "10%" },
    { id: 2, pos: "LAM", x: "20%", y: "25%" }, { id: 3, pos: "CAM", x: "50%", y: "28%" }, { id: 4, pos: "RAM", x: "80%", y: "25%" },
    { id: 5, pos: "CDM", x: "38%", y: "55%" }, { id: 6, pos: "CDM", x: "62%", y: "55%" },
    { id: 7, pos: "LB", x: "15%", y: "72%" }, { id: 8, pos: "CB", x: "40%", y: "78%" }, { id: 9, pos: "CB", x: "60%", y: "78%" }, { id: 10, pos: "RB", x: "85%", y: "72%" },
    { id: 11, pos: "GK", x: "50%", y: "92%" },
  ],
  "3-4-3": [
    { id: 1, pos: "ST", x: "50%", y: "12%" }, { id: 2, pos: "LW", x: "20%", y: "18%" }, { id: 3, pos: "RW", x: "80%", y: "18%" },
    { id: 4, pos: "LM", x: "15%", y: "45%" }, { id: 5, pos: "CM", x: "40%", y: "48%" }, { id: 6, pos: "CM", x: "60%", y: "48%" }, { id: 7, pos: "RM", x: "85%", y: "45%" },
    { id: 8, pos: "CB", x: "28%", y: "78%" }, { id: 9, pos: "CB", x: "50%", y: "82%" }, { id: 10, pos: "CB", x: "72%", y: "78%" },
    { id: 11, pos: "GK", x: "50%", y: "92%" },
  ]
};

export default function Football() {
  interface PlayerSlot extends FormationPos {
    name: string;
    img: string | null;
  }

  interface PlayerResult {
    idPlayer?: string;
    strPlayer?: string;
    strThumb?: string | null;
    strTeam?: string;
  }

  const [players, setPlayers] = useState<PlayerSlot[]>(
    FORMATIONS["4-3-3"].map((p) => ({ ...p, name: "Empty", img: null })),
  );
  const [activeFormation, setActiveFormation] = useState<FormationKey>("4-3-3");
  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Search API Logic
  useEffect(() => {
    if (search.length < 3) { setResults([]); return; }
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${search}`);
        const data = await res.json();
        setResults(data.player || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    const debounce = setTimeout(fetchPlayers, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  const switchFormation = (type: FormationKey) => {
    const newCoords = FORMATIONS[type];
    setActiveFormation(type);
    setPlayers((prev) =>
      prev.map((p, idx) => ({
        ...p,
        x: newCoords[idx].x,
        y: newCoords[idx].y,
        pos: newCoords[idx].pos,
      })),
    );
  };

  const assignPlayer = (playerData: PlayerResult) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === activeId
          ? { ...p, name: playerData.strPlayer || p.name, img: playerData.strThumb ?? p.img }
          : p,
      ),
    );
    setSearch("");
    setActiveId(null);
  };

  return (
    <div  className="flex flex-col position-relative items-center gap-6 p-6 md:p-10 bg-slate-900 min-h-screen text-white">
      <div className="w-full max-w-4xl">
        <div className="flex gap-2 justify-center overflow-x-auto pb-4 no-scrollbar">
          {(Object.keys(FORMATIONS) as FormationKey[]).map((f) => (
            <button
              key={f}
              onClick={() => switchFormation(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                activeFormation === f ? "bg-emerald-600 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-6xl justify-center">
        <div className="w-full lg:w-80 bg-zinc-900 p-5 rounded-3xl border border-zinc-800">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Select Player
            </h3>
          <input 
            type="text"
            className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            placeholder={activeId ? "Search player name..." : "Select a position first"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={!activeId}
          />
          <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loading && <p className="text-center text-emerald-500 animate-pulse text-sm">Searching API...</p>}
            {results.map((p) => (
              <button key={p.idPlayer} onClick={() => assignPlayer(p)} className="w-full flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-2xl border border-transparent hover:border-zinc-700 transition-all text-left">
                <img src={p.strThumb || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover bg-zinc-800" alt="" />
                <div className="overflow-hidden"><p className="text-sm font-bold truncate">{p.strPlayer}</p><p className="text-[10px] text-zinc-500">{p.strTeam}</p></div>
              </button>
            ))}
          </div>
        </div>

        {/* THE TACTICAL PITCH */}
        <div className="relative w-full max-w-[400px] aspect-[3/4] bg-emerald-700 rounded-xl border-[6px] border-white/20 shadow-2xl overflow-hidden self-center">
          
          <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,0,0,0.3)_40px,rgba(0,0,0,0.3)_80px)]" />
          <div className="absolute top-1/2 w-full h-px bg-white/20" />
          <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />
          
          {players.map((player) => (
            <div key={player.id} className="absolute transition-all duration-700 ease-in-out z-20" style={{ left: player.x, top: player.y, transform: 'translate(-50%, -50%)' }}>
              <button onClick={() => setActiveId(player.id)} className="flex flex-col items-center group">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all shadow-xl ${activeId === player.id ? 'border-yellow-400 ring-4 ring-yellow-400/20 scale-110 bg-zinc-800' : 'border-white bg-zinc-900'}`}>
                  {player.img ? <img src={player.img} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black">{player.pos}</span>}
                </div>
                <div className={`mt-2 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-lg whitespace-nowrap ${activeId === player.id ? 'bg-yellow-400 text-black' : 'bg-black/70 text-white'}`}>{player.name}</div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}