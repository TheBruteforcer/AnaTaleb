
import React, { useState, useEffect } from 'react';
import { generateQuiz } from '../services/geminiService';
import { quizService } from '../services/quizService';
import { Quiz, Question, Grade, User } from '../types';
import { STRINGS } from '../strings';
import LatexRenderer from './LatexRenderer';

interface QuizSystemProps {
  currentUser: User;
  initialQuizId?: string | null;
  directQuizData?: any | null; 
}

const QuizSystem: React.FC<QuizSystemProps> = ({ currentUser, initialQuizId, directQuizData }) => {
  const [view, setView] = useState<'create' | 'playing' | 'result' | 'loading' | 'list'>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [grade, setGrade] = useState<Grade>('الأول الثانوي');
  const [description, setDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(7);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    loadQuizzes();
    if (directQuizData) {
      handleDirectQuiz(directQuizData);
    } else if (initialQuizId) {
      loadSpecificQuiz(initialQuizId);
    }
  }, [initialQuizId, directQuizData]);

  const handleDirectQuiz = (data: any) => {
    const formatted: Quiz = {
      ...data,
      id: 'temp-' + Date.now(),
      grade: 'الأول الثانوي',
      timestamp: Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      questions: data.questions.map((q: any, i: number) => ({...q, id: `q-${i}`}))
    };
    setActiveQuiz(formatted);
    setView('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const loadQuizzes = async () => {
    const data = await quizService.getAll();
    setQuizzes(data);
  };

  const loadSpecificQuiz = async (id: string) => {
    setView('loading');
    const quiz = await quizService.getById(id);
    if (quiz) {
      setActiveQuiz(quiz);
      setView('playing');
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
    } else {
      setView('list');
    }
  };

  const handleSaveTempQuiz = async () => {
    if (!activeQuiz || !activeQuiz.id.startsWith('temp')) return;
    setIsSaving(true);
    try {
      const { id, timestamp, ...quizData } = activeQuiz;
      const newId = await quizService.save(quizData);
      setActiveQuiz({ ...activeQuiz, id: newId });
      alert("تم حفظ الكويز بنجاح! ✅");
      loadQuizzes();
    } catch (e) {
      alert("فشل الحفظ.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setView('loading');
    try {
      const generated = await generateQuiz(grade, description, questionCount, language);
      const newQuiz: Omit<Quiz, 'id' | 'timestamp'> = {
        title: generated.title,
        description: description,
        grade: grade,
        subject: '',
        questions: generated.questions.map((q: any, i: number) => ({...q, id: `q-${i}`})),
        authorId: currentUser.id,
        authorName: currentUser.name
      };
      const quizId = await quizService.save(newQuiz);
      setActiveQuiz({ ...newQuiz, id: quizId, timestamp: Date.now() });
      setView('playing');
      setCurrentQuestionIndex(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOption(null);
      loadQuizzes();
    } catch (err) {
      alert("فشل توليد الكويز.");
      setView('create');
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === activeQuiz?.questions[currentQuestionIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setView('result');
    }
  };

  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
        <h3 className="text-xl font-black text-slate-800 animate-pulse">{STRINGS.quiz.generating}</h3>
      </div>
    );
  }

  if (view === 'playing' && activeQuiz) {
    const q = activeQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-blue-50 overflow-hidden">
          <div className="h-2 bg-slate-100 w-full">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="p-8 md:p-12 text-right" key={currentQuestionIndex}>
            <div className="flex justify-between items-center mb-8">
              <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full uppercase tracking-widest">
                السؤال {currentQuestionIndex + 1} من {activeQuiz.questions.length}
              </span>
              <button onClick={() => {
                const url = `${window.location.origin}${window.location.pathname}?quizId=${activeQuiz.id}`;
                navigator.clipboard.writeText(url);
                alert(STRINGS.quiz.copySuccess);
              }} className="text-xs font-black text-slate-400">🔗 مشاركة</button>
            </div>

            <LatexRenderer text={q.text} className="text-xl md:text-2xl font-black text-slate-800 mb-10 leading-relaxed" />

            <div className="grid grid-cols-1 gap-4 mb-10">
              {q.options.map((opt, idx) => {
                let styles = "bg-slate-50 border-slate-100 text-slate-700 hover:border-blue-200";
                if (isAnswered) {
                  if (idx === q.correctAnswerIndex) styles = "bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20";
                  else if (idx === selectedOption) styles = "bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20";
                  else styles = "bg-slate-50 border-slate-100 text-slate-300 opacity-50";
                }

                return (
                  <button 
                    key={`${currentQuestionIndex}-${idx}`}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`p-5 rounded-2xl border-2 text-right font-bold transition-all transform active:scale-[0.98] ${styles}`}
                  >
                    <LatexRenderer text={opt} />
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="animate-in slide-in-from-bottom-4 duration-300">
                <div className={`p-6 rounded-3xl mb-8 ${selectedOption === q.correctAnswerIndex ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                  <h5 className="font-black text-sm mb-2">
                    {selectedOption === q.correctAnswerIndex ? `✅ ${STRINGS.quiz.correct}` : `❌ ${STRINGS.quiz.wrong}`}
                  </h5>
                  <LatexRenderer text={q.explanation} className="text-xs font-bold leading-relaxed" />
                </div>
                <button 
                  onClick={nextQuestion}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl hover:bg-blue-700 transition-all"
                >
                  {currentQuestionIndex === activeQuiz.questions.length - 1 ? STRINGS.quiz.finishQuiz : STRINGS.quiz.nextQuestion}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result' && activeQuiz) {
    const percentage = (score / activeQuiz.questions.length) * 100;
    return (
      <div className="max-w-md mx-auto text-center animate-in zoom-in duration-500">
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
          <div className="text-7xl mb-6">{percentage >= 50 ? '🎉' : '📚'}</div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">{STRINGS.quiz.scoreTitle}</h2>
          <div className="text-6xl font-black text-blue-600 mb-8">{score} / {activeQuiz.questions.length}</div>
          <div className="flex flex-col gap-4">
            <button onClick={() => setView('create')} className="bg-blue-600 text-white font-black py-4 rounded-2xl">كويز جديد</button>
            <button onClick={() => setView('list')} className="bg-slate-50 text-slate-600 font-black py-4 rounded-2xl">الرجوع</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 text-right">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h2 className="text-3xl font-black text-slate-800">{STRINGS.quiz.title}</h2>
        <button 
          onClick={() => setView('create')}
          className="bg-blue-600 text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 transition-all"
        >
          {STRINGS.quiz.createTitle}
        </button>
      </div>

      {view === 'create' && (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-blue-50 mb-12 animate-in slide-in-from-top-4">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase">{STRINGS.quiz.gradeLabel}</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold" value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
                  {STRINGS.quiz.allGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase">{STRINGS.quiz.countLabel}</label>
                <input type="number" min="3" max="20" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase">{STRINGS.quiz.langLabel}</label>
                <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold" value={language} onChange={(e) => setLanguage(e.target.value as 'ar' | 'en')}>
                  <option value="ar">{STRINGS.quiz.langArabic}</option>
                  <option value="en">{STRINGS.quiz.langEnglish}</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase">{STRINGS.quiz.descLabel}</label>
                <input className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold" placeholder={STRINGS.quiz.descPlaceholder} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
           </div>
           <button onClick={handleGenerate} disabled={!description.trim()} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black py-6 rounded-3xl text-xl shadow-2xl">
             {STRINGS.quiz.generateBtn}
           </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(q => (
          <div key={q.id} className="bg-white rounded-3xl p-6 border border-slate-100 hover:shadow-xl transition-all group">
             <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">{q.grade}</span>
                <span className="text-[9px] font-black text-slate-300">{new Date(q.timestamp).toLocaleDateString('ar-EG')}</span>
             </div>
             <h3 className="text-lg font-black text-slate-800 mb-2">{q.title}</h3>
             <button onClick={() => loadSpecificQuiz(q.id)} className="w-full bg-blue-600 text-white font-black py-3 rounded-xl text-xs">{STRINGS.quiz.startQuiz}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSystem;
