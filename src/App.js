import { useEffect, useState } from "react";
import "./App.css";
import words from "./wordle-words.js";

const WORD_LENGTH = 5;

function App() {
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [badLetters, setBadLetters] = useState([]);

  // Handle keyboard input
  const handleInput = (key) => {
    if (gameOver) {
      return;
    }

    if (key === "Enter") {
      if (currentGuess.length !== WORD_LENGTH) {
        return;
      }

      if (!words.includes(currentGuess.toUpperCase())) {
        setErrorMessage("Word not found");
        setTimeout(() => setErrorMessage(""), 1500);
        return;
      }

      const isCorrect = solution === currentGuess;
      if (isCorrect) {
        setGameOver(true);
      }

      const newGuesses = [...guesses];
      newGuesses[guesses.findIndex((val) => val === null)] = currentGuess;
      setGuesses(newGuesses);
      setCurrentGuess("");

      if (!isCorrect && newGuesses.every((guess) => guess !== null)) {
        setGameOver(true);
        setErrorMessage(`The word was: ${solution.toUpperCase()}`);
        return;
      }

      // Add grey letters to badLetters
      const newBadLetters = [...badLetters];
      currentGuess.split("").forEach((char, index) => {
        if (!solution.includes(char) || solution[index] !== char) {
          if (!newBadLetters.includes(char)) {
            newBadLetters.push(char);
          }
        }
      });
      setBadLetters(newBadLetters);
    }

    if (key === "Backspace") {
      setCurrentGuess(currentGuess.slice(0, -1));
      return;
    }

    if (currentGuess.length >= 5) {
      return;
    }

    const isLetter = key.match(/^[a-z]{1}$/) != null;
    if (isLetter) {
      setCurrentGuess((oldGuess) => oldGuess + key);
    }
  };

  // Called when the user presses a key
  useEffect(() => {
    const handleType = (event) => {
      handleInput(event.key);
    };

    window.addEventListener("keydown", handleType);

    return () => window.removeEventListener("keydown", handleType);
  }, [currentGuess, gameOver, solution, guesses]);

  // Fetch a random word from the list of words
  useEffect(() => {
    const fetchWord = () => {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      setSolution(randomWord.toLowerCase());
    };

    fetchWord();
  }, []);

  return (
    <div className="game-container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <div className="board">
        {guesses.map((guess, index) => {
          const isCurrentGuess =
            index === guesses.findIndex((val) => val === null);
          return (
            <Line
              key={index}
              guess={isCurrentGuess ? currentGuess.toUpperCase() : guess ?? ""}
              isFinal={!isCurrentGuess && guess != null}
              solution={solution}
            />
          );
        })}
      </div>
      <Keyboard onKeyPress={handleInput} badLetters={badLetters} />
      <Footer />
    </div>
  );
}

// Line component to display each guess
function Line({ guess, isFinal, solution }) {
  const tiles = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i];
    let className = "tile";

    if (isFinal) {
      const solutionCharCount = solution
        .split("")
        .filter((c) => c === char).length;
      const guessCharCount = guess
        .slice(0, i + 1)
        .split("")
        .filter((c) => c === char).length;

      if (char === solution[i]) {
        className += " correct";
      } else if (
        solution.includes(char) &&
        guessCharCount <= solutionCharCount
      ) {
        className += " close";
      } else {
        className += " incorrect";
      }
    }

    tiles.push(
      <div key={i} className={className}>
        {char}
      </div>
    );
  }
  return <div className="line">{tiles}</div>;
}

// Keyboard component for on-screen input
function Keyboard({ onKeyPress, badLetters }) {
  const keys = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  return (
    <div className="keyboard">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="keyboard-row">
          {row.split("").map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key.toLowerCase())}
              disabled={badLetters.includes(key.toLowerCase())}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="keyboard-row">
        <button onClick={() => onKeyPress("Backspace")}>Backspace</button>
        <button onClick={() => onKeyPress("Enter")}>Enter</button>
      </div>
    </div>
  );
}

// Footer component for GitHub link
function Footer() {
  return (
    <footer className="footer">
      <a
        href="https://github.com/r-askarov/wordle-clone"
        target="_blank"
        rel="noopener noreferrer"
      >
        View the GitHub Repository
      </a>
    </footer>
  );
}

export default App;
