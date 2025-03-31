import React, { useState, useEffect } from "react";
import "./App.css";
import { db, collection, addDoc, getDocs } from "./firebaseConfig";

const colors = ["red", "blue", "green", "yellow"];

const App = () => {
  const [sequence, setSequence] = useState([]);
  const [userSequence, setUserSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [message, setMessage] = useState("Presiona 'Iniciar' para jugar");
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (userSequence.length > 0) {
      checkUserInput();
    }
  }, [userSequence]);

  useEffect(() => {
    fetchScores();
  }, []);

  const generateNextStep = () => {
    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    setSequence((prev) => [...prev, nextColor]);
    setUserSequence([]);
    setIsPlaying(true);
    setMessage("Observa la secuencia...");
    setCurrentStep(0);

    setTimeout(() => {
      playSequence([...sequence, nextColor]);
    }, 1000);
  };

  const playSequence = (seq) => {
    seq.forEach((color, index) => {
      setTimeout(() => {
        setCurrentStep(index + 1);
      }, (index + 1) * 1000);
    });

    setTimeout(() => {
      setMessage("Repite la secuencia");
    }, seq.length * 1000);
  };

  const checkUserInput = () => {
    const index = userSequence.length - 1;
    if (userSequence[index] !== sequence[index]) {
      setMessage("¡Perdiste! Inténtalo de nuevo.");
      setIsPlaying(false);
      saveScore(sequence.length - 1);
      setSequence([]);
      return;
    }

    if (userSequence.length === sequence.length) {
      setMessage("¡Bien hecho! Ahora un paso más...");
      setTimeout(() => generateNextStep(), 1000);
    }
  };

  const handleUserClick = (color) => {
    if (!isPlaying) return;
    setUserSequence([...userSequence, color]);
  };

  const saveScore = async (score) => {
    try {
      await addDoc(collection(db, "scores"), { score, timestamp: new Date() });
      console.log("Puntuación guardada:", score);
      fetchScores();
    } catch (error) {
      console.error("Error al guardar la puntuación:", error);
    }
  };

  const fetchScores = async () => {
    try {
      const scoresCollection = await getDocs(collection(db, "scores"));
      const scoresList = scoresCollection.docs.map((doc) => doc.data());
      setScores(scoresList);
    } catch (error) {
      console.error("Error al obtener las puntuaciones:", error);
    }
  };

  return (
    <div className="game-container">
      <h1>Memoria Rápida</h1>
      <p>{message}</p>
      <div className="game-board">
        {colors.map((color) => (
          <div
            key={color}
            className={`color-btn ${color} ${
              sequence[currentStep - 1] === color ? "active" : ""
            }`}
            onClick={() => handleUserClick(color)}
          ></div>
        ))}
      </div>
      <button onClick={generateNextStep} disabled={isPlaying}>
        Iniciar
      </button>
      <h2>Puntuaciones</h2>
      <ul>
        {scores.map((score, index) => (
          <li key={index}>Puntaje: {score.score}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
