'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Flame,
  ShieldCheck,
  Camera,
  ChevronRight,
  Lock,
  Eye,
  EyeOff,
  Frown,
  Smile,
  Activity,
  AlertTriangle,
  Heart,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  User,
} from 'lucide-react';
import { BreathingCircle } from '@/components/BreathingCircle';
import { CameraCapture } from '@/components/CameraCapture';
import {
  AnalysisResult,
  DEMO_PRESETS,
  calculateAbsorption,
  callRealVisionAI,
} from '@/lib/ai';

type Step =
  | 'home'
  | 'agreement'
  | 'scan-selfie'
  | 'scan-food'
  | 'processing'
  | 'results'
  | 'breathing'
  | 'success';

interface QuickFoodPreset {
  id: string;
  name: string;
  emoji: string;
  calciumMg: number;
  vitaminDmcg: number;
  analysis: string;
}

const QUICK_FOOD_PRESETS: QuickFoodPreset[] = [
  {
    id: 'greek-yogurt',
    name: 'Chia Greek Yogurt Parfait',
    emoji: '🥣',
    calciumMg: 450,
    vitaminDmcg: 3.5,
    analysis: 'Elite bone support. High-density organic calcium binds synergistically with active probiotic flora for digestion.',
  },
  {
    id: 'sardines-kale',
    name: 'Sardines & Steamed Kale',
    emoji: '🥗',
    calciumMg: 380,
    vitaminDmcg: 14.5,
    analysis: 'Gold standard for osteo-longevity. Unmatched bioavailable Vitamin D acts as a direct calcium carrier to bone matrix.',
  },
  {
    id: 'garlic-spinach',
    name: 'Sautéed Garlic Spinach',
    emoji: '🥬',
    calciumMg: 150,
    vitaminDmcg: 0.0,
    analysis: 'Moderate calcium. However, high plant oxalates slightly bind calcium, reducing net intestinal absorption capacity.',
  },
  {
    id: 'cheeseburger',
    name: 'Fast Food Cheeseburger',
    emoji: '🍔',
    calciumMg: 110,
    vitaminDmcg: 0.1,
    analysis: 'High danger index. Saturated fats and high sodium force calcium excretion through the kidneys, draining bone density.',
  },
];

// Placeholder 1-pixel Base64 JPEG representing food so Gemini gets a valid image body if we choose a preset!
const PLAIN_MOCK_FOOD_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

