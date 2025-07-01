import React, { useState, useEffect } from "react";
import "./App.css";

// Color constants from the project details
const COLORS = {
  primary: "#1976D2",
  secondary: "#424242",
  accent: "#FFC107",
};

// Dummy difficulty and topics for illustration; ideally fetch from backend
const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const TOPICS = ["Animals", "Food", "Sports", "Geography"];

const DEFAULT_STATS = {
  gamesPlayed: 0,
  gamesWon: 0,
  bestTime: null,
  lastResult: null,
};

// PUBLIC_INTERFACE
function App() {
  // Theme (light only but allow toggle for future)
  const [theme, setTheme] = useState("light");
  // Word search puzzle data (should retrieve from backend)
  const [puzzle, setPuzzle] = useState(null);
  const [wordsToFind, setWordsToFind] = useState([]);
  const [selectedCells, setSelectedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [stats, setStats] = useState({ ...DEFAULT_STATS });
  const [showStats, setShowStats] = useState(true);
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0]);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [loading, setLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [error, setError] = useState("");

  // Timer effect
  useEffect(() => {
    let timer = null;
    if (gameActive) {
      timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    } else if (!gameActive && elapsedTime !== 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [gameActive]);

  // Set theme on the <html> root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Fetch puzzle from backend (simulate API)
  // PUBLIC_INTERFACE
  const fetchPuzzle = async () => {
    setLoading(true);
    setError("");
    setSelectedCells([]);
    setFoundWords([]);
    setElapsedTime(0);
    setGameActive(false);

    // Simulating API call, replace with actual endpoint
    try {
      // TODO: Replace with your actual API endpoint and logic
      // const resp = await fetch(`http://localhost:3001/api/puzzle?difficulty=${difficulty}&topic=${topic}`);
      // const data = await resp.json();

      // DEMO: Simulated puzzle data structure from backend
      const simulatedPuzzle = {
        // Letters grid [row][col]
        grid: [
          ["A", "N", "I", "M", "A", "L", "S"],
          ["F", "O", "O", "D", "X", "Y", "Z"],
          ["S", "P", "O", "R", "T", "S", "A"],
          ["G", "E", "O", "G", "R", "A", "P"],
          ["H", "Y", "Z", "C", "A", "T", "S"],
          ["E", "F", "O", "X", "D", "O", "G"],
          ["S", "T", "R", "A", "W", "B", "Y"],
        ],
        words: [
          "ANIMALS",
          "FOOD",
          "SPORTS",
          "GEOGRAPHY",
          "CATS",
          "DOG",
          "STRAWBERRY",
        ].slice(0, difficulty === "Easy" ? 4 : difficulty === "Medium" ? 6 : 7),
        topic: topic,
        difficulty: difficulty,
      };

      setPuzzle(simulatedPuzzle);
      setWordsToFind(simulatedPuzzle.words);
      setFoundWords([]);
      setGameActive(true);
    } catch (err) {
      setError("Failed to fetch puzzle. Please try again.");
    }
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  function handleCellClick(row, col) {
    if (!gameActive) return;

    // Cell already selected: don't allow duplicates in a single selection sequence
    if (
      selectedCells.some(
        ([r, c]) => r === row && c === col
      )
    ) {
      return;
    }
    // For simplicity: add or remove
    setSelectedCells([...selectedCells, [row, col]]);
  }

  // PUBLIC_INTERFACE
  function handleWordSelect() {
    if (!puzzle || selectedCells.length < 2) return;
    // Build the selected string (adjacent in grid)
    const str = selectedCells
      .map(
        ([r, c]) =>
          puzzle.grid[r] && puzzle.grid[r][c] ? puzzle.grid[r][c] : ""
      )
      .join("")
      .toUpperCase();

    // Check both directions: normal and reverse
    let found = wordsToFind.find(
      (w) => w === str || w === str.split("").reverse().join("")
    );
    if (found) {
      setFoundWords([...foundWords, found]);
      setWordsToFind(wordsToFind.filter((w) => w !== found));
      setSelectedCells([]);
      // If puzzle finished
      if (wordsToFind.length === 1) {
        endGameSuccess();
      }
    } else {
      setSelectedCells([]);
    }
  }

  // PUBLIC_INTERFACE
  const endGameSuccess = () => {
    setGameActive(false);
    setStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesWon: prev.gamesWon + 1,
      lastResult: "Win",
      bestTime:
        !prev.bestTime || elapsedTime < prev.bestTime
          ? elapsedTime
          : prev.bestTime,
    }));
  };

  // PUBLIC_INTERFACE
  const endGameQuit = () => {
    setGameActive(false);
    setStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      lastResult: "Quit",
    }));
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Helpers for rendering
  function getCellSelectedClass(rowIdx, colIdx) {
    return selectedCells.some(([r, c]) => r === rowIdx && c === colIdx)
      ? "cell-selected"
      : "";
  }
  function getCellFoundWordClass(rowIdx, colIdx) {
    // If cell is part of any found word, highlight differently
    for (let w of foundWords) {
      let startIdx = -1;
      // Search row
      for (let r = 0; r < puzzle.grid.length; r++) {
        let rowString = puzzle.grid[r].join("");
        startIdx = rowString.indexOf(w);
        if (startIdx !== -1) {
          if (
            r === rowIdx &&
            colIdx >= startIdx &&
            colIdx < startIdx + w.length
          )
            return "cell-found-word";
        }
        // Also check reversed
        let rowRevIdx = rowString.indexOf(w.split("").reverse().join(""));
        if (rowRevIdx !== -1) {
          if (
            r === rowIdx &&
            colIdx >= rowRevIdx &&
            colIdx < rowRevIdx + w.length
          )
            return "cell-found-word";
        }
      }
      // Search col
      for (let c = 0; c < puzzle.grid[0].length; c++) {
        let colString = puzzle.grid.map((row) => row[c]).join("");
        let colIdxFound = colString.indexOf(w);
        if (colIdxFound !== -1) {
          if (
            colIdx === c &&
            rowIdx >= colIdxFound &&
            rowIdx < colIdxFound + w.length
          )
            return "cell-found-word";
        }
        let colRevIdx = colString.indexOf(w.split("").reverse().join(""));
        if (colRevIdx !== -1) {
          if (
            colIdx === c &&
            rowIdx >= colRevIdx &&
            rowIdx < colRevIdx + w.length
          )
            return "cell-found-word";
        }
      }
    }
    return "";
  }

  // PUBLIC_INTERFACE
  function handleSettingsChange(e, setFunc) {
    setFunc(e.target.value);
  }

  // --- Render: MAIN JSX ---
  return (
    <div className="App" style={{ fontFamily: "Segoe UI, sans-serif", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Header and Navigation */}
      <header style={{
        width: "100%",
        padding: "0",
        boxShadow: "0 1px 6px rgba(60,60,60,0.08)",
        background: COLORS.primary,
        color: "#fff",
        minHeight: "54px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 1.8rem"}}>
          <span style={{ fontWeight: "bold", fontSize: "1.42rem", letterSpacing: ".05em" }}>
            <span style={{ color: COLORS.accent }}>Word</span>
            <span style={{ color: "#fff" }}>Quest</span>
          </span>
          <nav style={{ marginLeft: "2rem", color: "#fff" }}>
            <a href="#" style={{ color: "#fff", textDecoration: "none", fontWeight: 500, marginRight: "18px" }}>
              Play
            </a>
            <a href="#" style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}>
              Leaderboard
            </a>
          </nav>
        </div>
        <div>
          <button className="theme-toggle" style={{
            backgroundColor: COLORS.accent,
            color: "#272727"
          }} onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </header>

      {/* Main Section: Responsive flex row */}
      <main style={{
        display: "flex",
        flexDirection: "row",
        minHeight: "calc(100vh - 106px)", // header+footer
        padding: "0",
        background: "var(--bg-primary)"
      }}>
        {/* Main Content Area: Game Board */}
        <div style={{
          flex: 3,
          minWidth: 0,
          padding: "2rem 1.5rem 1rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          {/* Game header/controls */}
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", width: "100%" }}>
            <div>
              <label>
                <strong>Difficulty:</strong>{" "}
                <select
                  value={difficulty}
                  onChange={(e) => handleSettingsChange(e, setDifficulty)}
                  disabled={gameActive}
                  style={{ padding: "6px 10px", borderRadius: "6px" }}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label>
                <strong>Topic:</strong>{" "}
                <select
                  value={topic}
                  onChange={(e) => handleSettingsChange(e, setTopic)}
                  disabled={gameActive}
                  style={{ padding: "6px 10px", borderRadius: "6px" }}
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              disabled={loading || gameActive}
              style={{
                background: COLORS.primary,
                color: "#fff",
                borderRadius: "6px",
                padding: "8px 20px",
                fontWeight: 500,
                border: "none",
                marginLeft: "16px"
              }}
              onClick={fetchPuzzle}
            >
              {loading ? "Loading..." : "New Puzzle"}
            </button>
            {gameActive && (
              <button
                style={{
                  background: COLORS.secondary,
                  color: "#fff",
                  borderRadius: "6px",
                  padding: "8px 20px",
                  fontWeight: 500,
                  border: "none",
                  marginLeft: "12px"
                }}
                onClick={endGameQuit}
              >
                Quit
              </button>
            )}
          </div>
          {/* Game Timer */}
          {gameActive && (
            <div style={{
              color: COLORS.accent,
              fontWeight: 600,
              marginBottom: "1.5rem",
              fontSize: "18px"
            }}>
              ⏱️ Time: {Math.floor(elapsedTime / 60)}:
              {(elapsedTime % 60).toString().padStart(2, "0")}
            </div>
          )}
          {/* Game Grid */}
          <div
            style={{
              border: `2px solid ${COLORS.primary}`,
              borderRadius: "15px",
              background: "#F7F9FE",
              boxShadow: "0 2px 14px rgba(60,60,60,.09)",
              overflow: "auto",
              minWidth: "250px",
              minHeight: "285px",
              padding: "22px 16px 10px 16px"
            }}
          >
            {!puzzle ? (
              <div
                style={{
                  color: COLORS.secondary,
                  fontWeight: 500,
                  margin: "1.7em 0"
                }}
              >
                Start a new puzzle to play!
              </div>
            ) : (
              <table className="puzzle-table" style={{ margin: "0 auto", borderCollapse: "collapse" }}>
                <tbody>
                  {puzzle.grid.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((cell, colIdx) => (
                        <td
                          key={`${rowIdx}-${colIdx}`}
                          className={`puzzle-cell ${getCellSelectedClass(rowIdx, colIdx)} ${getCellFoundWordClass(rowIdx, colIdx)}`}
                          style={{
                            width: 36,
                            height: 36,
                            textAlign: "center",
                            verticalAlign: "middle",
                            fontSize: "1.19em",
                            fontWeight: 600,
                            cursor: gameActive ? "pointer" : "not-allowed",
                            background: getCellSelectedClass(rowIdx, colIdx)
                              ? COLORS.accent
                              : getCellFoundWordClass(rowIdx, colIdx)
                                ? "#c8e6c9"
                                : "#fff",
                            color: getCellSelectedClass(rowIdx, colIdx)
                              ? "#2a2a2a"
                              : "#253547",
                            border: `1.5px solid ${COLORS.primary}`,
                            borderRadius: 6,
                            userSelect: "none",
                            transition: "background .22s"
                          }}
                          onClick={() => handleCellClick(rowIdx, colIdx)}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Selection controls */}
          <div style={{ display: "flex", gap: "16px", margin: "1.3em 0 .8em 0", alignItems: "center" }}>
            {gameActive && !!puzzle && (
              <button
                style={{
                  background: COLORS.accent,
                  color: "#222",
                  borderRadius: "6px",
                  padding: "8px 30px",
                  fontWeight: 600,
                  fontSize: "1.09em",
                  border: "none",
                  boxShadow: "0 2px 10px #ffc10714"
                }}
                onClick={handleWordSelect}
                disabled={selectedCells.length < 2}
              >
                {selectedCells.length > 1 ? "Check Selection" : "Select Word"}
              </button>
            )}
            {!!error && (
              <span style={{ color: "#C62828", fontSize: ".98em", fontWeight: 500, marginLeft: 16 }}>
                {error}
              </span>
            )}
          </div>

          {/* Words List */}
          {puzzle && (
            <div style={{ margin: "1.0em 0 .3em 0", width: "100%" }}>
              <div style={{ fontSize: "1.08em", fontWeight: "bold", marginBottom: 4, letterSpacing: ".02em" }}>
                Words to Find <span role="img" aria-label="words">🔎</span>
              </div>
              <ul style={{ display: "flex", flexWrap: "wrap", gap: "12px", listStyle: "none", margin: 0, padding: 0 }}>
                {puzzle.words.map((word) => (
                  <li
                    key={word}
                    style={{
                      background: foundWords.includes(word) ? "#e3ffc1" : "#f4f4f4",
                      color: foundWords.includes(word) ? "#219a5d" : "#333",
                      fontWeight: 600,
                      border: foundWords.includes(word) ? `2.2px solid #219a5d` : `2.2px solid #eeeeee`,
                      borderRadius: "6px",
                      padding: "5px 13px",
                      fontSize: ".98em",
                      textDecoration: foundWords.includes(word)
                        ? "line-through"
                        : "none",
                      transition: "all .24s"
                    }}
                  >
                    {word}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Game completion message */}
          {puzzle && !gameActive && foundWords.length === puzzle.words.length && (
            <div style={{ color: COLORS.primary, fontWeight: "bold", fontSize: "1.5em", marginTop: 18 }}>
              🎉 Congratulations, puzzle complete!
            </div>
          )}
        </div>
        {/* Side panel (Responsive: stacks below on mobile) */}
        <aside
          style={{
            flex: 1.15,
            maxWidth: 320,
            minWidth: 220,
            background: "var(--bg-secondary)",
            borderLeft: `3px solid ${COLORS.primary}22`,
            boxShadow: "0 0px 9px rgba(0,0,0,.03)",
            padding: "2.2em 1.4em 1.5em .7em",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            gap: "2.8em",
            minHeight: "80vh"
          }}
        >
          {/* Stats panel */}
          <div>
            <h3 style={{ color: COLORS.secondary, margin: "0 0 9px 0" }}>
              <span>Stats</span>
              <button
                onClick={() => setShowStats((show) => !show)}
                style={{
                  float: "right",
                  background: "none",
                  border: "none",
                  color: COLORS.primary,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "1em",
                  marginTop: "-1px",
                  padding: 0
                }}
                aria-label={showStats ? "Hide stats" : "Show stats"}
              >
                {showStats ? "−" : "+"}
              </button>
            </h3>
            {showStats && (
              <div style={{ fontSize: ".99em" }}>
                <div>
                  <strong>Games Played:</strong> {stats.gamesPlayed}
                </div>
                <div>
                  <strong>Games Won:</strong> {stats.gamesWon}
                </div>
                <div>
                  <strong>Last Result:</strong>{" "}
                  {stats.lastResult || <span style={{ color: "#aaa" }}>N/A</span>}
                </div>
                <div>
                  <strong>Best Time:</strong>{" "}
                  {stats.bestTime !== null
                    ? `${Math.floor(stats.bestTime / 60)}:${(stats.bestTime % 60)
                      .toString()
                      .padStart(2, "0")}`
                    : <span style={{ color: "#aaa" }}>--</span>}
                </div>
              </div>
            )}
          </div>
          {/* Settings panel */}
          <div>
            <h3 style={{ color: COLORS.secondary, margin: "0 0 10px 0" }}>Settings</h3>
            <div style={{ fontSize: ".99em", lineHeight: "2em" }}>
              <div>
                <label>
                  Difficulty:{" "}
                  <select
                    value={difficulty}
                    onChange={(e) => handleSettingsChange(e, setDifficulty)}
                    disabled={gameActive}
                    style={{ padding: "5px 10px", borderRadius: "6px" }}
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Topic:{" "}
                  <select
                    value={topic}
                    onChange={(e) => handleSettingsChange(e, setTopic)}
                    disabled={gameActive}
                    style={{ padding: "5px 10px", borderRadius: "6px" }}
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div style={{ marginTop: "8px" }}>
                <button
                  onClick={() => {
                    setStats({ ...DEFAULT_STATS });
                  }}
                  style={{
                    background: "#fafafa",
                    color: COLORS.secondary,
                    border: "1px solid #ddd",
                    padding: "6px 10px",
                    borderRadius: "5px",
                    fontWeight: 500,
                    fontSize: ".95em"
                  }}>
                  Reset Stats
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>
      {/* Footer */}
      <footer
        style={{
          background: COLORS.secondary,
          color: "#fff",
          minHeight: "52px",
          padding: "0 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: ".97em",
          letterSpacing: ".01em"
        }}
      >
        <div>
          &copy; {new Date().getFullYear()} WordQuest &middot;{" "}
          <span style={{ color: COLORS.accent }}>A Minimalistic Word Search Game</span>
        </div>
        <div style={{ opacity: .82 }}>
          Made with <span style={{ color: COLORS.accent }}>React</span>
        </div>
      </footer>
      {/* Responsive styles */}
      <style>
        {`
        @media (max-width: 1145px) {
          main {
            flex-direction: column !important;
          }
          aside {
            max-width: 100vw !important;
            border-left: none !important;
            border-top: 2.5px solid ${COLORS.primary}22;
          }
        }
        @media (max-width: 830px) {
          main {
            flex-direction: column !important;
            padding-bottom: 1em !important;
          }
          aside {
            max-width: 100vw !important;
            min-width: unset !important;
            border-left: none !important;
            border-top: 2.5px solid ${COLORS.primary}22;
            margin-bottom: 2em !important;
          }
        }
        .puzzle-cell {
          transition: background .21s, color .21s, border .21s;
        }
        .cell-selected {
          border: 2.3px solid ${COLORS.accent} !important;
        }
        .cell-found-word {
          background: #e3ffc1 !important;
          color: #14592e !important;
          border: 2px solid #3dc859 !important;
        }
        `}
      </style>
    </div>
  );
}

export default App;
