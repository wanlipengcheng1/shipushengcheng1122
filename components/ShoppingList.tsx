
import React from 'react';
import { WeeklyPlan } from '../types';
import { ShoppingCart } from './Icons';

interface Props {
  plan: WeeklyPlan;
}

export const ShoppingList: React.FC<Props> = ({ plan }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="bg-green-100 p-3 rounded-full text-green-600">
            <ShoppingCart size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">本周采购清单 (待办)</h2>
            <p className="text-slate-500 text-sm">基于生成的7天食谱自动汇总。去超市前记得带上哦！</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(plan.shoppingList).map(([category, items]) => (
          <div key={category} className="bg-slate-50 rounded-xl p-4 border border-slate-100 break-inside-avoid">
            <h3 className="font-bold text-slate-700 mb-3 flex items-center">
                <span className="w-1.5 h-4 bg-orange-400 rounded-full mr-2"></span>
                {category}
            </h3>
            <ul className="space-y-2">
              {(items as string[]).map((item, idx) => (
                <li key={idx} className="flex items-start text-sm text-slate-600 hover:bg-white p-1 rounded transition-colors cursor-pointer group">
                  <input type="checkbox" className="mt-1 mr-2 accent-orange-500 h-4 w-4 border-slate-300 rounded" id={`item-${category}-${idx}`} />
                  <label htmlFor={`item-${category}-${idx}`} className="cursor-pointer group-hover:text-slate-900 select-none decoration-slate-300 peer-checked:line-through">
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
