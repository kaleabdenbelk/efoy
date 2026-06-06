'use client';

import React, { useState } from 'react';
import { 
  User, 
  Activity, 
  Target, 
  Wallet, 
  MapPin, 
  Utensils, 
  ChefHat, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { OnboardingData, calculateOnboardingMetrics } from '@/lib/ai';
import { cn } from '@/lib/utils';
import { completeOnboardingAction } from '@/app/actions/onboarding';

type Step = 'health' | 'constraints' | 'calculating' | 'summary';

const ZONES = ['Bole', 'Megenagna', 'Piassa', 'Kazaanchis', 'CMC', 'Ayat', 'Summit', 'Sarbet', 'Old Airport', 'Mexico'];

export function Onboarding() {
  const [step, setStep] = useState<Step>('health');
  const [formData, setFormData] = useState<OnboardingData>({
    age: 25,
    gender: 'male',
    weightKg: 70,
    heightCm: 175,
    activityLevel: 'moderate',
    goal: 'maintain',
    dailyBudget: 200,
    homeZone: 'Bole',
    workZone: 'Bole',
    mealsPerDay: 3,
    cookingFrequency: 'sometimes'
  });

  const [metrics, setMetrics] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'age' || name === 'weightKg' || name === 'heightCm' || name === 'dailyBudget' || name === 'mealsPerDay') 
        ? Number(value) 
        : value
    }));
  };

  const handleSelect = (name: keyof OnboardingData, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 'health') setStep('constraints');
    else if (step === 'constraints') {
      setStep('calculating');
      // Simulate calculation delay for "premium" feel
      setTimeout(() => {
        const calculated = calculateOnboardingMetrics(formData);
        setMetrics(calculated);
        setStep('summary');
      }, 2000);
    }
  };

  const prevStep = () => {
    if (step === 'constraints') setStep('health');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboardingAction(formData);
      // Force refresh to home to trigger middleware re-check
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 flex justify-between items-center px-2">
        <div className={cn(
          "flex-1 h-1 rounded-full transition-all duration-500",
          step === 'health' || step === 'constraints' || step === 'summary' ? "bg-primary" : "bg-border"
        )} />
        <div className={cn(
          "flex-1 h-1 mx-2 rounded-full transition-all duration-500",
          step === 'constraints' || step === 'summary' ? "bg-primary" : "bg-border"
        )} />
        <div className={cn(
          "flex-1 h-1 rounded-full transition-all duration-500",
          step === 'summary' ? "bg-primary" : "bg-border"
        )} />
      </div>

      <div className="bg-glass border border-border rounded-[32px] p-8 md:p-10 shadow-2xl relative backdrop-blur-xl overflow-hidden">
        {/* Decorative Blur */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {step === 'health' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                <User size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-foreground">Your Bio-Profile</h2>
              <p className="text-muted-foreground text-sm">We need your baseline to calculate your metabolic targets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary/50 outline-none transition"
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Gender</label>
                <div className="grid grid-cols-3 gap-2">
                  {['male', 'female', 'other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => handleSelect('gender', (g as any))}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                        formData.gender === g ? "bg-primary text-primary-foreground border-primary" : "bg-foreground/5 text-muted-foreground border-border hover:border-border/50"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Weight (kg)</label>
                <input 
                  type="number" 
                  name="weightKg" 
                  value={formData.weightKg} 
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary/50 outline-none transition"
                  placeholder="70"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono">Height (cm)</label>
                <input 
                  type="number" 
                  name="heightCm" 
                  value={formData.heightCm} 
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary/50 outline-none transition"
                  placeholder="175"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                <Activity size={14} className="text-primary" /> Activity Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['sedentary', 'light', 'moderate', 'active'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleSelect('activityLevel', (level as any))}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all truncate px-1",
                      formData.activityLevel === level ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-foreground/5 text-muted-foreground border-border hover:border-border/50"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                <Target size={14} className="text-primary" /> Primary Goal
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'lose', label: 'Lose Weight' },
                  { id: 'maintain', label: 'Maintain' },
                  { id: 'gain', label: 'Gain Muscle' }
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleSelect('goal', (goal.id as any))}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all",
                      formData.goal === goal.id ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
                    )}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={nextStep}
              className="w-full mt-6 bg-gradient-to-r from-primary to-indigo-600 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-base uppercase tracking-wider text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Continue to Constraints
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 'constraints' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-2">
                <Sparkles size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white">Reality Check</h2>
              <p className="text-muted-foreground text-sm">Let&apos;s map out your logistical constraints.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                <Wallet size={14} className="text-emerald-500" /> Daily Food Budget (ETB)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  name="dailyBudget"
                  value={formData.dailyBudget}
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-4 text-xl font-bold text-foreground focus:border-emerald-500/50 outline-none transition"
                  placeholder="200"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">ETB</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-500" /> Home Zone
                </label>
                <select 
                  name="homeZone"
                  value={formData.homeZone}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition appearance-none cursor-pointer"
                >
                  {ZONES.map(z => <option key={z} value={z} className="bg-slate-900">{z}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-500" /> Work Zone
                </label>
                <select 
                  name="workZone"
                  value={formData.workZone}
                  onChange={handleChange}
                  className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-emerald-500/50 transition appearance-none cursor-pointer"
                >
                  {ZONES.map(z => <option key={z} value={z} className="bg-background">{z}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                <Utensils size={14} className="text-emerald-500" /> Meals Per Day
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleSelect('mealsPerDay', m)}
                    className={cn(
                      "py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                      formData.mealsPerDay === m ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-foreground/5 text-muted-foreground border-border hover:border-border/50"
                    )}
                  >
                    {m === 5 ? '5+' : m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-mono flex items-center gap-2">
                <ChefHat size={14} className="text-emerald-500" /> Cooking Frequency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['never', 'sometimes', 'often'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => handleSelect('cookingFrequency', (freq as any))}
                    className={cn(
                      "py-3 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all",
                      formData.cookingFrequency === freq ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-foreground/5 text-muted-foreground border-border hover:border-border/50"
                    )}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={prevStep}
                className="flex-[1] bg-white/5 hover:bg-white/10 border border-white/10 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider text-muted-foreground transition-all focus:outline-none"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                onClick={nextStep}
                className="flex-[3] bg-gradient-to-r from-emerald-500 to-cyan-600 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-base uppercase tracking-wider text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all outline-none"
              >
                Calculate Targets
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 'calculating' && (
          <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="text-primary animate-pulse" size={32} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Synthesizing Your Data</h2>
              <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest animate-pulse">Running Mifflin-St Jeor Engine...</p>
            </div>
          </div>
        )}

        {step === 'summary' && metrics && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-2">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-white italic underline decoration-primary underline-offset-8">Profile Synchronized</h2>
              <p className="text-muted-foreground text-sm">Your metabolic baseline has been established.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-foreground/5 border border-border rounded-3xl p-6 flex flex-col gap-1 items-center justify-center relative overflow-hidden group hover:border-primary/30 transition-colors">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary/20 blur-xl rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono text-center">Daily Target</span>
                <div className="text-5xl font-black text-foreground mt-1 group-hover:scale-110 transition-transform">
                  {metrics.targetCalories}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary font-mono">Calories</span>
              </div>

              <div className="bg-foreground/5 border border-border rounded-3xl p-6 flex flex-col gap-1 items-center justify-center relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-500/20 blur-xl rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono text-center">Daily Target</span>
                <div className="text-5xl font-black text-foreground mt-1 group-hover:scale-110 transition-transform">
                  {metrics.targetProtein}g
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 font-mono">Protein</span>
              </div>
            </div>

            <div className="bg-foreground/10 border border-border rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">
                <span>Metabolic Breakdown</span>
                <span className="text-foreground">BMR: {metrics.bmr} kcal</span>
              </div>
              <div className="h-[1px] bg-border" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Daily Energy (TDEE)</span>
                  </div>
                  <span className="text-sm font-bold text-foreground">{metrics.tdee}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-muted-foreground">Goal: {formData.goal}</span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    formData.goal === 'lose' ? "text-red-400" : "text-emerald-400"
                  )}>
                    {formData.goal === 'lose' ? '-500' : formData.goal === 'gain' ? '+500' : '0'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-4 items-center">
              <div className="p-2 bg-primary/20 rounded-xl text-primary">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">Logistics set to <span className="text-foreground font-bold">{formData.homeZone}</span> and <span className="text-foreground font-bold">{formData.workZone}</span>.</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 tracking-wider font-mono">BUDGET: {formData.dailyBudget} ETB • {formData.mealsPerDay} MEALS</p>
              </div>
            </div>

            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-lg uppercase tracking-widest shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all outline-none disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Synchronizing...
                </>
              ) : (
                <>
                  Enter Dashboard
                  <Sparkles size={20} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
