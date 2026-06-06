'use client';

import React, { useEffect, useState } from 'react';

interface BreathingCircleProps {
  durationSeconds?: number;
  onComplete: () => void;
}

export function BreathingCircle({ durationSeconds = 15, onComplete }: BreathingCircleProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [msElapsed, setMsElapsed] = useState(0);
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [scale, setScale] = useState(1.0);

  // SVG dash array calculations for the overall progress ring
  const strokeRadius = 110;
  const circumference = 2 * Math.PI * strokeRadius; // ~691.15
  const totalMs = durationSeconds * 1000;
  const strokeDashoffset = circumference - (msElapsed / totalMs) * circumference;

  // Run a high-frequency ticker (every 50ms) to ensure buttery smooth state calculations
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed >= totalMs) {
        setMsElapsed(totalMs);
        clearInterval(interval);
        onComplete();
        return;
      }

      setMsElapsed(elapsed);

      // Compute current cycle state (10-second loop: 4s inhale, 2s hold, 4s exhale)
      const cycleTime = elapsed % 10000;

      if (cycleTime < 4000) {
        setPhase('Inhale');
        const progress = cycleTime / 4000;
        setScale(1.0 + progress * 0.52);
      } else if (cycleTime < 6000) {
        setPhase('Hold');
        setScale(1.52);
      } else {
        setPhase('Exhale');
        const progress = (cycleTime - 6000) / 4000;
        setScale(1.52 - progress * 0.52);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [durationSeconds, onComplete]);

  // Color mappings based on NutriPath Bio Stress-Optimized Palette
  const phaseColors = {
    Inhale: 'from-softGreen/80 to-mint text-mint',
    Hold: 'from-stress/80 to-stress text-stress',
    Exhale: 'from-skyBlue/80 to-indigoPurple text-skyBlue',
  };

  const getSubtext = () => {
    switch (phase) {
      case 'Inhale':
        return 'Breathe in slowly. Expand your chest and abdomen.';
      case 'Hold':
        return 'Suspend breath. Quiet your sympathetic overdrive.';
      case 'Exhale':
        return 'Exhale completely. Release muscle jaw clenching.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-6 text-center select-none font-sans">
      
      {/* Vagus Calibration Header */}
      <div className="flex flex-col items-center">
        <span className="text-muted text-[11px] font-bold uppercase tracking-widest font-mono">
          Autonomic Nervous System Reset
        </span>
        <h2 className="text-5xl font-black text-white mt-1.5 font-sans tracking-tight">
          Vagal Calibration
        </h2>
        <p className="text-muted text-xs mt-2 max-w-xs leading-relaxed font-sans font-medium">
          Realigning blood flow to enteric pathways to restore calcium mineral channels.
        </p>
      </div>

      {/* Breathing Mandala Viewport */}
      <div className="relative flex items-center justify-center h-72 w-72">
        
        {/* SVG Progress Ring */}
        <svg className="absolute transform -rotate-90 w-64 h-64 overflow-visible" viewBox="0 0 240 240">
          {/* Static Background circle */}
          <circle
            cx="120"
            cy="120"
            r={strokeRadius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="6"
          />
          {/* Dynamic calibration progress ring */}
          <circle
            cx="120"
            cy="120"
            r={strokeRadius}
            fill="transparent"
            stroke={phase === 'Inhale' ? '#34D399' : phase === 'Hold' ? '#FBBF24' : '#38BDF8'}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-100 ease-out"
          />
        </svg>

        {/* Outer ambient blur shadow */}
        <div 
          style={{ transform: `scale(${scale})` }}
          className={`absolute h-36 w-36 rounded-full filter blur-2xl opacity-25 transition-transform duration-100 ease-out bg-gradient-to-tr ${phaseColors[phase]}`}
        />

        {/* Ambient Ring Wave */}
        <div 
          style={{ transform: `scale(${scale * 1.25})` }}
          className={`absolute h-36 w-36 rounded-full border border-current opacity-20 transition-all duration-100 ease-out ${phaseColors[phase]}`}
        />

        {/* Core Breathing Bubble */}
        <div
          style={{ transform: `scale(${scale})` }}
          className={`h-36 w-36 rounded-full flex items-center justify-center p-[2px] transition-transform duration-100 ease-out bg-gradient-to-tr ${phaseColors[phase]} shadow-2xl shadow-current/10 z-10`}
        >
          {/* Inner dark center */}
          <div className="h-full w-full rounded-full bg-slate-950 flex flex-col items-center justify-center p-3 gap-0.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted font-mono leading-none">
              {phase === 'Inhale' ? 'Inhale' : phase === 'Hold' ? 'Hold' : 'Exhale'}
            </span>
            {/* Number countdown in Roboto Mono */}
            <span className="text-2xl font-bold text-white font-mono leading-none mt-1.5">
              {Math.max(0, Math.ceil(timeLeft))}s
            </span>
          </div>
        </div>
      </div>

      {/* Somatic Guidance Panel */}
      <div className="glass-panel rounded-2xl px-6 py-4 max-w-sm flex flex-col items-center shadow-lg">
        {/* Dynamic Wave Pulse Icon */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`h-1.5 w-1.5 rounded-full animate-ping ${phase === 'Inhale' ? 'bg-mint' : phase === 'Hold' ? 'bg-stress' : 'bg-skyBlue'}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white font-mono">
            Somatic Directive
          </span>
        </div>
        
        <p className="text-center text-xs text-muted leading-relaxed font-sans font-medium h-8 flex items-center">
          {getSubtext()}
        </p>
      </div>

    </div>
  );
}
