import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";

export default function CountdownTimer() {
  const [time, setTime] = useState(0); // Total time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = window.setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, time]);

  const handleStartPause = () => {
    if (time > 0) setIsRunning(!isRunning);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Button
        variant="outline"
        onClick={() => {
          const minutes = prompt("Set timer (minutes):", "");
          if (minutes && !isNaN(Number(minutes))) {
            setTime(Number(minutes) * 60);
          }
        }}
        disabled={isRunning}
      >
        Set a timer
      </Button>

      <div className="text-5xl font-semibold tabular-nums">
        {formatTime(time)}
      </div>

      <button
        className="rounded-full border-2 border-black p-4 w-16 h-16 flex items-center justify-center"
        onClick={handleStartPause}
        disabled={time === 0}
      >
        {isRunning ? "⏸︎" : "▶︎"}
      </button>

      <div className="text-sm">
        {isRunning ? "Reading..." : "Start reading"}
      </div>
    </div>
  );
}
