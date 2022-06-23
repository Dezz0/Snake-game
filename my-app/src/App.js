import React, { useState, useRef, useEffect } from "react";
import { useInterval } from "./useInterval";
import { CANVAS_SIZE, SNAKE_START, APPLE_START, SCALE, DIRECTIONS } from "./constants";

const arrayRadio = [
  { id: "radio-1", text: "Обычная", value: 100 },
  { id: "radio-2", text: "Быстрая", value: 50 },
  { id: "radio-3", text: "Безумная", value: 25 }
];

export default function App() {
  const canvasRef = useRef();
  const ref = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [apple, setApple] = useState(APPLE_START);
  const [dir, setDir] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [floatSpeed, setFloatSpeed] = useState(null);
  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [acceleratedMode, setAcceleratedMode] = useState(false);
  const [count, setCount] = useState(0);

  const startGame = () => {
    ref.current.focus();
    setSnake(SNAKE_START);
    setApple(APPLE_START);
    setDir([0, -1]);
    setSpeed(floatSpeed);
    setGameOver(false);
    setGameIsStarted(true);
    setCount(0);
  };

  const endGame = () => {
    setSpeed(null);
    setGameOver(true);
    setGameIsStarted(false);
  };

  const moveSnake = (e) => {
    let keyCode = e.keyCode;
    if (keyCode >= 37 && keyCode <= 40) {
      e.preventDefault();
    }

    if (keyCode === 38 && JSON.stringify(dir) === JSON.stringify([0, 1])) return;
    if (keyCode === 40 && JSON.stringify(dir) === JSON.stringify([0, -1])) return;
    if (keyCode === 37 && JSON.stringify(dir) === JSON.stringify([1, 0])) return;
    if (keyCode === 39 && JSON.stringify(dir) === JSON.stringify([-1, 0])) return;

    keyCode >= 37 && keyCode <= 40 && setDir(DIRECTIONS[keyCode]);
  };

  const createApple = () => {
    return apple.map((_a, i) => Math.floor(Math.random() * (CANVAS_SIZE[i] / SCALE)));
  };

  const checkCollision = (piece, snk = snake) => {
    if (piece[0] * SCALE >= CANVAS_SIZE[0] || piece[0] < 0 || piece[1] * SCALE >= CANVAS_SIZE[1] || piece[1] < 0)
      return true;

    for (const segment of snk) {
      if (piece[0] === segment[0] && piece[1] === segment[1]) return true;
    }
    return false;
  };

  const checkAppleCollision = (newSnake) => {
    if (newSnake[0][0] === apple[0] && newSnake[0][1] === apple[1]) {
      if (acceleratedMode && speed > 20) {
        setSpeed(speed - 5);
      }
      setCount(count + 1);
      let newApple = createApple();
      while (checkCollision(newApple, newSnake)) {
        newApple = createApple();
      }
      setApple(newApple);
      return true;
    }
    return false;
  };

  const gameLoop = () => {
    const snakeCopy = JSON.parse(JSON.stringify(snake));
    const newSnakeHead = [snakeCopy[0][0] + dir[0], snakeCopy[0][1] + dir[1]];
    snakeCopy.unshift(newSnakeHead);
    if (checkCollision(newSnakeHead)) endGame();
    if (!checkAppleCollision(snakeCopy)) snakeCopy.pop();
    setSnake(snakeCopy);
  };

  useInterval(() => gameLoop(), speed);

  useEffect(() => {
    const context = canvasRef.current.getContext("2d");
    context.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "pink";
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    context.fillStyle = "lightblue";
    context.fillRect(apple[0], apple[1], 1, 1);
  }, [snake, apple, gameOver]);

  const handleChangeModeGame = () => {
    setAcceleratedMode(!acceleratedMode);
    !acceleratedMode ? setFloatSpeed(150) : setFloatSpeed(null);
  };

  return (
    <>
      <div className="snake-game" ref={ref} tabIndex="0" onKeyDown={(e) => moveSnake(e)}>
        <canvas ref={canvasRef} width={`${CANVAS_SIZE[0]}px`} height={`${CANVAS_SIZE[1]}px`} />
        {gameOver && <h2 className="popup">Игра окончена. Cчет: {count}</h2>}
      </div>
      <div className="right-panel">
        <h2>Текущий счет: {count}</h2>

        <button className="start_btn" onClick={startGame} disabled={!floatSpeed ? true : false || gameIsStarted}>
          Старт
        </button>

        <p>Выберите скорость:</p>
        {arrayRadio.map((radiobtn) => (
          <div key={radiobtn.id} className="form_radio_btn">
            <input
              id={radiobtn.id}
              type="radio"
              name="radio"
              value={radiobtn.value}
              onChange={(e) => setFloatSpeed(e.target.value)}
              disabled={acceleratedMode || gameIsStarted}
            />
            <label htmlFor={radiobtn.id}>{radiobtn.text}</label>
          </div>
        ))}
        <div>
          <input type="checkbox" placeholder="1" onChange={handleChangeModeGame} id="cb1" disabled={gameIsStarted} />
          <label className="cb" htmlFor="cb1">
            Режим с ускорением
          </label>
        </div>
      </div>
    </>
  );
}
