import { useState, useEffect, useRef } from "react";
import moleImg from "./assets/mole.png";
import funnyAudioFile from "./assets/funny.mp3";
import cryingVideo from "./assets/crying.mp4";
import laughingVideo from "./assets/laughing.mp4";
import "./App.css";

const GRID_SIZE = 5;
const GAME_DURATION = 15000; 
const MOLE_INTERVAL = 600;

function App() {
  const [activeMole, setActiveMole] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showCryingVideo, setShowCryingVideo] = useState(false);
  const [showLaughingVideo, setShowLaughingVideo] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [gameStarted, setGameStarted] = useState(false);

  const molePopCountRef = useRef(0);
  const funnyAudioRef = useRef(null);
  const moleIntervalRef = useRef(null);
  const timerRef = useRef(null);

  // Initialize funny audio
  useEffect(() => {
    funnyAudioRef.current = new Audio(funnyAudioFile);
  }, []);

  // Mole popping & timer logic
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Mole pops
    moleIntervalRef.current = setInterval(() => {
      const randomCell = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      setActiveMole(randomCell);

      molePopCountRef.current += 1;
      if (molePopCountRef.current === 4 && funnyAudioRef.current) {
        funnyAudioRef.current.loop = true;
        funnyAudioRef.current.play().catch(() => {});
      }
    }, MOLE_INTERVAL);

    // Game timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(moleIntervalRef.current);
          setActiveMole(null);
          if (funnyAudioRef.current) {
            funnyAudioRef.current.pause();
            funnyAudioRef.current.currentTime = 0;
          }
          setGameOver(true);
          setShowLaughingVideo(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(moleIntervalRef.current);
      clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver]);

  // Hit mole
  const hitMole = (index) => {
    if (index === activeMole && !gameOver) {
      setGameOver(true);
      setActiveMole(null);
      if (funnyAudioRef.current) {
        funnyAudioRef.current.pause();
        funnyAudioRef.current.currentTime = 0;
      }
      setShowCryingVideo(true);
    }
  };

  const handleCryingVideoEnd = () => {
    setShowCryingVideo(false);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setActiveMole(null);
    molePopCountRef.current = 0;
    setTimeLeft(GAME_DURATION / 1000);
    setShowCryingVideo(false);
    setShowLaughingVideo(false);
    if (funnyAudioRef.current) {
      funnyAudioRef.current.pause();
      funnyAudioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="App">
      <h1>Whack-a-Mole</h1>
      <p className="score">Time Left: {timeLeft}s</p>

      {/* Fixed button position */}
      <div className="button-container">
        {!gameStarted || gameOver ? (
          <button className="restart-btn" onClick={startGame}>
            {!gameStarted ? "Start Game" : "Restart Game"}
          </button>
        ) : null}
      </div>

      {/* Grid always visible */}
      <div className="grid">
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
          <div key={index} className="cell">
            <div
              className={`mole-container ${activeMole === index ? "active" : ""}`}
              onClick={() => hitMole(index)}
            >
              <img src={moleImg} alt="Mole" className="mole-image" />
            </div>
          </div>
        ))}
      </div>

      {/* Crying video overlay */}
      {showCryingVideo && (
        <div className="overlay-video">
          <video src={cryingVideo} autoPlay onEnded={handleCryingVideoEnd} />
        </div>
      )}

      {/* Laughing video overlay */}
      {showLaughingVideo && (
        <div className="overlay-video">
          <video src={laughingVideo} autoPlay loop />
        </div>
      )}
    </div>
  );
}

export default App;
