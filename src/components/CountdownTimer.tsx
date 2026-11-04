'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle2, Timer } from 'lucide-react';

interface CountdownTimerProps {
  targetSeconds: number;
  restSeconds: number;
  onRestSecondsChange?: (newRestSeconds: number) => void;
  totalSets: number;
  exerciseName: string;
  onCompleteAllSets?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetSeconds,
  restSeconds,
  onRestSecondsChange,
  totalSets,
  exerciseName,
  onCompleteAllSets,
}) => {
  const effectiveDuration = targetSeconds > 0 ? targetSeconds : 45;
  const effectiveRest = restSeconds >= 5 ? restSeconds : 60;
  const [mode, setMode] = useState<'work' | 'prep' | 'rest'>('work');
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [secondsLeft, setSecondsLeft] = useState<number>(effectiveDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync when targetSeconds changes while timer is not running in work mode
  useEffect(() => {
    if (!isRunning && mode === 'work') {
      setSecondsLeft(targetSeconds > 0 ? targetSeconds : 45);
    }
  }, [targetSeconds, isRunning, mode]);

  // Sync when restSeconds changes while timer is not running in rest mode
  useEffect(() => {
    if (!isRunning && mode === 'rest') {
      setSecondsLeft(restSeconds >= 5 ? restSeconds : 60);
    }
  }, [restSeconds, isRunning, mode]);

  const playTone = useCallback(
    (freq: number, durationMs: number) => {
      if (!soundEnabled || typeof window === 'undefined') return;
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + durationMs / 1000);

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(durationMs);
        }
      } catch {
        // Ignore audio context restrictions
      }
    },
    [soundEnabled]
  );

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 4 && prev > 1) {
          playTone(520, 110);
        }
        if (prev <= 1) {
          playTone(880, 360);
          if (mode === 'prep') {
            setMode('work');
            return effectiveDuration;
          } else if (mode === 'work') {
            if (currentSet < totalSets) {
              setMode('rest');
              return effectiveRest;
            } else {
              setIsRunning(false);
              if (onCompleteAllSets) setTimeout(onCompleteAllSets, 0);
              return 0;
            }
          } else {
            setCurrentSet((s) => Math.min(totalSets, s + 1));
            setMode('work');
            return effectiveDuration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    mode,
    currentSet,
    totalSets,
    effectiveDuration,
    effectiveRest,
    playTone,
    onCompleteAllSets,
  ]);

  const totalForCurrentMode =
    mode === 'prep' ? 3 : mode === 'work' ? effectiveDuration : effectiveRest;
  const progressPct = Math.min(
    100,
    Math.max(0, ((totalForCurrentMode - secondsLeft) / totalForCurrentMode) * 100)
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartWithPrep = () => {
    if (!isRunning && secondsLeft === effectiveDuration && mode === 'work') {
      setMode('prep');
      setSecondsLeft(3);
      setIsRunning(true);
      playTone(440, 100);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setMode('work');
    setCurrentSet(1);
    setSecondsLeft(effectiveDuration);
  };

  const ringColor =
    mode === 'prep' ? '#38bdf8' : mode === 'work' ? '#10b981' : '#f59e0b';

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="rounded-2xl bg-slate-950/90 border border-slate-800 p-4 space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Circular Progress Ring */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="#1e293b"
              strokeWidth="9"
              fill="none"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke={ringColor}
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              {mode === 'prep'
                ? 'Bereit machen'
                : mode === 'work'
                ? `Halten / Satz ${currentSet}`
                : 'Satzpause'}
            </span>
            <span className="text-2xl font-extrabold text-white tabular-nums mt-0.5">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-[11px] text-slate-400">
              Satz {currentSet} / {totalSets}
            </span>
          </div>
        </div>

        {/* Info & Set Selector */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Timer className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm sm:text-base font-bold text-white">
              Integrierter Übungs- & Pausen-Countdown
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Startet mit 3 Sek. Vorbereitungszeit für{' '}
            <span className="text-slate-200 font-medium">{exerciseName}</span> und führt dich automatisch durch alle{' '}
            <span className="text-emerald-300 font-semibold">{totalSets} Sätze</span> inkl.{' '}
            <span className="text-amber-300 font-semibold">{effectiveRest} Sek. Satzpause</span>.
          </p>

          {/* Set Pills */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1 flex-wrap">
            {Array.from({ length: totalSets }).map((_, idx) => {
              const setNum = idx + 1;
              const isDone =
                setNum < currentSet ||
                (setNum === totalSets && secondsLeft === 0 && !isRunning);
              const isCurrent = setNum === currentSet;
              return (
                <button
                  key={setNum}
                  type="button"
                  onClick={() => {
                    setCurrentSet(setNum);
                    setMode('work');
                    setSecondsLeft(effectiveDuration);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                    isDone
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : isCurrent
                      ? 'bg-slate-800 border-emerald-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  Satz {setNum}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Controls Row: Start, Pause-Stepper, Direct Rest Trigger, Reset, Sound */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartWithPrep}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                {secondsLeft === effectiveDuration ? 'Countdown starten' : 'Weiter'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('rest');
              setSecondsLeft(effectiveRest);
              setIsRunning(true);
            }}
            title="Satzpause sofort starten"
            className="px-3 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold border border-amber-500/30 transition"
          >
            {effectiveRest}s Pause starten
          </button>
        </div>

        {/* Quick Pause Time Adjuster + Reset & Sound */}
        <div className="flex items-center gap-2">
          {onRestSecondsChange && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
              <span className="text-[10px] uppercase font-semibold text-amber-300 mr-1">
                Pausenzeit:
              </span>
              <button
                type="button"
                onClick={() => onRestSecondsChange(Math.max(5, effectiveRest - 10))}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                title="-10 Sek. Pause"
              >
                -
              </button>
              <span className="text-xs font-extrabold text-amber-200 px-1.5 tabular-nums">
                {effectiveRest}s
              </span>
              <button
                type="button"
                onClick={() => onRestSecondsChange(effectiveRest + 10)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                title="+10 Sek. Pause"
              >
                +
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            title="Zurücksetzen"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            title={soundEnabled ? 'Signalton aktiv' : 'Signalton stumm'}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
