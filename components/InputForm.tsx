
import React, { useState } from 'react';
import { UserProfile, Gender, Goal, ActivityLevel } from '../types';
import { Activity, ChefHat, Utensils, ArrowLeft } from './Icons';

interface Props {
  onSubmit: (profile: UserProfile) => void;
  isLoading: boolean;
}

interface AIModel {
    id: string;
    name: string;
    desc: string;
    group: 'Google' | 'China' | 'Other';
}

const AI_MODELS: AIModel[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: '谷歌 · 速度快 · 均衡推荐', group: 'Google' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', desc: '谷歌 · 高智商 · 深度推理', group: 'Google' },
  { id: 'deepseek-r1', name: 'DeepSeek R1', desc: '深度求索 · 国产最强开源', group: 'China' },
  { id: 'doubao-pro-32k', name: 'Doubao Pro', desc: '字节跳动 · 豆包 · 懂中文', group: 'China' },
  { id: 'moonshot-v1-32k', name: 'Moonshot V1', desc: 'Kimi · 月之暗面 · 长文本', group: 'China' },
];

export const InputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [profile, setProfile] = useState<UserProfile>({
    gender: Gender.Female,
    age: 28,
    height: 162,
    weight: 55,
    activityLevel: ActivityLevel.Sedentary,
    goal: Goal.LoseWeight,
    dislikes: '',
    dietStyle: '',
    model: 'gemini-2.5-flash',
  });

  const handleChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-orange-100">
      <div className="text-center mb-10">
        <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <ChefHat className="w-10 h-10 text-orange-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3 font-serif tracking-wide">AI 膳食指南</h1>
        <p className="text-orange-600 font-medium opacity-90">基于中国居民膳食指南 · 个性化定制</p>
      </div>

      <div className="space-y-8">
        {/* Gender & Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">性别</label>
            <div className="flex gap-3">
              {Object.values(Gender).map((g) => (
                <button
                  key={g}
                  onClick={() => handleChange('gender', g)}
                  className={`flex-1 py-3 rounded-2xl border-2 transition-all font-medium ${
                    profile.gender === g
                      ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                      : 'border-slate-100 text-slate-500 hover:border-orange-200 hover:bg-slate-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">年龄</label>
            <div className="relative">
                <input
                type="number"
                value={profile.age}
                onChange={(e) => handleChange('age', parseInt(e.target.value))}
                className="w-full p-3 pl-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 outline-none transition-all font-medium text-slate-700"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">岁</span>
            </div>
          </div>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">身高</label>
            <div className="relative">
                <input
                type="number"
                value={profile.height}
                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                className="w-full p-3 pl-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 outline-none transition-all font-medium text-slate-700"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">cm</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">体重</label>
            <div className="relative">
                <input
                type="number"
                value={profile.weight}
                onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                className="w-full p-3 pl-4 rounded-2xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 outline-none transition-all font-medium text-slate-700"
                />
                <span className="absolute right-4 top-3.5 text-slate-400 text-sm font-medium">kg</span>
            </div>
          </div>
        </div>

        {/* Activity */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">日常活动强度</label>
          <div className="relative">
            <select
                value={profile.activityLevel}
                onChange={(e) => handleChange('activityLevel', e.target.value)}
                className="w-full p-3 pl-4 pr-10 rounded-2xl border-2 border-slate-100 focus:border-orange-500 focus:ring-0 outline-none bg-white appearance-none font-medium text-slate-700 cursor-pointer"
            >
                {Object.values(ActivityLevel).map((l) => (
                <option key={l} value={l}>{l}</option>
                ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none text-slate-400">
                <ArrowLeft size={16} className="-rotate-90" />
            </div>
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">目标</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.values(Goal).map((g) => (
              <button
                key={g}
                onClick={() => handleChange('goal', g)}
                className={`py-3 rounded-2xl border-2 font-bold transition-all ${
                  profile.goal === g
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 transform scale-105'
                    : 'border-slate-100 text-slate-500 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Utensils size={18} className="text-orange-500" />
                <span>选择 AI 智能体 (Model)</span>
            </label>
            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {AI_MODELS.map((m) => (
                     <button
                     key={m.id}
                     onClick={() => handleChange('model', m.id)}
                     className={`text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between group ${
                       profile.model === m.id
                         ? 'bg-white border-slate-800 shadow-md'
                         : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'
                     }`}
                   >
                     <div>
                        <div className={`font-bold text-sm ${profile.model === m.id ? 'text-slate-800' : 'text-slate-600'}`}>{m.name}</div>
                        <div className="text-xs opacity-70 mt-0.5">{m.desc}</div>
                     </div>
                     {profile.model === m.id && <div className="w-3 h-3 rounded-full bg-slate-800"></div>}
                   </button>
                ))}
            </div>
        </div>

        {/* Advanced (Optional) */}
        <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center gap-2 mb-4 text-orange-800 font-bold">
            <Activity size={18} />
            <span>高级设置 (选填)</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-orange-700/70 mb-1 uppercase tracking-wide">忌口 / 不喜欢的食材</label>
              <input
                type="text"
                placeholder="例如: 香菜, 苦瓜, 海鲜..."
                value={profile.dislikes}
                onChange={(e) => handleChange('dislikes', e.target.value)}
                className="w-full p-3 rounded-xl border border-orange-200 focus:border-orange-400 outline-none text-sm bg-white/80 placeholder:text-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-orange-700/70 mb-1 uppercase tracking-wide">饮食风格偏好</label>
              <input
                type="text"
                placeholder="例如: 东北菜, 川菜, 清淡, 减脂餐..."
                value={profile.dietStyle}
                onChange={(e) => handleChange('dietStyle', e.target.value)}
                className="w-full p-3 rounded-xl border border-orange-200 focus:border-orange-400 outline-none text-sm bg-white/80 placeholder:text-orange-300"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => onSubmit(profile)}
          disabled={isLoading}
          className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all transform active:scale-95 ${
            isLoading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1'
          }`}
        >
          {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>正在为您规划...</span>
              </div>
          ) : '立即生成 7 天食谱'}
        </button>
      </div>
    </div>
  );
};
