"use client";
import { useState, useEffect } from "react";

export default function MemoryGame() {
  const [numbers, setNumbers] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [chips, setChips] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [username, setUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize localStorage values after mounting
  useEffect(() => {
    if (typeof window !== "undefined") {
      setScore(parseInt(localStorage.getItem("score")) || 0);
      setChips(parseInt(localStorage.getItem("chips")) || 0);
      const storedUsername = localStorage.getItem("username") || "";
      setUsername(storedUsername);
      setIsAuthenticated(!!storedUsername);
    }
  }, []);

  // Persist score and chips in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("score", score);
      localStorage.setItem("chips", chips);
    }
  }, [score, chips]);

  // Generate numbers for the game board
  const generateNumbers = (lvl) => {
    const size = lvl + 2;
    const totalCells = size * size;
    const numPairs = Math.floor(totalCells / 2);
    let numArray = Array.from({ length: numPairs }, (_, i) => [i, i]).flat();

    while (numArray.length < totalCells) {
      numArray.push(-1);
    }

    numArray.sort(() => Math.random() - 0.5);
    setNumbers(numArray);
    setFlipped(Array(totalCells).fill(false));
    setGameOver(false);
  };

  useEffect(() => {
    if (isAuthenticated) generateNumbers(level);
  }, [level, isAuthenticated]);

  const handleClick = (index) => {
    if (
      flipped[index] ||
      selected.length === 2 ||
      numbers[index] === -1 ||
      gameOver
    )
      return;

    const newFlipped = [...flipped];
    newFlipped[index] = true;
    setFlipped(newFlipped);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setTimeout(() => {
        if (numbers[newSelected[0]] === numbers[newSelected[1]]) {
          setScore((prevScore) => prevScore + 1);

          if (score + 1 === Math.floor(numbers.length / 2)) {
            setLevel((prevLevel) => prevLevel + 1);
            setScore(0);
            setChips((prevChips) => prevChips + 10);
          }
        } else {
          setGameOver(true);
          setTimeout(() => {
            generateNumbers(level);
          }, 1000);
        }
        setSelected([]);
      }, 1000);
    }
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setChips(0);
    generateNumbers(1);
    if (typeof window !== "undefined") {
      localStorage.setItem("score", "0");
      localStorage.setItem("chips", "0");
    }
  };

  const handleLogin = () => {
    if (username.trim()) {
      if (typeof window !== "undefined") {
        localStorage.setItem("username", username);
      }
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("username");
    }
    setIsAuthenticated(false);
    setUsername("");
  };

  return (
    <div className="flex flex-col items-center pt-10">
      {!isAuthenticated ? (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl">WinCash Login</h1>
          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="border px-2 py-1"
          />
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Login
          </button>
        </div>
      ) : (
        <>
          <div className="flex flex-row justify-between w-full px-10 mb-[50px]">
            <div className="flex flex-row gap-20">
              <h1 className="text-2xl">WinCash</h1>
              <h2 className="text-xl">User: {username}</h2>
              <h2 className="text-xl">Score: {score}</h2>
              <h2 className="text-xl">Chips: {chips}</h2>
              <h2 className="text-xl">Level: {level}</h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Reset Game
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Logout
              </button>
            </div>
          </div>
          <div
            className="grid place-items-center mt-40"
            style={{ gridTemplateColumns: `repeat(${level + 2}, 1fr)` }}
          >
            {numbers.map((num, index) => (
              <div
                key={index}
                className={`w-20 h-20 flex items-center justify-center border border-gray-500 text-xl cursor-pointer ${
                  gameOver ? "bg-red-500" : ""
                }`}
                onClick={() => handleClick(index)}
              >
                {flipped[index] || num === -1 ? (num !== -1 ? num : "") : "?"}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
