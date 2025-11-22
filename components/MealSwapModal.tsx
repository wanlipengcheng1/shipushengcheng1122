
import React from 'react';
import { Meal } from '../types';
import { MealCard } from './MealCard';
import { ArrowLeft } from './Icons';

interface Props {
  isOpen: boolean;
  isLoading: boolean;
  currentMealName: string;
  alternatives: Meal[];
  onSelect: (meal: Meal) => void;
  onClose: () => void;
}

export const MealSwapModal: React.FC<Props> = ({ 
  isOpen, 
  isLoading, 
  currentMealName, 
  alternatives, 
  onSelect, 
  onClose 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-800">更换菜谱</h3>
            <p className="text-sm text-slate-500">当前: {currentMealName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
             <ArrowLeft size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-slate-50 flex-grow">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-4"></div>
                <p>正在生成更多美味选择...</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {alternatives.map((meal, idx) => (
                    <div key={idx} className="cursor-pointer ring-2 ring-transparent hover:ring-orange-400 rounded-2xl transition-all transform hover:-translate-y-1" onClick={() => onSelect(meal)}>
                        {/* Re-use MealCard but maybe simpler? No, reuse is good for consistency. Force a type for visuals. */}
                        <MealCard type="Lunch" meal={meal} /> 
                        <div className="mt-2 text-center">
                            <button className="w-full py-2 bg-slate-800 text-white text-sm rounded-lg font-bold">选择此菜谱</button>
                        </div>
                    </div>
                ))}
             </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 text-center text-xs text-slate-400">
            选择新菜谱将替换当前日期的对应餐点，营养数据将自动更新。
        </div>
      </div>
    </div>
  );
};
