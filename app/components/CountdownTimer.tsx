import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import type { ChangeEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CountdownTimerProps {
  onTimerComplete?: (elapsedMinutes: number) => void;
  onTimerStop?: (elapsedMinutes: number) => void;
  onTimerUpdate?: (elapsedMinutes: number) => void;
  onFinishReading?: () => void;
}

export interface CountdownTimerHandle {
  getCurrentElapsedMinutes: () => number;
}

const CountdownTimer = forwardRef<CountdownTimerHandle, CountdownTimerProps>(
  ({ onTimerComplete, onTimerStop, onTimerUpdate, onFinishReading }, ref) => {
    // Countdown in seconds (what's shown on screen)
    const [time, setTime] = useState(0); 
    
    // Whether timer is currently running
    const [isRunning, setIsRunning] = useState(false);
    
    // User input for timer duration
    const [minutes, setMinutes] = useState("30");
    
    // Store the initial timer value to calculate elapsed time
    const [initialSeconds, setInitialSeconds] = useState(0);
    
    // Track if timer completed to avoid state updates during render
    const [timerCompleted, setTimerCompleted] = useState(false);
    
    // Reference to clear the timer interval
    const intervalRef = useRef<number | undefined>(undefined);

    // Calculate current elapsed minutes based on initial time and remaining time
    const calculateElapsedMinutes = () => {
      if (initialSeconds === 0) return 0;
      
      const secondsUsed = initialSeconds - time;
      return Math.max(0, Math.ceil(secondsUsed / 60));
    };

    // Expose the current elapsed minutes calculation to parent component
    useImperativeHandle(ref, () => ({
      getCurrentElapsedMinutes: calculateElapsedMinutes
    }));

    // Handle timer completion in an effect, not during render
    useEffect(() => {
      if (timerCompleted) {
        const totalMinutes = Math.ceil(initialSeconds / 60);
        if (onTimerComplete) {
          onTimerComplete(totalMinutes);
        }
        setTimerCompleted(false);
      }
    }, [timerCompleted, initialSeconds, onTimerComplete]);

    // Update parent component with current elapsed time whenever timer changes
    useEffect(() => {
      if (initialSeconds > 0 && onTimerUpdate) {
        onTimerUpdate(calculateElapsedMinutes());
      }
    }, [time, initialSeconds, onTimerUpdate]);

    useEffect(() => {
      if (isRunning && time > 0) {
        intervalRef.current = window.setInterval(() => {
          setTime((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              setIsRunning(false);
              
              // Trigger timer completion callback
              setTimerCompleted(true);
              
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
        // Starting a new timer
        const totalSeconds = parseInt(minutes) * 60;

        if (totalSeconds > 0) {
          setTime(totalSeconds);
          setInitialSeconds(totalSeconds);
          setIsRunning(true);
        }
      } else if (time > 0) {
        setIsRunning(!isRunning);
      }
    };

    const resetTimer = () => {
      clearInterval(intervalRef.current);
      
      // Calculate minutes spent reading (initial time minus remaining time)
      if (initialSeconds > 0 && time >= 0) {
        const minutesUsed = calculateElapsedMinutes();
        
        if (onTimerStop && minutesUsed > 0) {
          onTimerStop(minutesUsed);
        }
      }
      
      // Reset timer state
      setIsRunning(false);
      setTime(0);
      setInitialSeconds(0);
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
      <div className="flex flex-col items-center justify-center gap-4 mt-1">
        {!isRunning && time === 0 && initialSeconds > 0 ? (
          // Timer completed state - show only the congratulatory message and button
          <div className="flex flex-col items-center gap-4 text-center">
            <h2>Well done, you've now read for {calculateElapsedMinutes()} minutes!</h2>
            
            {onFinishReading && (
              <Button 
                onClick={onFinishReading}
                variant="outline"
                className="mt-4"
              >
                Finish reading session
              </Button>
            )}
          </div>
        ) : (
          // All other states - show the timer controls
          <>
            {!isRunning && time === 0 ? (
              // Initial timer setup state
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
              // Timer running or paused state
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
                Delete timer
              </Button>
            )}
          </>
        )}
      </div>
    );
  }
);

CountdownTimer.displayName = "CountdownTimer";

export default CountdownTimer;
