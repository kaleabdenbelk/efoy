export interface StressAnalysis {
  jawTension: number; // 1 to 10
  browTension: number; // 1 to 10
  indicators: string[];
  physiologicalState: 'Fight-or-Flight' | 'Sympathetic Overdrive' | 'Optimal Parasympathetic';
}

export interface FoodNutrition {
  foodName: string;
  calciumMg: number;
  vitaminDmcg: number;
  nutritionalAnalysis: string;
}

export interface AnalysisResult {
  stressIndex: number; // 0 to 100
  stressAnalysis: StressAnalysis;
  nutrition: FoodNutrition;
  absorptionRate: number; // 0 to 100 (percentage of calcium absorbed)
  absorbedCalciumMg: number;
}

export interface DemoPreset {
  id: string;
  title: string;
  description: string;
  result: AnalysisResult;
}

// Healthy baseline absorption of calcium is ~35% under resting conditions.
// Stress decreases digestive absorption by releasing cortisol, which leaches bone minerals
// and decreases standard active transport mechanisms of calcium in the gut.
export function calculateAbsorption(stressIndex: number, calciumMg: number): { absorptionRate: number; absorbedCalciumMg: number } {
  const baseRate = 35; // baseline resting absorption rate in %
  const stressFactor = 1 - (stressIndex / 100) * 0.6; // high stress reduces absorption efficiency by up to 60%
  const absorptionRate = Math.round(baseRate * stressFactor);
  const absorbedCalciumMg = Math.round(calciumMg * (absorptionRate / 100));
  return {
    absorptionRate,
    absorbedCalciumMg,
  };
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'stressed-parfait',
    title: 'Hackathon Overdrive ⚡️',
    description: 'High-stress face + Healthy yogurt parfait',
    result: {
      stressIndex: 82,
      stressAnalysis: {
        jawTension: 8,
        browTension: 9,
        indicators: [
          'Severe Masseter muscle contraction (tight jaw)',
          'Frequent Glabellar furrowing (brow tension)',
          'Shallow clavicular breathing patterns detected',
        ],
        physiologicalState: 'Fight-or-Flight',
      },
      nutrition: {
        foodName: 'Greek Yogurt Parfait with Chia Seeds & Almonds',
        calciumMg: 450,
        vitaminDmcg: 2.5,
        nutritionalAnalysis: 'High baseline calcium, but absorption is severely blocked by cortisol-induced vasoconstriction in the gastrointestinal tract.',
      },
      absorptionRate: 18, // 35 * (1 - 0.82 * 0.6) = 18%
      absorbedCalciumMg: 81,
    },
  },
  {
    id: 'relaxed-salmon',
    title: 'Post-Yoga Zen 🧘‍♂️',
    description: 'Relaxed/calm face + Salmon with spinach',
    result: {
      stressIndex: 12,
      stressAnalysis: {
        jawTension: 2,
        browTension: 1,
        indicators: [
          'Relaxed masseter and temporalis muscles',
          'Soft, smooth glabella (orbital region relaxed)',
          'Deep, diaphragmatic vagal-resonant breathing',
        ],
        physiologicalState: 'Optimal Parasympathetic',
      },
      nutrition: {
        foodName: 'Pan-Seared Salmon with Garlic Spinach',
        calciumMg: 380,
        vitaminDmcg: 14.5,
        nutritionalAnalysis: 'Outstanding bone-health combo. High Vitamin D actively synergizes with calcium for optimal bone mineral density.',
      },
      absorptionRate: 32, // 35 * (1 - 0.12 * 0.6) = 32%
      absorbedCalciumMg: 122,
    },
  },
  {
    id: 'stressed-pizza',
    title: 'Late Night Crunch 🍕',
    description: 'Fatigued, high-stress face + Pepperoni Pizza slice',
    result: {
      stressIndex: 90,
      stressAnalysis: {
        jawTension: 9,
        browTension: 8,
        indicators: [
          'Corrugator supercilii hyperactivity (stress furrowing)',
          'Significant signs of micro-fatigue around orbital rims',
          'Autonomic stress-response breath cycle detected',
        ],
        physiologicalState: 'Sympathetic Overdrive',
      },
      nutrition: {
        foodName: 'Double Cheese Pepperoni Pizza Slice',
        calciumMg: 200,
        vitaminDmcg: 0.2,
        nutritionalAnalysis: 'Moderate calcium from dairy, but high sodium content and extreme stress create a double-threat that promotes bone calcium excretion.',
      },
      absorptionRate: 16, // 35 * (1 - 0.90 * 0.6) = 16%
      absorbedCalciumMg: 32,
    },
  },
];

/**
 * Call local Next.js secure server-side proxy route `/api/analyze` 
 * to execute the Google Gemini API call, preventing CORS blockages in the browser.
 */
export async function callRealVisionAI(
  apiKey: string,
  selfieBase64: string, // without metadata prefix
  foodBase64: string // without metadata prefix
): Promise<AnalysisResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey,
      selfieBase64,
      foodBase64,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server returned error status (${response.status})`);
  }

  const rawResult = await response.json();

  // Run the absorption math locally to maintain integrity of our science model
  const math = calculateAbsorption(rawResult.stressIndex ?? 50, rawResult.nutrition?.calciumMg ?? 200);

  return {
    stressIndex: rawResult.stressIndex ?? 50,
    stressAnalysis: {
      jawTension: rawResult.stressAnalysis?.jawTension ?? 5,
      browTension: rawResult.stressAnalysis?.browTension ?? 5,
      indicators: rawResult.stressAnalysis?.indicators ?? ['General stress indicators analysed.'],
      physiologicalState: rawResult.stressAnalysis?.physiologicalState ?? 'Sympathetic Overdrive',
    },
    nutrition: {
      foodName: rawResult.nutrition?.foodName ?? 'Identified Meal',
      calciumMg: rawResult.nutrition?.calciumMg ?? 200,
      vitaminDmcg: rawResult.nutrition?.vitaminDmcg ?? 1.5,
      nutritionalAnalysis: rawResult.nutrition?.nutritionalAnalysis ?? 'General nutrient metrics.',
    },
    absorptionRate: math.absorptionRate,
    absorbedCalciumMg: math.absorbedCalciumMg,
  };
}

export interface OnboardingData {
  // Step 1: Health & Bio
  age: number;
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  goal: 'lose' | 'maintain' | 'gain';
  // Step 2: Constraints
  dailyBudget: number;
  homeZone: string;
  workZone: string;
  mealsPerDay: number;
  cookingFrequency: 'never' | 'sometimes' | 'often';
}

export interface OnboardingMetrics {
  targetCalories: number;
  targetProtein: number;
  bmr: number;
  tdee: number;
}

/**
 * Calculates metabolic targets based on Mifflin-St Jeor Equation
 */
export function calculateOnboardingMetrics(data: OnboardingData): OnboardingMetrics {
  const { age, gender, weightKg, heightCm, activityLevel, goal } = data;

  // Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average between male and female offset
  }

  // TDEE Multipliers
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  const tdee = bmr * multipliers[activityLevel];

  // Goals
  let targetCalories = tdee;
  if (goal === 'lose') {
    targetCalories -= 500;
  } else if (goal === 'gain') {
    targetCalories += 500;
  }

  // Protein targets: 1.2g/kg for maintain/loss, 1.8g/kg for gain
  const proteinMultiplier = goal === 'gain' ? 1.8 : 1.4;
  const targetProtein = Math.round(weightKg * proteinMultiplier);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    targetProtein,
  };
}
