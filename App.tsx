
import React, { useState, useEffect } from 'react';
import { generateMealPlan, getMealAlternatives } from './services/geminiService';
import { UserProfile, WeeklyPlan, Meal } from './types';
import { InputForm } from './components/InputForm';
import { MealCard } from './components/MealCard';
import { ShoppingList } from './components/ShoppingList';
import { WeeklyNutritionChart, DailyMacroBar } from './components/NutritionCharts';
import { MealSwapModal } from './components/MealSwapModal';
import { ArrowLeft, Download, ShoppingCart } from './components/Icons';

const App: React.FC = () => {
  const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [activeDayScroll, setActiveDayScroll] = useState(1);

  // Swap Modal State
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isSwappingLoading, setIsSwappingLoading] = useState(false);
  const [swapTarget, setSwapTarget] = useState<{dayIndex: number, type: 'breakfast' | 'lunch' | 'dinner', meal: Meal} | null>(null);
  const [alternatives, setAlternatives] = useState<Meal[]>([]);

  useEffect(() => {
    if (process.env.API_KEY) {
        setIsApiKeySet(true);
    }
  }, []);

  const handleGenerate = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setStep('loading');
    try {
      const result = await generateMealPlan(userProfile);
      setPlan(result);
      setStep('result');
    } catch (error) {
      console.error("Generation failed:", error);
      alert("生成失败，请检查API Key或稍后重试。");
      setStep('input');
    }
  };

  const handleOpenSwap = async (dayIndex: number, type: 'breakfast' | 'lunch' | 'dinner', meal: Meal) => {
      if (!profile) return;
      
      setSwapTarget({ dayIndex, type, meal });
      setIsSwapModalOpen(true);
      setIsSwappingLoading(true);
      setAlternatives([]); // clear previous

      try {
          // Map type to proper case for API
          const apiType = type.charAt(0).toUpperCase() + type.slice(1) as 'Breakfast' | 'Lunch' | 'Dinner';
          const alts = await getMealAlternatives(profile, apiType, meal.calories, meal.name);
          setAlternatives(alts);
      } catch (e) {
          console.error(e);
          alert("获取备选菜谱失败，请重试");
          setIsSwapModalOpen(false);
      } finally {
          setIsSwappingLoading(false);
      }
  };

  const handleSelectAlternative = (newMeal: Meal) => {
      if (!plan || !swapTarget) return;

      // Deep copy plan to update
      const newPlan = JSON.parse(JSON.stringify(plan)) as WeeklyPlan;
      const targetDay = newPlan.dailyPlans[swapTarget.dayIndex];
      
      // Update meal
      if (swapTarget.type === 'breakfast') targetDay.meals.breakfast = newMeal;
      if (swapTarget.type === 'lunch') targetDay.meals.lunch = newMeal;
      if (swapTarget.type === 'dinner') targetDay.meals.dinner = newMeal;

      // Recalculate totals for that day
      const meals = [targetDay.meals.breakfast, targetDay.meals.lunch, targetDay.meals.dinner];
      targetDay.totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
      
      if (newMeal.macronutrients) {
        targetDay.totalMacronutrients = meals.reduce((acc, m) => ({
            protein: acc.protein + (m.macronutrients?.protein || 0),
            fat: acc.fat + (m.macronutrients?.fat || 0),
            carbs: acc.carbs + (m.macronutrients?.carbs || 0),
        }), { protein: 0, fat: 0, carbs: 0 });
      }

      setPlan(newPlan);
      setIsSwapModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
      setStep('input');
      setPlan(null);
      setActiveDayScroll(1);
  };

  const scrollToDay = (day: number | 'shopping') => {
    const id = day === 'shopping' ? 'shopping-list-section' : `day-${day}`;
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 140;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      if (typeof day === 'number') {
          setActiveDayScroll(day);
      }
    }
  };

  if (!isApiKeySet) {
      return <div className="h-screen flex items-center justify-center text-red-500">Error: Missing API_KEY in environment.</div>
  }

  return (
    <div className="min-h-screen pb-12 bg-[#fdfbf7]">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 no-print shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-600 font-serif font-bold text-xl cursor-pointer" onClick={handleReset}>
            NUTRI·GEN
          </div>
          {step === 'result' && (
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-1">
                <ArrowLeft size={16} /> <span className="hidden md:inline">重置</span>
              </button>
              <button 
                onClick={handlePrint} 
                className="px-4 py-2 text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg font-medium flex items-center gap-1"
              >
                <Download size={16} /> <span className="hidden md:inline">导出 PDF</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {step === 'input' && (
          <InputForm onSubmit={handleGenerate} isLoading={false} />
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500 mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">正在为您定制食谱...</h2>
            <p className="text-slate-500">AI 正在根据您的身体数据计算最佳营养配比</p>
            <p className="text-slate-400 text-sm mt-2">使用模型: {profile?.model || 'Gemini 2.5 Flash'}</p>
          </div>
        )}

        {step === 'result' && plan && profile && (
          <div className="animate-fade-in">
            {/* Result Header */}
            <div className="text-center mb-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-300 via-amber-300 to-orange-300"></div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-800 mb-4">
                    7天健康{profile.goal}家常菜食谱
                </h1>
                <div className="flex flex-wrap justify-center gap-3">
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">{profile.goal}</span>
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">{profile.gender} · {profile.age}岁</span>
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">BMI: {(profile.weight / ((profile.height/100)**2)).toFixed(1)}</span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-100">AI: {profile.model}</span>
                </div>
                <p className="text-slate-500 mt-4 italic max-w-2xl mx-auto">"{plan.weeklyOverview}"</p>
            </div>

            {/* NEW: Weekly Stats Chart */}
            <WeeklyNutritionChart plan={plan} />

            {/* Sticky Navigation */}
            <div className="sticky top-16 z-20 bg-[#fdfbf7]/95 backdrop-blur pt-2 pb-4 mb-6 no-print overflow-x-auto border-b border-slate-200/50">
                <div className="flex justify-start md:justify-center gap-2 min-w-max px-2">
                    {[1,2,3,4,5,6,7].map(day => (
                        <button
                            key={day}
                            onClick={() => scrollToDay(day)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                                activeDayScroll === day 
                                ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                                : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300'
                            }`}
                        >
                            Day {day}
                        </button>
                    ))}
                     <div className="w-px bg-slate-300 mx-2 h-8 self-center"></div>
                     <button
                        onClick={() => scrollToDay('shopping')}
                        className="px-4 py-2 rounded-full text-sm font-bold transition-all border bg-white text-orange-600 border-orange-200 hover:bg-orange-50 flex items-center gap-1"
                    >
                        <ShoppingCart size={14} /> 清单
                    </button>
                </div>
            </div>

            {/* Main Content Area - Single Page Layout */}
            <div className="space-y-16">
                {/* Daily Plans Loop */}
                <div className="space-y-16">
                    {plan.dailyPlans.map((dayPlan, dayIndex) => (
                        <div 
                            key={dayPlan.day} 
                            id={`day-${dayPlan.day}`}
                            className="scroll-mt-40 print:break-inside-avoid print:break-after-page"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                <div className="flex items-baseline gap-4">
                                    <h2 className="text-4xl font-serif font-bold text-slate-800 relative pl-2">
                                        <span className="absolute -top-4 -left-4 text-6xl text-orange-500/10 -z-10 select-none font-sans">0{dayPlan.day}</span>
                                        周{['一','二','三','四','五','六','日'][dayPlan.day-1]}
                                    </h2>
                                    <div className="h-px bg-slate-200 flex-grow w-12 md:w-32 hidden md:block"></div>
                                </div>
                                
                                {/* Daily Nutrition Summary */}
                                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center min-w-[300px]">
                                    <div className="text-right border-r border-slate-100 pr-4 mr-2">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Daily Intake</span>
                                        <span className="text-lg font-bold text-orange-600">{dayPlan.totalCalories} kcal</span>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <DailyMacroBar dayPlan={dayPlan} />
                                    </div>
                                </div>
                            </div>

                            {/* Grid of Meals */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MealCard 
                                    type="Breakfast" 
                                    meal={dayPlan.meals.breakfast} 
                                    onSwap={() => handleOpenSwap(dayIndex, 'breakfast', dayPlan.meals.breakfast)}
                                />
                                <MealCard 
                                    type="Lunch" 
                                    meal={dayPlan.meals.lunch} 
                                    onSwap={() => handleOpenSwap(dayIndex, 'lunch', dayPlan.meals.lunch)}
                                />
                                <MealCard 
                                    type="Dinner" 
                                    meal={dayPlan.meals.dinner} 
                                    onSwap={() => handleOpenSwap(dayIndex, 'dinner', dayPlan.meals.dinner)}
                                />
                            </div>
                            
                            <div className="mt-6 bg-blue-50 text-blue-800 text-sm p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                <span className="font-bold shrink-0">💡 营养贴士:</span>
                                {dayPlan.nutritionTips}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Shopping List Section at Bottom */}
                <div id="shopping-list-section" className="scroll-mt-40 pt-8 border-t-2 border-dashed border-slate-200 print:break-before-page">
                    <ShoppingList plan={plan} />
                    
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <h3 className="font-serif font-bold text-lg mb-3">饮食须知</h3>
                            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
                                <li>烹饪时请控制油盐用量，推荐使用橄榄油或山茶油。</li>
                                <li>每天饮水至少 2000ml。</li>
                                <li>蔬菜分量不限，饿了可以多吃绿叶菜。</li>
                                <li>如有食物过敏，请自行替换同类食材。</li>
                            </ul>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center p-6">
                             <h3 className="font-serif text-2xl font-bold text-slate-800 mb-1">NutriGen AI</h3>
                             <p className="text-slate-400 text-sm">智能膳食规划系统</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            <MealSwapModal 
                isOpen={isSwapModalOpen}
                isLoading={isSwappingLoading}
                currentMealName={swapTarget?.meal.name || ''}
                alternatives={alternatives}
                onClose={() => setIsSwapModalOpen(false)}
                onSelect={handleSelectAlternative}
            />

          </div>
        )}
      </main>
    </div>
  );
};

export default App;
