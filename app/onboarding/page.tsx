'use client';

import React from 'react';
import { Onboarding } from '@/components/Onboarding';

export default function OnboardingPage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-navy text-slate-100 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background soft ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary/5 via-transparent to-mint/5 rounded-full filter blur-3xl pointer-events-none animate-pulse duration-[10s]" />
      
      <div className="w-full max-w-4xl z-10 flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-white font-sans sm:text-6xl uppercase italic">
            Kura<span className="text-primary not-italic">.</span>OS
          </h1>
          <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase font-mono max-w-xs leading-relaxed">
            Metabolic Sync & Logistics Protocol Initiation
          </p>
        </div>

        <Onboarding />

        <div className="text-center">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest opacity-50">
              Secured Connection • HIPAA Compliant Engine • Clinical Calculations
            </span>
        </div>
      </div>
    </main>
  );
}
