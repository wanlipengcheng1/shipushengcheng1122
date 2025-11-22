
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WeeklyPlan, Meal } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Reusable schema parts
const macronutrientsSchema = {
  type: Type.OBJECT,
  properties: {
    protein: { type: Type.INTEGER, description: "Protein in grams" },
    fat: { type: Type.INTEGER, description: "Fat in grams" },
    carbs: { type: Type.INTEGER, description: "Carbohydrates in grams" }
  }
};

const ingredientSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    amount: { type: Type.STRING, description: "Precise amount e.g. '50g', '1个(约50g)'" },
    category: { type: Type.STRING }
  }
};

const mealSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    calories: { type: Type.INTEGER },
    macronutrients: macronutrientsSchema,
    description: { type: Type.STRING, description: "Short description of the dish taste and look" },
    recipeSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    ingredients: {
      type: Type.ARRAY,
      items: ingredientSchema
    }
  }
};

export const generateMealPlan = async (profile: UserProfile): Promise<WeeklyPlan> => {
  const ai = getClient();
  let modelName = profile.model;
  
  // Fallback/Simulation Logic:
  // If the user selects a model that is not natively supported by the current Google SDK instance 
  // (e.g. Chinese models), we use a robust Gemini model to *simulate* the output style or assume 
  // the environment proxies the request. For this demo, we simulate.
  const googleModels = ['gemini-2.5-flash', 'gemini-3-pro-preview', 'gemini-flash-lite-latest'];
  let promptPrefix = "";

  if (!googleModels.includes(modelName) && !modelName.startsWith('gemini')) {
      // Use a reliable model to simulate the reasoning of the selected agent
      promptPrefix = `[System Note: You are acting as the AI model "${modelName}". Adopt its typical reasoning style and characteristics while generating the following Chinese diet plan.]\n`;
      modelName = "gemini-2.5-flash"; 
  } else if (!modelName) {
      modelName = "gemini-2.5-flash";
  }

  const prompt = `
    ${promptPrefix}
    Role: You are a professional Chinese Dietitian and Chef (中国注册营养师 & 特级厨师).
    Task: Create a strictly structured 7-day diet plan for a user in Mainland China.
    
    User Profile:
    - Gender: ${profile.gender}
    - Age: ${profile.age}
    - Height: ${profile.height}cm
    - Weight: ${profile.weight}kg
    - Activity: ${profile.activityLevel}
    - Goal: ${profile.goal}
    - Disliked Foods: ${profile.dislikes || "None"}
    - Preferred Style: ${profile.dietStyle || "Chinese Home Cooking"}

    Requirements:
    1. **Sourcing**: All ingredients must be easily purchasable in standard Mainland China supermarkets (e.g., Yonghui, RT-Mart) or delivery apps (Meituan Maicai, Hema Fresh).
    2. **Measurements**: Provide PRECISE measurements in grams (g) for all ingredients. e.g. "瘦肉 50g", "青菜 200g". Avoid vague terms like "some".
    3. **Recipes**: Detailed step-by-step cooking instructions suitable for home kitchens.
    4. **Nutrition**: Accurate Protein, Fat, Carbs calculation per meal.
    5. **Language**: Strictly simplified Chinese (zh-CN).
    6. **Completeness**: Ensure the plan covers Monday to Sunday.
    
    Output: Return strictly valid JSON matching the schema.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weeklyOverview: { type: Type.STRING },
          dailyPlans: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                totalCalories: { type: Type.INTEGER },
                totalMacronutrients: macronutrientsSchema,
                nutritionTips: { type: Type.STRING },
                meals: {
                  type: Type.OBJECT,
                  properties: {
                    breakfast: mealSchema,
                    lunch: mealSchema,
                    dinner: mealSchema
                  }
                }
              }
            }
          },
          shoppingList: {
             type: Type.OBJECT,
             properties: {
                "蔬菜豆菌": { type: Type.ARRAY, items: { type: Type.STRING } },
                "肉蛋水产": { type: Type.ARRAY, items: { type: Type.STRING } },
                "主食谷物": { type: Type.ARRAY, items: { type: Type.STRING } },
                "水果乳品": { type: Type.ARRAY, items: { type: Type.STRING } },
                "调味其他": { type: Type.ARRAY, items: { type: Type.STRING } }
             }
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No data returned");
  return JSON.parse(text) as WeeklyPlan;
};

export const getMealAlternatives = async (
  profile: UserProfile, 
  type: 'Breakfast' | 'Lunch' | 'Dinner', 
  targetCalories: number,
  currentMealName: string
): Promise<Meal[]> => {
  const ai = getClient();
  let modelName = profile.model || "gemini-2.5-flash";
  
  // Fallback logic for alternatives as well
  const googleModels = ['gemini-2.5-flash', 'gemini-3-pro-preview', 'gemini-flash-lite-latest'];
  if (!googleModels.includes(modelName) && !modelName.startsWith('gemini')) {
      modelName = "gemini-2.5-flash";
  }
  
  const prompt = `
    Task: Generate 3 DISTINCT alternative ${type} options for a user in China.
    Context: The user wants to replace "${currentMealName}" but keep nutritional balance.
    Target Calories: Approximately ${targetCalories} kcal.
    User Goal: ${profile.goal}.
    Diet Style: ${profile.dietStyle || "Balanced"}.
    Dislikes: ${profile.dislikes}.
    
    Requirements:
    1. Chinese home cooking style (Mainland China standard).
    2. Ingredients must be accessible in Chinese markets.
    3. Return valid JSON array of meals with precise grams.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          alternatives: {
            type: Type.ARRAY,
            items: mealSchema
          }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No data returned");
  const result = JSON.parse(text);
  return result.alternatives;
}