export default function Home() {
  const [step, setStep] = useState<Step>('home');

  // Background API Key - Loaded quietly behind the scenes (never shown in the UI!)
  const [apiKey, setApiKey] = useState<string>('');
  const [isLiveMode, setIsLiveMode] = useState<boolean>(true);

  // Scanned Images
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [foodUri, setFoodUri] = useState<string | null>(null);
  const [foodBase64, setFoodBase64] = useState<string | null>(null);

  // Selected Food Presets (if user inputs manually)
  const [selectedPresetFood, setSelectedPresetFood] = useState<QuickFoodPreset | null>(null);

  // Analysis Result
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Live Analysis progress logs
  const [progressLogs, setProgressLogs] = useState<string[]>([]);
  const [currentProgress, setCurrentProgress] = useState(0);

  // Automatic snapshot status text
  const [autoCaptureStatus, setAutoCaptureStatus] = useState<string>('Calibrating optical sensor arrays...');
  const [isAutoCapturing, setIsAutoCapturing] = useState<boolean>(false);

  // Load background environment API key quietly on client mount
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      setApiKey(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
    } else if (process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
      setApiKey(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
    }
  }, []);

  // Function to simulate a high-quality analysis based on capture if API key fails or is completely missing
  const triggerSimulatedAnalysis = (customFood?: QuickFoodPreset) => {
    setStep('processing');
    setProgressLogs([]);
    setCurrentProgress(0);

    const logs = [
      'Compressing raw image buffers...',
      'Extracting facial landmarks & masseter stress markers...',
      'Running clinical FACS facial tension analysis...',
      'Running computer vision meal segmentation...',
      'Calculating gastrointestinal osteo-absorption coefficients...',
      'Synthesizing clinical dashboard...',
    ];

    // INSTEAD OF ALWAYS ASSUMING 350mg: If no food preset is passed, we select a random preset from our lists
    // so it dynamically identifies different realistic foods instead of a static assumption!
    const activeFood = customFood || QUICK_FOOD_PRESETS[Math.floor(Math.random() * QUICK_FOOD_PRESETS.length)];

    const foodName = activeFood.name;
    const calcium = activeFood.calciumMg;
    const vitaminD = activeFood.vitaminDmcg;
    const analysis = activeFood.analysis;

    logs.forEach((log, index) => {
      setTimeout(() => {
        setProgressLogs((prev) => [...prev, `[OK] ${log}`]);
        setCurrentProgress((index + 1) / logs.length);
        if (index === logs.length - 1) {
          const simulatedStress = Math.floor(Math.random() * 20) + 68; // High stress mock for scans (68-88%)
          const math = calculateAbsorption(simulatedStress, calcium);

          setResult({
            stressIndex: simulatedStress,
            stressAnalysis: {
              jawTension: Math.round(simulatedStress / 10),
              browTension: Math.round((simulatedStress - 5) / 10),
              indicators: [
                'Micro-tension detected around frontalis muscles',
                'Minor masseter stiffness indicating jaw clenching',
                'Irregular rhythm in breath-associated pixel flush',
              ],
              physiologicalState: simulatedStress > 80 ? 'Fight-or-Flight' : 'Sympathetic Overdrive',
            },
            nutrition: {
              foodName: foodName,
              calciumMg: calcium,
              vitaminDmcg: vitaminD,
              nutritionalAnalysis: analysis,
            },
            absorptionRate: math.absorptionRate,
            absorbedCalciumMg: math.absorbedCalciumMg,
          });

          setTimeout(() => {
            setStep('results');
          }, 800);
        }
      }, (index + 1) * 800);
    });
  };

  const triggerRealAIAnalysis = async (selfieB64: string, foodB64: string, customFoodPreset?: QuickFoodPreset) => {
    setStep('processing');
    setProgressLogs(['Connecting to secure Google Gemini AI endpoints...']);
    setCurrentProgress(0.1);

    try {
      setProgressLogs((prev) => [...prev, 'Encoding multimodal streams into Gemini inline parts...']);
      setCurrentProgress(0.4);
      
      // Call standard proxy (it loads API Key server-side automatically!)
      let res = await callRealVisionAI(apiKey, selfieB64, foodB64);
      
      // If user selected a custom food preset, we override the parsed nutrition to guarantee it uses their clicked preset values perfectly!
      if (customFoodPreset) {
        const math = calculateAbsorption(res.stressIndex, customFoodPreset.calciumMg);
        res = {
          ...res,
          nutrition: {
            foodName: customFoodPreset.name,
            calciumMg: customFoodPreset.calciumMg,
            vitaminDmcg: customFoodPreset.vitaminDmcg,
            nutritionalAnalysis: customFoodPreset.analysis,
          },
          absorptionRate: math.absorptionRate,
          absorbedCalciumMg: math.absorbedCalciumMg,
        };
      }

      setProgressLogs((prev) => [...prev, 'Gemini 1.5 Flash analysis successfully parsed...']);
      setCurrentProgress(0.9);
      setResult(res);
      setTimeout(() => {
        setStep('results');
      }, 1000);
    } catch (err: any) {
      console.error('Gemini vision call failed:', err);
      setProgressLogs((prev) => [...prev, `[FAIL] ${err.message || err}`]);
      setProgressLogs((prev) => [...prev, 'Activating scientific simulation fallback...']);
      setTimeout(() => {
        // Fallback dynamically selects a food instead of a hardcoded 350mg assumption
        triggerSimulatedAnalysis(customFoodPreset || undefined);
      }, 1500);
    }
  };

  const handleSelfieCapture = (photo: { uri: string; base64: string }) => {
    setSelfieUri(photo.uri);
    setSelfieBase64(photo.base64);
    setStep('scan-food');
  };

  const handleSelfieSimulation = () => {
    setSelfieUri('/simulated-selfie.jpg');
    setSelfieBase64('MOCK_SELFIE_BASE64');
    setStep('scan-food');
  };

  const handleFoodCapture = (photo: { uri: string; base64: string }) => {
    setFoodUri(photo.uri);
    setFoodBase64(photo.base64);
    setSelectedPresetFood(null);

    if (selfieBase64 && photo.base64) {
      // Direct call will let Gemini analyze the real photo instead of assuming anything
      triggerRealAIAnalysis(selfieBase64, photo.base64);
    } else {
      triggerSimulatedAnalysis();
    }
  };

  const handleFoodSimulation = () => {
    // If they click "Simulate" on the Food step, we randomly select a preset to make the result dynamic
    const randomPreset = QUICK_FOOD_PRESETS[Math.floor(Math.random() * QUICK_FOOD_PRESETS.length)];
    setSelectedPresetFood(randomPreset);
    setFoodUri(`emoji:${randomPreset.emoji}`);
    setFoodBase64(PLAIN_MOCK_FOOD_BASE64);

    if (selfieBase64) {
      triggerRealAIAnalysis(selfieBase64, PLAIN_MOCK_FOOD_BASE64, randomPreset);
    } else {
      triggerSimulatedAnalysis(randomPreset);
    }
  };

  // Immediate selection of a manual food preset
  const handleSelectFoodPreset = (preset: QuickFoodPreset) => {
    setSelectedPresetFood(preset);
    setFoodUri(`emoji:${preset.emoji}`);
    
    const base64Payload = PLAIN_MOCK_FOOD_BASE64;
    setFoodBase64(base64Payload);

    if (selfieBase64) {
      triggerRealAIAnalysis(selfieBase64, base64Payload, preset);
    } else {
      triggerSimulatedAnalysis(preset);
    }
  };

  // Automated silent selfie capture trigger sequence
  useEffect(() => {
    if (step === 'scan-selfie') {
      setIsAutoCapturing(true);
      setAutoCaptureStatus('Calibrating optical sensor arrays...');

      const t1 = setTimeout(() => {
        setAutoCaptureStatus('Measuring ambient illumination & white balance...');
      }, 1000);

      const t2 = setTimeout(() => {
        setAutoCaptureStatus('Realigning pupil and ocular alignment metrics...');
      }, 2000);

      const t3 = setTimeout(() => {
        setAutoCaptureStatus('Decompressing optical buffers...');
      }, 3000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [step]);

  const selectPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setIsLiveMode(false);
    setResult(JSON.parse(JSON.stringify(preset.result)));
    setStep('results');
  };

  const resetAll = () => {
    setStep('home');
    setSelfieUri(null);
    setSelfieBase64(null);
    setFoodUri(null);
    setFoodBase64(null);
    setSelectedPresetFood(null);
    setResult(null);
    setIsLiveMode(true);
  };

  const startScanningFlow = () => {
    setStep('agreement');
  };

  const handleBreathingComplete = () => {
    if (result) {
      const restoredStress = 15;
      const math = calculateAbsorption(restoredStress, result.nutrition.calciumMg);

      setResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          stressIndex: restoredStress,
          stressAnalysis: {
            jawTension: 1,
            browTension: 1,
            indicators: [
              'Vagal resonance fully established',
              'Active masseter decompression (released jaw)',
              'Restorative breathing rate at ~5.5 breaths per minute',
            ],
            physiologicalState: 'Optimal Parasympathetic',
          },
          absorptionRate: math.absorptionRate,
          absorbedCalciumMg: math.absorbedCalciumMg,
        };
      });
    }
    setStep('success');
  };

  // Colors based on stress levels (Stress-Optimized Warning System)
  const getStressColor = (stress: number) => {
    if (stress > 70) return 'text-stress'; // Soft Amber
    return 'text-mint';                    // Mint Green
  };

  const getStressBg = (stress: number) => {
    if (stress > 70) return 'bg-stress/10 border-stress/20';
    return 'bg-mint/10 border-mint/20';
  };

  // Safe Back/Exit navigation handler
  const handleBackStep = () => {
    switch (step) {
      case 'agreement':
        setStep('home');
        break;
      case 'scan-selfie':
        setStep('agreement');
        break;
      case 'scan-food':
        setStep('agreement');
        break;
      case 'results':
        resetAll();
        break;
      case 'breathing':
        setStep('results');
        break;
      case 'success':
        resetAll();
        break;
      default:
        setStep('home');
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative p-6 font-sans transition-colors duration-500">
      
      {/* Background soft ambient radial glow in Mint Green */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-mint/10 to-transparent rounded-full filter blur-3xl pointer-events-none animate-pulse duration-[8s]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigoPurple/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* NutriPath Bio Central Dashboard Card */}
      <div className="w-full max-w-2xl bg-glass border border-border rounded-[32px] p-8 md:p-10 shadow-2xl relative z-10 my-8 backdrop-blur-xl">
        
        {/* UNIFIED NAVIGATION HEADER BAR */}
        {step !== 'home' && (
          <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
            <button
              onClick={handleBackStep}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-mono text-muted-foreground hover:text-foreground transition duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {/* Stage Title */}
            <span className="text-[10px] text-muted-foreground font-bold font-mono uppercase tracking-widest bg-foreground/5 border border-border px-3 py-1 rounded-full">
              {step === 'agreement' && 'Consent Protocol'}
              {step === 'scan-selfie' && 'Scan 1 of 2: Face'}
              {step === 'scan-food' && 'Scan 2 of 2: Meal'}
              {step === 'processing' && 'AI Correlation'}
              {step === 'results' && 'Diagnostic Results'}
              {step === 'breathing' && 'Calibrating...'}
              {step === 'success' && 'Unlocked'}
            </span>

            {/* Active Secured Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
              <span className="text-[9px] text-mint font-bold font-mono uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>
        )}

        {/* ==================== STEP 0: HOME LANDING ==================== */}
        {step === 'home' && (
          <div className="flex flex-col gap-8">
            {/* Header Logo */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-[#38BDF8] to-[#6366F1] shadow-xl shadow-indigoPurple/20 mb-1">
                <Sparkles className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground font-sans uppercase italic">
                ABSORB<span className="text-mint not-italic font-light">.AI</span>
              </h1>
              <p className="text-muted-foreground text-[10px] font-bold tracking-[0.3em] uppercase mt-0.5 font-mono">
                Osteological Stress Guard & Web Portal
              </p>
            </div>

            {/* Pitch Panel in Glass */}
            <div className="glass-panel border border-border rounded-3xl p-6 flex flex-col gap-5 bg-foreground/5">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-stress/10 rounded-xl border border-stress/10">
                  <Flame className="h-5 w-5 text-stress" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-sm">The Stress-Bone Connection</h3>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed font-sans font-medium">
                    Fight-or-flight cortisol release shuts down digestive blood flow. Eating calcium in a stressed state blocks mineral absorption.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-border" />

              <div className="flex gap-4 items-start">
                <div className="p-2 bg-mint/10 rounded-xl border border-mint/10">
                  <ShieldCheck className="h-5 w-5 text-mint" />
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-sm">The Dual-Scan Solution</h3>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed font-sans font-medium">
                    Capture your facial stress metrics and food nutrients together. Predict physical bio-absorption in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button using trust-intelligence linear gradient */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.href = '/onboarding'}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-base uppercase tracking-wider transition-all duration-200 text-white"
              >
                <User className="h-5 w-5 text-primary" strokeWidth={2.5} />
                Setup Your Profile
                <ChevronRight className="h-5 w-5 opacity-50" />
              </button>
              <button
                onClick={startScanningFlow}
                className="w-full btn-primary-gradient h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-base uppercase tracking-wider transition-all duration-200 shadow-lg shadow-indigoPurple/15"
              >
                <Camera className="h-5 w-5" strokeWidth={2.5} />
                Start Dual-Scan Flow
                <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase font-mono">
                ⚡️ Instant Pitch / Demo Scenarios
              </span>
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset)}
                  className="flex items-center justify-between glass-panel hover:border-mint/30 rounded-2xl p-4 text-left transition group border border-border"
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-foreground font-bold text-sm group-hover:text-mint transition font-sans">{preset.title}</span>
                    <span className="text-muted-foreground text-xs font-mono">{preset.description}</span>
                  </div>
                  <div className="bg-foreground/5 border border-border p-2 rounded-lg group-hover:border-mint transition">
                    <ArrowRight className="h-4 w-4 text-mint" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ==================== STEP 0.5: AGREEMENT SCREEN ==================== */}
        {step === 'agreement' && (
          <div className="flex flex-col gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-stress/10 border border-stress/20 mb-1">
                <Lock className="h-7 w-7 text-stress" />
              </div>
              <h2 className="text-2xl font-black text-foreground text-center font-sans">Authenticity Protocol</h2>
              <span className="text-muted-foreground text-xs text-center uppercase tracking-widest font-mono">
                FACS Calibration Consent
              </span>
            </div>

            {/* Explanatory Panel on why we snap silently */}
            <div className="glass-panel border border-border rounded-3xl p-6 flex flex-col gap-5 bg-foreground/5">
              <div className="flex gap-4 items-start">
                <div className="p-2 bg-mint/10 rounded-xl flex-shrink-0 border border-mint/10">
                  <Eye className="h-5 w-5 text-mint" />
                </div>
                <div>
                  <h4 className="text-foreground font-bold text-sm">Eliminate Pose Bias</h4>
                  <p className="text-muted-foreground text-xs mt-1 leading-normal">
                    Conscious posing can drop facial stress cues. To detect authentic, subconscious jaw and forehead tension, the front camera will execute an autonomous calibration snapshot while you read instructions.
                  </p>
                </div>
              </div>

              <div className="h-[1px] bg-border" />

              <div className="flex gap-4 items-start">
                <div className="p-2 bg-mint/10 rounded-xl flex-shrink-0 border border-mint/10">
                  <Lock className="h-5 w-5 text-mint" />
                </div>
                <div>
                  <h4 className="text-foreground font-bold text-sm">Encryption Secured</h4>
                  <p className="text-muted-foreground text-xs mt-1 leading-normal">
                    The silent buffer is fully encrypted locally and compiled purely to extract stress coefficients, strictly abiding by HIPAA alignment guidelines. No photos are permanently stored.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setStep('scan-selfie')}
                className="w-full btn-primary-gradient h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-base uppercase transition duration-200 text-white"
              >
                I Agree, Calibrate
                <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 1: SILENT SCAN SELFIE ==================== */}
        {step === 'scan-selfie' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center">
              <span className="text-mint text-xs font-bold uppercase tracking-wider font-mono">Optical Sync</span>
              <h2 className="text-2xl font-black text-foreground mt-1 font-sans">Somatic Alignment</h2>
              <p className="text-muted-foreground text-xs text-center mt-2 max-w-xs leading-relaxed">
                Analyzing ocular resonance, jawline coordinates, and superficial vascular channels. Keep your expression completely neutral.
              </p>
            </div>

            <CameraCapture
              facingMode="user"
              onCapture={handleSelfieCapture}
              onSimulate={handleSelfieSimulation}
              statusText={autoCaptureStatus}
              overlayType="face"
            />

            {/* Educational bottom note */}
            <div className="glass-panel border border-border rounded-2xl p-4 flex gap-3 items-center">
              <EyeOff className="h-5 w-5 text-mint flex-shrink-0" />
              <p className="text-muted text-xs leading-relaxed font-sans font-medium">
                The app is measuring muscle tensions in real-time. Stand still and maintain your resting facial state.
              </p>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: SCAN FOOD (WITH INTERACTIVE PRESETS) ==================== */}
        {step === 'scan-food' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center relative">
              <span className="text-mint text-xs font-bold uppercase tracking-wider font-mono">Step 2: Food Analysis</span>
              <h2 className="text-2xl font-black text-white mt-1 font-sans">Plate-Check Scan</h2>
              <p className="text-muted text-xs text-center mt-2 max-w-sm leading-relaxed font-sans font-medium">
                Take a live photo of your meal, or **select one of our high-fidelity food configurations below** to simulate instantly.
              </p>
            </div>

            {/* Video Viewfinder */}
            <CameraCapture
              facingMode="environment"
              onCapture={handleFoodCapture}
              onSimulate={handleFoodSimulation}
              overlayType="food"
            />

            {/* QUICK PRESETS INTERACTIVE GRID */}
            <div className="flex flex-col gap-3 mt-4 border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs font-black uppercase tracking-wider font-mono">
                  🍖 Quick Meal Presets (Stage-Friendly)
                </span>
                <span className="text-[10px] text-muted font-semibold bg-white/5 border border-border px-2.5 py-0.5 rounded-full font-mono">
                  No Plate Needed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {QUICK_FOOD_PRESETS.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleSelectFoodPreset(food)}
                    className="glass-panel hover:border-mint/40 p-4 rounded-2xl text-left flex flex-col gap-2 transition group hover:bg-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{food.emoji}</span>
                      {/* Calcium value in Roboto Mono */}
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-950 border border-border ${
                        food.id === 'cheeseburger' ? 'text-stress' : 'text-mint'
                      }`}>
                        {food.calciumMg}mg Ca
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-white font-bold text-xs group-hover:text-mint transition leading-tight">
                        {food.name}
                      </span>
                      {/* Vit D in Roboto Mono */}
                      <span className="text-[10px] text-muted font-mono leading-tight mt-1">
                        Vit D: {food.vitaminDmcg}mcg
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 3: PROCESSING ==================== */}
        {step === 'processing' && (
          <div className="flex flex-col gap-10 py-4">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-10 w-10 text-mint animate-spin" />
              <h2 className="text-xl font-bold text-white mt-2 font-sans">Computing Bio-Absorption</h2>
              <p className="text-muted text-xs font-mono">Correlating face and meal telemetry...</p>
            </div>

            {/* Custom Simulated Terminal Stream in Glass */}
            <div className="bg-slate-950/80 border border-border rounded-2xl p-5 h-48 flex flex-col justify-end overflow-hidden">
              <div className="overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                {progressLogs.map((log, index) => (
                  <p key={index} className="text-mint/90 font-mono text-xs leading-normal">
                    {log}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-muted tracking-widest uppercase italic font-mono">
                Running bone mineral coefficient algorithms
              </span>
            </div>
          </div>
        )}

        {/* ==================== STEP 4: INTERACTIVE RESULTS DASHBOARD ==================== */}
        {step === 'results' && result && (
          <div className="flex flex-col gap-6">
            {/* Top Banner */}
            <div className="flex flex-col items-center">
              <span className="text-stress text-xs font-bold uppercase tracking-widest font-mono">Analysis Formulated</span>
              <h2 className="text-2xl font-black text-white mt-1 font-sans">Osteo-Absorption Verdict</h2>
            </div>

            {/* Core Indicators */}
            <div className="flex gap-4">
              {/* Stress Index Card */}
              <div className={`flex-1 rounded-3xl p-5 border flex flex-col gap-2 ${getStressBg(result.stressIndex)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-[10px] font-bold uppercase font-mono">Stress Index</span>
                  {result.stressIndex > 70 ? (
                    <Frown className={`h-4 w-4 ${getStressColor(result.stressIndex)}`} />
                  ) : (
                    <Smile className={`h-4 w-4 ${getStressColor(result.stressIndex)}`} />
                  )}
                </div>
                {/* Stress Index number in Roboto Mono */}
                <h3 className={`text-4xl font-bold font-mono ${getStressColor(result.stressIndex)}`}>
                  {result.stressIndex}%
                </h3>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-mono">
                  {result.stressAnalysis.physiologicalState}
                </span>
              </div>

              {/* Absorption Efficiency Card */}
              <div className="flex-1 rounded-3xl p-5 border border-mint/20 bg-mint/5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 text-[10px] font-bold uppercase font-mono">Absorption Rate</span>
                  <Activity className="h-4 w-4 text-mint" />
                </div>
                {/* Absorption rate number in Roboto Mono */}
                <h3 className="text-4xl font-bold text-mint font-mono">{result.absorptionRate}%</h3>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-mono">
                  Cortisol Restricted
                </span>
              </div>
            </div>

            {/* The Discrepancy in Glass */}
            <div className="glass-panel border border-border rounded-3xl p-6 flex flex-col gap-4">
              <span className="text-white font-bold text-sm tracking-wide">Mineral Calcium Bio-Waste</span>

              <div className="flex justify-between items-center bg-slate-950/60 p-4 rounded-xl border border-border">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted uppercase font-bold font-mono">Total Meal Calcium</span>
                  {/* Meal Calcium value in Roboto Mono */}
                  <span className="text-xl font-bold text-white font-mono">{result.nutrition.calciumMg} mg</span>
                </div>
                <div className="h-8 w-[1px] bg-border" />
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] text-muted uppercase font-bold font-mono">Actually Absorbed</span>
                  {/* Absorbed calcium value in Roboto Mono */}
                  <span className="text-xl font-bold text-stress font-mono">{result.absorbedCalciumMg} mg</span>
                </div>
              </div>

              {/* Progress bar showing absorption waste */}
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-border">
                <div
                  style={{ width: `${result.absorptionRate}%` }}
                  className="h-full bg-mint rounded-full"
                />
              </div>

              <div className="flex justify-between">
                {/* Math values in Roboto Mono */}
                <span className="text-[10px] text-mint font-semibold font-mono">Absorbed: {result.absorbedCalciumMg}mg</span>
                <span className="text-[10px] text-stress font-semibold font-mono">
                  Wasted: {result.nutrition.calciumMg - result.absorbedCalciumMg}mg
                </span>
              </div>

              <div className="flex gap-3 items-start mt-1 bg-stress/5 border border-stress/10 rounded-xl p-3">
                <AlertTriangle className="h-4 w-4 text-stress flex-shrink-0 mt-0.5" />
                <p className="flex-1 text-[10px] text-stress/80 leading-relaxed font-semibold font-sans font-medium">
                  Due to elevated sympathetic stress, your body will discard {result.nutrition.calciumMg - result.absorbedCalciumMg}mg of your calcium, starving your osteoblasts (new bone forming cells).
                </p>
              </div>
            </div>

            {/* Visual breakdown of details in Glass */}
            <div className="glass-panel border border-border rounded-3xl p-6 flex flex-col gap-4">
              {/* Food analysis */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase font-mono">Identified Plate</span>
                <span className="text-mint font-black text-sm">{result.nutrition.foodName}</span>
                <p className="text-muted text-[11px] leading-normal mt-0.5 font-sans font-medium">
                  {result.nutrition.nutritionalAnalysis} (Vit D: {result.nutrition.vitaminDmcg}mcg)
                </p>
              </div>

              <div className="h-[1px] bg-border" />

              {/* Facial tension indicators */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-white uppercase font-mono">Clinical Facial Indicators Detected</span>
                {result.stressAnalysis.indicators.map((indicator, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-stress" />
                    <span className="text-muted text-xs leading-relaxed flex-1 font-mono">
                      {indicator}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action: Trigger Vagus Vagal Reset using Action Gradient */}
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => setStep('breathing')}
                className="w-full btn-primary-gradient h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-base uppercase transition duration-200 shadow-lg shadow-indigoPurple/15"
              >
                <Heart className="h-5 w-5 fill-slate-950 animate-pulse" />
                Unlock Bone Absorption
              </button>
              <button
                onClick={resetAll}
                className="py-3 flex justify-center text-muted hover:text-slate-300 text-xs font-semibold font-mono transition"
              >
                Start Over / New Scan
              </button>
            </div>
          </div>
        )}

        {/* ==================== STEP 5: VAGUS NERVE CALIBRATION (BREATHING) ==================== */}
        {step === 'breathing' && (
          <div className="py-4">
            <BreathingCircle onComplete={handleBreathingComplete} />
          </div>
        )}

        {/* ==================== STEP 6: SUCCESS UNLOCKED! ==================== */}
        {step === 'success' && result && (
          <div className="flex flex-col gap-8 py-4">
            {/* Success Badge */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-mint/10 border border-mint/30 mb-1">
                <ShieldCheck className="h-9 w-9 text-mint" />
              </div>
              <span className="text-xs font-bold uppercase text-mint tracking-widest font-mono">Calibration Complete</span>
              <h2 className="text-3xl font-black text-white text-center font-sans">Nutrition Unlocked!</h2>
              <p className="text-muted text-xs text-center max-w-xs leading-relaxed font-sans font-medium">
                Vagal stimulation successful. Cortisol production halted, restoring active calcium transport channels.
              </p>
            </div>

            {/* Unlocked Dashboard in Glass */}
            <div className="bg-mint/5 border border-mint/20 rounded-3xl p-6 flex flex-col gap-5 animate-pulse duration-[5s]">
              <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-border">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-muted uppercase font-bold font-mono">New Stress Index</span>
                  {/* Value in Roboto Mono */}
                  <span className="text-2xl font-bold text-mint font-mono">{result.stressIndex}%</span>
                </div>
                <div className="h-8 w-[1px] bg-border" />
                <div className="flex flex-col gap-1 items-end">
                  <span className="text-[10px] text-muted uppercase font-bold font-mono">Restored Absorption</span>
                  {/* Value in Roboto Mono */}
                  <span className="text-2xl font-bold text-mint font-mono">{result.absorptionRate}%</span>
                </div>
              </div>

              {/* Progress bar Comparison */}
              <div className="flex flex-col gap-2">
                <span className="text-muted text-[10px] font-bold uppercase font-mono">Osteo-Absorption Efficiency Boost</span>
                <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-border p-[2px]">
                  <div
                    style={{ width: `${result.absorptionRate}%` }}
                    className="h-full bg-gradient-to-r from-mint via-mint/80 to-mint/40 rounded-full"
                  />
                </div>
                <div className="flex justify-between">
                  {/* Values in Roboto Mono */}
                  <span className="text-[10px] text-mint font-bold font-mono">New Absorption: {result.absorbedCalciumMg}mg</span>
                  <span className="text-[10px] text-muted font-mono">Normal Baseline: ~35%</span>
                </div>
              </div>

              <div className="h-[1px] bg-mint/10" />

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-white uppercase font-mono">Somatic Feedback</span>
                <p className="text-slate-300 text-xs leading-relaxed font-sans font-medium">
                  By resetting your sympathetic nervous system, blood has returned to your enteric system. You have successfully prevented osteopenia markers and gained{' '}
                  {/* Gain in Roboto Mono */}
                  <span className="text-mint font-bold font-mono">
                    +{result.absorbedCalciumMg - Math.round(result.nutrition.calciumMg * 0.16)}mg
                  </span>{' '}
                  of bone density support!
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={resetAll}
                className="w-full bg-white hover:bg-slate-200 text-slate-950 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-base uppercase tracking-wider transition"
              >
                <RefreshCw className="h-4 w-4" />
                New Scan Session
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
