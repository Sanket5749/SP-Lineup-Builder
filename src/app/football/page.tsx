"use client";
import { useState, useEffect } from "react";

import { Trophy, SkipForward, User, Users, Swords, Medal, RotateCw, Target, Search, Settings, RefreshCw, Star } from "lucide-react";

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

interface PlayerSlot extends FormationPos {
  name: string;
  img: string | null;
  playerId?: string;
  rating?: number;
}

interface PlayerResult {
  idPlayer?: string;
  strPlayer?: string;
  strThumb?: string | null;
  strTeam?: string;
}

interface Team {
  id: number;
  name: string;
  players: PlayerSlot[];
  formation: FormationKey;
  color: string;
  totalRating: number;
}

interface PlayerWithRating extends PlayerSlot {
  rating: number;
}

export default function Football() {
  const TEAM_COLORS = ["emerald", "blue", "purple", "pink"];
  const PLAYERS_PER_TEAM = 11;

  const [gameType, setGameType] = useState<"solo" | "multiplayer" | null>(null);
  const [gameMode, setGameMode] = useState<"setup" | "toss" | "draft" | "view">("setup");
  const [numTeams, setNumTeams] = useState<number>(2);
  const [tossResult, setTossResult] = useState<number | null>(null);
  const [isTossing, setIsTossing] = useState<boolean>(false);
  const [currentTeam, setCurrentTeam] = useState<number>(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<number>(0);

  const [search, setSearch] = useState<string>("");
  const [results, setResults] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFormation, setActiveFormation] = useState<FormationKey>("4-3-3");
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);

  // Initialize teams
  const initializeTeams = () => {
    const teamCount = gameType === "solo" ? 1 : 2;
    const newTeams: Team[] = Array.from({ length: teamCount }, (_, i) => ({
      id: i,
      name: gameType === "solo" ? "My Team" : `Team ${i + 1}`,
      players: FORMATIONS[activeFormation].map((p) => ({ ...p, name: "Empty", img: null })),
      formation: activeFormation,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      totalRating: 0,
    }));
    setTeams(newTeams);
    if (gameType === "solo") {
      setGameMode("draft");
      setCurrentTeam(0);
    } else {
      setGameMode("toss");
    }
  };

  // Toss Coin
  const performToss = () => {
    setIsTossing(true);
    setTimeout(() => {
      const winner = Math.floor(Math.random() * numTeams);
      setTossResult(winner);
      setCurrentTeam(winner);
      setIsTossing(false);
      setTimeout(() => {
        setGameMode("draft");
      }, 1500);
    }, 1000);
  };

  // Search API Logic
  useEffect(() => {
    if (search.length < 3) { setResults([]); return; }
    const fetchPlayers = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${search}`);
        const data = await res.json();
        console.log(data);
        setResults(data.player || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    const debounce = setTimeout(fetchPlayers, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  const switchFormation = (type: FormationKey) => {
    setActiveFormation(type);
    setActiveSlot(null);
    setTeams((prev) =>
      prev.map((team) => ({
        ...team,
        formation: type,
        players: team.players.map((p, idx) => ({
          ...p,
          x: FORMATIONS[type][idx].x,
          y: FORMATIONS[type][idx].y,
          pos: FORMATIONS[type][idx].pos,
        })),
      })),
    );
  };

  const assignPlayer = (playerData: PlayerResult) => {
    if (activeSlot === null) return;
    
    setTeams((prev) =>
      prev.map((team, idx) =>
        idx === currentTeam
          ? {
              ...team,
              players: team.players.map((p) =>
                p.id === activeSlot
                  ? {
                      ...p,
                      name: playerData.strPlayer || p.name,
                      img: playerData.strThumb ?? p.img,
                      playerId: playerData.idPlayer,
                      rating: 0, // Will be set by Gemini later
                    }
                  : p,
              ),
            }
          : team,
      ),
    );

    setSearch("");
    setActiveSlot(null);
    // Move to next team
    const nextTeam = gameType === "solo" ? currentTeam : (currentTeam + 1) % 2;
    setCurrentTeam(nextTeam);
  };

  const skipTurn = () => {
    const nextTeam = (currentTeam + 1) % numTeams;
    setCurrentTeam(nextTeam);
    setSearch("");
    setActiveSlot(null);
  };

  const calculatePlayerRatings = (teamsToRate: any[]) => {
    // Position-based base ratings
    const positionRatings: Record<string, number> = {
      "GK": 75,
      "CB": 78,
      "LB": 76,
      "RB": 76,
      "CDM": 77,
      "CM": 75,
      "CAM": 76,
      "LAM": 75,
      "RAM": 75,
      "LM": 74,
      "RM": 74,
      "ST": 76,
      "LW": 74,
      "RW": 74,
    };

    // Generate rating based on position and player name
    const getRating = (playerName: string, position: string): number => {
      const baseRating = positionRatings[position] || 75;
      
      // Add variance based on name length and character codes
      let nameBonus = 0;
      for (let i = 0; i < playerName.length; i++) {
        nameBonus += playerName.charCodeAt(i) % 5;
      }
      nameBonus = Math.min(nameBonus % 12, 8); // Bonus between 0-8
      
      return baseRating + nameBonus;
    };

    // Update teams with calculated ratings
    const updatedTeams = teamsToRate.map((team) => ({
      ...team,
      players: team.players.map((p: any) => {
        const rating = p.name === "Empty" ? 0 : getRating(p.name, p.pos);
        return {
          ...p,
          rating: rating,
        };
      }),
      totalRating: 0, // Will be calculated below
    }));

    // Calculate team totals
    updatedTeams.forEach((team) => {
      team.totalRating = team.players.reduce((sum: number, p: any) => sum + (p.rating || 0), 0);
    });

    // Determine winner
    const winnerTeam = updatedTeams.reduce((winner, team) => 
      team.totalRating > winner.totalRating ? team : winner
    );

    // Create analysis text
    const analysisText = `SQUAD RATING ANALYSIS:\n\n${updatedTeams.map((t) => `${t.name}: ${t.totalRating} total rating`).join('\n')}\n\nWINNER: ${winnerTeam.name}\nBased on squad strength and player composition`;

    setTeams(updatedTeams);
    setAiPrediction(analysisText);
  };

  const isDraftComplete = () => {
    return teams.every((team) => team.players.every((p) => p.name !== "Empty"));
  };

  const calculateTeamRatings = () => {
    return teams.map((team) => ({
      ...team,
      totalRating: team.players.reduce((sum, p) => sum + (p.rating || 0), 0),
    }));
  };

  const getWinner = () => {
    if (gameType === "solo") return null;
    const ratedTeams = calculateTeamRatings();
    return ratedTeams.reduce((winner, team) => (team.totalRating > winner.totalRating ? team : winner));
  };

  const loadDemoMatch = () => {
    setGameType("multiplayer");
    setGameMode("setup");
    
    // Fill teams with demo players
    const demoTeamsFormatted: Team[] = DEMO_TEAMS.map((demoTeam) => ({
      id: demoTeam.id,
      name: demoTeam.name,
      formation: demoTeam.formation,
      color: demoTeam.color,
      totalRating: 0,
      players: FORMATIONS[demoTeam.formation].map((formationPos, idx) => ({
        ...formationPos,
        id: formationPos.id,
        pos: formationPos.pos,
        x: formationPos.x,
        y: formationPos.y,
        name: demoTeam.players[idx]?.name || "Empty",
        img: null,
        playerId: undefined,
      })),
    }));

    setTeams(demoTeamsFormatted);
    setGameMode("view");
    setActiveTeam(0);
    
    // Calculate ratings
    setTimeout(() => {
      calculatePlayerRatings(demoTeamsFormatted);
    }, 100);
  };

  // GAME TYPE SELECTION
  if (!gameType) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 max-w-md text-center">
          <div className="flex items-center gap-3 justify-center mb-2">
            <Trophy className="w-10 h-10" />
            <h1 className="text-4xl font-bold">LINEUP</h1>
          </div>
          <p className="text-zinc-400 mb-12">Choose Game Mode</p>
          
          <div className="space-y-4">
            <button
              onClick={() => setGameType("solo")}
              className="w-full py-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border border-blue-500 rounded-2xl font-bold text-xl transition-all"
            >
              <User className="w-8 h-8 mb-2 mx-auto" />
              Solo Mode
              <p className="text-xs text-blue-200 mt-2">Build your own team</p>
            </button>
            
            <button
              onClick={() => setGameType("multiplayer")}
              className="w-full py-6 bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500 rounded-2xl font-bold text-xl transition-all"
            >
              <Users className="w-8 h-8 mb-2 mx-auto" />
              Multiplayer (2 Players)
              <p className="text-xs text-emerald-200 mt-2">Compete & Compare Ratings</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SETUP MODE
  if (gameMode === "setup") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 max-w-md text-center">
          <div className="flex items-center gap-3 justify-center mb-2">
            <Trophy className="w-10 h-10" />
            <h1 className="text-4xl font-bold">LINEUP</h1>
          </div>
          <p className="text-zinc-400 mb-8">{gameType === "solo" ? "Solo" : "Multiplayer"} Team Builder</p>
          
          <div className="space-y-6">
            {gameType === "multiplayer" && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
                <p className="flex items-center gap-2 text-blue-200 font-bold"><Swords className="w-5 h-5" /> 2 Teams</p>
                <p className="text-blue-300 text-sm">Both players will build teams simultaneously</p>
              </div>
            )}

            {gameType === "solo" && (
              <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4">
                <p className="flex items-center gap-2 text-emerald-200 font-bold"><User className="w-5 h-5" /> Solo Mode</p>
                <p className="text-emerald-300 text-sm">Build your own single team</p>
              </div>
            )}

            <div>
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                Formation
              </label>
              <div className="flex gap-2 justify-center flex-wrap">
                {(Object.keys(FORMATIONS) as FormationKey[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFormation(f)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                      activeFormation === f
                        ? "bg-emerald-600 border-emerald-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-emerald-500"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={initializeTeams}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-xl font-bold text-lg transition-all"
            >
              Start Game
            </button>
            
            <button
              onClick={() => {
                setGameType(null);
                setGameMode("setup");
              }}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-bold transition-all text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TOSS MODE (Multiplayer only)
  if (gameMode === "toss" && gameType === "multiplayer") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 max-w-md text-center">
          <h1 className="text-3xl font-bold mb-8">🪙 COIN TOSS</h1>
          
          {tossResult === null ? (
            <div>
              <p className="text-zinc-400 mb-8">Determine who starts the draft!</p>
              <button
                onClick={performToss}
                disabled={isTossing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-700 border border-emerald-500 rounded-xl font-bold text-lg transition-all"
              >
                {isTossing ? "Tossing..." : <><RotateCw className="w-5 h-5 inline mr-2" />Flip Coin</>
              }
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className={`text-6xl animate-bounce`}>
                {tossResult % 2 === 0 ? "🔵" : "🔴"}
              </div>
              <div className="text-2xl font-bold">
                <span className={`px-4 py-2 rounded-lg ${tossResult === 0 ? "bg-blue-600" : "bg-purple-600"}`}>
                  Team {tossResult + 1}
                </span>
              </div>
              <p className="text-zinc-400">wins the toss and picks first!</p>
              <p className="text-sm text-zinc-500">Starting draft in a moment...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DRAFT MODE
  if (gameMode === "draft") {
    const currentTeamData = teams[currentTeam];
    const emptySlots = currentTeamData?.players.filter((p) => p.name === "Empty") || [];

    return (
      <div className="flex flex-col items-center gap-6 p-6 md:p-10 bg-slate-900 min-h-screen text-white">
        {/* CURRENT TURN INDICATOR */}
        <div className={`px-6 py-3 rounded-full border-2 font-bold text-lg bg-${currentTeamData?.color}-600/20 border-${currentTeamData?.color}-500 text-${currentTeamData?.color}-400`}>
          {gameType === "solo" ? (
            <><Target className="w-5 h-5 inline mr-2" />Building Team • {emptySlots.length} slots remaining</>
          ) : (
            <>{currentTeamData?.name}'s Turn • {emptySlots.length} slots remaining</>
          )}
        </div>

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

        {/* DRAFT LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-10 w-full max-w-6xl justify-center">
          {/* SEARCH PANEL */}
          <div className="w-full lg:w-80 bg-zinc-900 p-5 rounded-3xl border border-zinc-800">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              <Search className="w-5 h-5 inline mr-2" />Search Player
            </h3>
            
            
            <input
              type="text"
              className="w-full p-3 bg-zinc-950 border border-zinc-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              placeholder={activeSlot ? "Search player name..." : "Click a position first"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!activeSlot}
            />
            <div className="mt-4 max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {!activeSlot && <p className="text-center text-zinc-500 text-sm py-4">Select a position on the pitch</p>}
              {loading && <p className="text-center text-emerald-500 animate-pulse text-sm">Searching API...</p>}
              {results.length > 0 && !loading && (
                <p className="text-[10px] text-zinc-500 mb-2">Position: <span className="font-bold text-emerald-400">{teams[currentTeam].players.find(p => p.id === activeSlot)?.pos}</span></p>
              )}
              {results.map((p) => (
                <button
                  key={p.idPlayer}
                  onClick={() => assignPlayer(p)}
                  disabled={!activeSlot}
                  className="w-full flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-2xl border border-transparent hover:border-zinc-700 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img src={p.strThumb || 'https://via.placeholder.com/150'} className="w-10 h-10 rounded-full object-cover bg-zinc-800" alt="" />
                  <div className="overflow-hidden flex-1">
                    <p className="text-sm font-bold truncate">{p.strPlayer}</p>
                    <p className="text-[10px] text-zinc-500">{p.strTeam}</p>
                  </div>

                </button>
              ))}
            </div>
          </div>

          {/* PITCH DISPLAY */}
          <div className="relative w-full max-w-[400px] aspect-[3/4] bg-emerald-700 rounded-xl border-[6px] border-white/20 shadow-2xl overflow-hidden self-center">
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,0,0,0.3)_40px,rgba(0,0,0,0.3)_80px)]" />
            <div className="absolute top-1/2 w-full h-px bg-white/20" />
            <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

            {currentTeamData?.players.map((player) => (
              <div key={player.id} className="absolute transition-all duration-700 ease-in-out z-20" style={{ left: player.x, top: player.y, transform: 'translate(-50%, -50%)' }}>
                <button 
                  onClick={() => setActiveSlot(player.id)}
                  className="flex flex-col items-center group"
                >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all shadow-xl cursor-pointer ${
                    activeSlot === player.id 
                      ? 'border-yellow-400 ring-4 ring-yellow-400/20 scale-110 bg-zinc-800' 
                      : player.name !== "Empty" 
                        ? 'border-emerald-400 bg-zinc-800' 
                        : 'border-zinc-600 bg-zinc-900 hover:border-yellow-400'
                  }`}>
                    {player.img ? <img src={player.img} className="w-full h-full object-cover" alt={player.name}/> : <span className="text-[10px] font-black text-zinc-600">{player.pos}</span>}
                  </div>
                  <div className={`mt-2 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-lg whitespace-nowrap ${
                    activeSlot === player.id 
                      ? 'bg-yellow-400 text-black' 
                      : player.name !== "Empty" 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-black/70 text-zinc-600'
                  }`}>
                    {player.name === "Empty" ? player.pos : player.name}
                  </div>

                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4">
          <button
            onClick={skipTurn}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg font-bold transition-all"
          >
            <SkipForward className="inline mr-2" /> Skip Turn
          </button>
          {isDraftComplete() && (
            <button
              onClick={() => {
                setGameMode("view");
                setActiveTeam(0);
                setActiveSlot(null);
                if (gameType === "multiplayer" && !aiPrediction) {
                  calculatePlayerRatings(teams);
                }
              }}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 rounded-lg font-bold transition-all"
            >
              ✅ View Teams
            </button>
          )}
        </div>
      </div>
    );
  }

  // VIEW MODE
  const ratedTeams = calculateTeamRatings();
  const winner = getWinner();

  return (
    <div className="flex flex-col items-center gap-6 p-6 md:p-10 bg-slate-900 min-h-screen text-white">
      {/* WINNER ANNOUNCEMENT - Multiplayer Only */}
      {gameType === "multiplayer" && winner && (
        <div className="w-full max-w-4xl space-y-4">
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 border-2 border-yellow-400 rounded-2xl p-8 text-center">
            <Trophy className="w-16 h-16 mb-3 mx-auto text-yellow-300" />
            <h2 className="text-3xl font-bold text-white mb-2">{winner.name} Wins!</h2>
            <p className="text-yellow-100 text-lg font-bold">Total Squad Rating: {winner.totalRating}</p>
            {ratedTeams.length > 1 && (
              <div className="mt-3 text-sm text-yellow-200">
                Opponent Rating: {ratedTeams.find((t) => t.id !== winner.id)?.totalRating}
              </div>
            )}
          </div>

          {/* AI PREDICTION */}
          {aiPrediction && (
            <div className="w-full bg-blue-900/40 border-2 border-blue-500 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-6 h-6" />
                <h3 className="text-xl font-bold text-blue-300">Squad Ratings Analysis</h3>
              </div>
              <div className="text-blue-100 text-sm leading-relaxed whitespace-pre-wrap">
                {aiPrediction}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 justify-center">
        {gameType === "solo" ? (
          <><Medal className="w-10 h-10" /><h1 className="text-4xl font-bold">Your Team</h1></>
        ) : (
          <><Trophy className="w-10 h-10" /><h1 className="text-4xl font-bold">Final Teams</h1></>
        )}
      </div>

      {/* Team Selection */}
      <div className="flex gap-3 flex-wrap justify-center">
        {ratedTeams.map((team) => (
          <button
            key={team.id}
            onClick={() => setActiveTeam(team.id)}
            className={`px-6 py-3 rounded-xl font-bold transition-all border ${
              activeTeam === team.id
                ? `bg-${team.color}-600 border-${team.color}-500 text-white`
                : `bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-${team.color}-500`
            }`}
          >
            <div>{team.name}</div>
            <div className="text-xs mt-1">Rating: {team.totalRating}</div>
          </button>
        ))}
      </div>

      {/* Formation Selection */}
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

      {/* PITCH DISPLAY */}
      <div className="relative w-full max-w-[400px] aspect-[3/4] bg-emerald-700 rounded-xl border-[6px] border-white/20 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(0,0,0,0.3)_40px,rgba(0,0,0,0.3)_80px)]" />
        <div className="absolute top-1/2 w-full h-px bg-white/20" />
        <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2" />

        {ratedTeams[activeTeam]?.players.map((player) => (
          <div key={player.id} className="absolute transition-all duration-700 ease-in-out z-20" style={{ left: player.x, top: player.y, transform: 'translate(-50%, -50%)' }}>
            <button className="flex flex-col items-center group">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all shadow-xl ${player.name !== "Empty" ? 'border-emerald-400 bg-zinc-800' : 'border-zinc-600 bg-zinc-900'}`}>
                {player.img ? <img src={player.img} className="w-full h-full object-cover" alt={player.name}/> : <span className="text-[10px] font-black text-zinc-600">{player.pos}</span>}
              </div>
              <div className={`mt-2 px-2 py-0.5 rounded-md text-[9px] font-bold shadow-lg whitespace-nowrap ${player.name !== "Empty" ? 'bg-emerald-600 text-white' : 'bg-black/70 text-zinc-600'}`}>
                {player.name === "Empty" ? player.pos : player.name}
              </div>
              {player.rating && (
                <div className="text-[8px] bg-yellow-600 text-white px-1.5 py-0.5 rounded-full mt-1 font-bold flex items-center gap-1 mx-auto w-fit">
                  <Star className="w-3 h-3 fill-white" /> {player.rating}
                </div>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setGameType(null);
          setGameMode("setup");
          setTeams([]);
          setSearch("");
          setResults([]);
          setTossResult(null);
          setActiveSlot(null);
          setNumTeams(2);
          setCurrentTeam(0);
          setAiPrediction(null);
        }}
        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-bold transition-all"
      >
        <RotateCw className="w-5 h-5 inline mr-2" />Start New Game
      </button>
    </div>
  );
}