import React, { useState, useCallback } from 'react';
import { getCourseRoadmap } from '../services/geminiService';
import GraduationCapIcon from './icons/GraduationCapIcon';

const MajorRecommender: React.FC = () => {
  // Major Roadmap State
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('1학년');
  const [careerGoal, setCareerGoal] = useState('');
  
  // Common State
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRoadmap = useCallback(async () => {
    if (!major.trim() || !careerGoal.trim()) {
      setError('전공과 희망 진로를 모두 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);
    setResultText('');
    try {
      const result = await getCourseRoadmap(major, grade, careerGoal);
      setResultText(result);
    } catch (e) {
      setError('로드맵을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [major, grade, careerGoal]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Header Area */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-3">
                    <GraduationCapIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">전공 이수 로드맵</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">학년과 진로에 맞춘 최적의 커리큘럼을 제안합니다.</p>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">전공 (학과)</label>
                    <input 
                        type="text" 
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="예: 컴퓨터공학과, 경영학과"
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm dark:text-gray-100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">현재 학년</label>
                    <select 
                        value={grade} 
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm dark:text-gray-100"
                    >
                        <option value="1학년">1학년</option>
                        <option value="2학년">2학년</option>
                        <option value="3학년">3학년</option>
                        <option value="4학년">4학년</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">희망 진로 / 관심 분야</label>
                <textarea
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="예: AI 연구원, 프론트엔드 개발자, 마케팅 전문가 등 구체적으로 적어주세요."
                    className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-sm dark:text-gray-100"
                />
            </div>
            <button
                onClick={handleGetRoadmap}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg"
            >
                {isLoading ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    분석 중...
                    </>
                ) : '맞춤형 로드맵 생성하기'}
            </button>

            {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}

            {resultText && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
                    AI 로드맵 분석 결과
                </h3>
                <div className="prose prose-sm prose-indigo dark:prose-invert max-w-none p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {resultText}
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MajorRecommender;