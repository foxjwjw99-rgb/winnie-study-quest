import { useState, useEffect, useCallback, useRef } from 'react';

interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  completedPomodoros: number;
}

interface UsePomodoroOptions {
  workDuration?: number; // in minutes
  breakDuration?: number; // in minutes
  onComplete?: () => void;
}

export const usePomodoro = (options: UsePomodoroOptions = {}) => {
  const {
    workDuration = 25,
    breakDuration = 5,
    onComplete
  } = options;

  const [state, setState] = useState<PomodoroState>({
    timeLeft: workDuration * 60,
    isRunning: false,
    isBreak: false,
    completedPomodoros: 0,
  });

  const intervalRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (state.timeLeft === 0) {
      if (!state.isBreak) {
        // Work session completed
        setState((prev) => ({
          ...prev,
          completedPomodoros: prev.completedPomodoros + 1,
          isBreak: true,
          timeLeft: breakDuration * 60,
          isRunning: false,
        }));
        onCompleteRef.current?.();
      } else {
        // Break completed
        setState((prev) => ({
          ...prev,
          isBreak: false,
          timeLeft: workDuration * 60,
          isRunning: false,
        }));
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.timeLeft, state.isBreak, workDuration, breakDuration]);

  const start = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timeLeft: prev.isBreak ? breakDuration * 60 : workDuration * 60,
      isRunning: false,
    }));
  }, [workDuration, breakDuration]);

  const skip = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isBreak: !prev.isBreak,
      timeLeft: prev.isBreak ? workDuration * 60 : breakDuration * 60,
      isRunning: false,
    }));
  }, [workDuration, breakDuration]);

  return {
    ...state,
    start,
    pause,
    reset,
    skip,
  };
};
