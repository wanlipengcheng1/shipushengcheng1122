
import React from 'react';
import { Meal } from '../types';
import { Clock, Flame, Utensils } from './Icons';
import { RefreshCw } from 'lucide-react';

interface Props {
  type: 'Breakfast' | 'Lunch' | 'Dinner';
  meal: Meal;
  onSwap?: () => void;
}

const typeMap = {
  Breakfast: '早',
  Lunch: '午',
  Dinner: '晚'
};

const colorMap = {
  Breakfast: 'bg-amber-50 text-amber-700 border-amber-100',
  Lunch: 'bg-orange-50 text-orange-700 border-orange-100',
  Dinner: 'bg-stone-50 text-stone-700 border-stone-100'
};

const titleColorMap = {
  Breakfast: 'text-amber-900',
  Lunch: 'text-orange-900',
  Dinner: 'text-stone-800'
}

// Improved image generation using LoremFlickr with specific food keywords and deterministic lock
// This ensures "fast generation" (cached) and "simple food images"
const getImage = (name: string) => {
  // Simple hash function for the seed
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const seed = Math.abs(hash);
  // Keywords: cooked, meal, chinese, dish - ensures it looks like a meal and not raw ingredients
  return `https://loremflickr.com/400/300/cooked,meal,chinese,food?lock=${seed}`;
};

export const MealCard: React.FC<Props> = ({ type, meal, onSwap }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 break-inside-avoid group relative ring-1 ring-slate-100 hover:ring-orange-200">
      
      {/* Header Image Area */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        <img 
          src={getImage(meal.name)} 
          alt={meal.name} 
          loading="lazy"
          className="w-full h-full object-cover opacity-95 group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
        
        <div className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full font-bold shadow-sm border-2 border-white ${colorMap[type]}`}>
          {typeMap[type]}
        </div>
        
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 flex items-center shadow-sm">
           <Flame size={12} className="mr-1 text-orange-500 fill-orange-500" /> {meal.calories}
        </div>
        
        {/* Swap Button - appears on hover */}
        {onSwap && (
          <button 
            onClick={(e) => { e.stopPropagation(); onSwap(); }}
            className="absolute top-3 right-3 bg-white text-slate-500 hover:text-orange-600 p-2 rounded-full shadow-md transition-all hover:scale-110 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
            title="更换菜谱"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
             <h3 className={`font-bold text-lg leading-tight ${titleColorMap[type]} flex-1`}>{meal.name}</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">{meal.description}</p>

        {/* Macros Mini-Bar */}
        {meal.macronutrients && (
            <div className="flex gap-2 mb-4 text-[10px] font-medium text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-200"></div>
                    <span>蛋 {meal.macronutrients.protein}g</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-200"></div>
                    <span>碳 {meal.macronutrients.carbs}g</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm shadow-amber-200"></div>
                    <span>脂 {meal.macronutrients.fat}g</span>
                </div>
            </div>
        )}

        {/* Ingredients */}
        <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
                {meal.ingredients.slice(0, 6).map((ing, idx) => (
                    <span key={idx} className="text-[11px] font-medium text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                        {ing.name}<span className="text-slate-400 ml-0.5">{ing.amount}</span>
                    </span>
                ))}
                {meal.ingredients.length > 6 && <span className="text-xs text-slate-400 px-1 self-center">...</span>}
            </div>
        </div>

        {/* Recipe */}
        <div className="mt-auto pt-3 border-t border-slate-100 border-dashed">
           <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1 uppercase tracking-wider">
             <Utensils size={10} /> 简易做法
           </p>
           <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1 leading-relaxed">
              {meal.recipeSteps.slice(0, 2).map((step, i) => (
                  <li key={i} className="line-clamp-1">{step}</li>
              ))}
           </ol>
        </div>
      </div>
    </div>
  );
};
