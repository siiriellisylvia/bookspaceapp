import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function CountdownTimer() {
  const [time, setTime] = useState(0); // Total time in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState("30"); // Default to 30 minutes
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
    if (!isRunning && time === 0) {
      // Convert minutes to seconds
      const totalSeconds = parseInt(minutes) * 60;

      if (totalSeconds > 0) {
        setTime(totalSeconds);
        setIsRunning(true);
      }
    } else if (time > 0) {
      setIsRunning(!isRunning);
    }
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const handleMinutesChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, "");
    setMinutes(value);
  };

  const handlePresetMinutes = (presetMinutes: number) => {
    setMinutes(presetMinutes.toString());
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {!isRunning && time === 0 ? (
        <>
          <div className="w-full flex flex-col items-center gap-2">
            <label htmlFor="minutes-input" className="text-sm">
              Set reading time in minutes:
            </label>
            <Input
              id="minutes-input"
              type="text"
              value={minutes}
              onChange={handleMinutesChange}
              className="w-24 text-center text-xl"
              inputMode="numeric"
              aria-label="Minutes"
              maxLength={3}
            />
          </div>

          <div className="flex justify-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetMinutes(15)}
              className="px-3 py-1"
            >
              15
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetMinutes(30)}
              className="px-3 py-1"
            >
              30
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePresetMinutes(45)}
              className="px-3 py-1"
            >
              45
            </Button>
          </div>
        </>
      ) : (
        <div className="text-5xl font-semibold tabular-nums">
          {formatTime(time)}
        </div>
      )}

      <button
        className="rounded-full border-2 border-primary-beige p-4 w-16 h-16 flex items-center justify-center mt-4"
        onClick={handleStartPause}
        disabled={
          !isRunning && (parseInt(minutes) <= 0 || isNaN(parseInt(minutes)))
        }
      >
        {!isRunning && time === 0 ? "▶︎" : isRunning ? "⏸︎" : "▶︎"}
      </button>

      <div className="text-sm mb-1">
        {isRunning
          ? "Reading..."
          : time > 0
            ? "Reading paused"
            : "Start reading timer"}
      </div>

      {(isRunning || time > 0) && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetTimer}
          className="text-xs mt-1"
        >
          Set new timer
        </Button>
      )}
    </div>
  );
}
