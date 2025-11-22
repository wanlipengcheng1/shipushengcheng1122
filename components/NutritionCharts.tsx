
import React from 'react';
import { DailyPlan, WeeklyPlan } from '../types';

interface WeeklyProps {
  plan: WeeklyPlan;
}

interface DailyProps {
  dayPlan: DailyPlan;
}

// --- Helper Components for Visualization ---

export const DailyMacroBar: React.FC<DailyProps> = ({ dayPlan }) => {
    if (!dayPlan.totalMacronutrients) return null;
    
    const { protein, carbs, fat } = dayPlan.totalMacronutrients;
    const total = protein + carbs + fat; // Weight based approximation for visual ratio
    
    // Calculate rough percentages for width (Protein ~4cal/g, Carbs ~4cal/g, Fat ~9cal/g for calorie ratio, but weight ratio is fine for this visual)
    const pPct = (protein / total) * 100;
    const cPct = (carbs / total) * 100;
    const fPct = (fat / total) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> 蛋白质 {protein}g</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 碳水 {carbs}g</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> 脂肪 {fat}g</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500" style={{ width: `${pPct}%` }}></div>
                <div className="h-full bg-blue-500" style={{ width: `${cPct}%` }}></div>
                <div className="h-full bg-yellow-500" style={{ width: `${fPct}%` }}></div>
            </div>
        </div>
    );
}

export const WeeklyNutritionChart: React.FC<WeeklyProps> = ({ plan }) => {
    const maxCals = Math.max(...plan.dailyPlans.map(d => d.totalCalories));
    
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 font-serif">本周营养概览</h3>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Calorie Trend Bar Chart */}
                <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase">热量摄入趋势 (kcal)</p>
                    <div className="flex items-end justify-between h-32 gap-2">
                        {plan.dailyPlans.map((d) => {
                            const height = (d.totalCalories / maxCals) * 100;
                            return (
                                <div key={d.day} className="flex flex-col items-center gap-1 flex-1 group">
                                    <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                        {d.totalCalories}
                                    </span>
                                    <div 
                                        className="w-full max-w-[24px] bg-orange-200 rounded-t-md hover:bg-orange-400 transition-all relative"
                                        style={{ height: `${height}%` }}
                                    ></div>
                                    <span className="text-xs text-slate-500">Day {d.day}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Average Macro Distribution */}
                <div className="flex-1 border-l border-slate-100 pl-0 md:pl-8">
                    <p className="text-xs font-bold text-slate-400 mb-3 uppercase">平均营养占比</p>
                    <div className="space-y-4 mt-4">
                         {/* We calculate average from the days */}
                        {(() => {
                            const avgP = Math.round(plan.dailyPlans.reduce((acc, d) => acc + (d.totalMacronutrients?.protein || 0), 0) / 7);
                            const avgC = Math.round(plan.dailyPlans.reduce((acc, d) => acc + (d.totalMacronutrients?.carbs || 0), 0) / 7);
                            const avgF = Math.round(plan.dailyPlans.reduce((acc, d) => acc + (d.totalMacronutrients?.fat || 0), 0) / 7);
                            const total = avgP + avgC + avgF || 1;

                            return (
                                <>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">蛋白质 (Protein)</span>
                                            <span className="font-bold text-slate-800">{avgP}g</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${(avgP/total)*100}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">碳水化合物 (Carbs)</span>
                                            <span className="font-bold text-slate-800">{avgC}g</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${(avgC/total)*100}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-600">脂肪 (Fat)</span>
                                            <span className="font-bold text-slate-800">{avgF}g</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500" style={{ width: `${(avgF/total)*100}%` }}></div>
                                        </div>
                                    </div>
                                </>
                            )
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};
