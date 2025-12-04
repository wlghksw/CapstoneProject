import React, { useState, useCallback } from 'react';
import BookIcon from './icons/BookIcon';

const LiberalArtsRecommender: React.FC = () => {
  // Liberal Arts State
  const [keywords, setKeywords] = useState('');
  const [purpose, setPurpose] = useState('힐링/취미');
  const [style, setStyle] = useState('팀플 없음');

  // Common State
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetLiberalArts = useCallback(async () => {
    if (!keywords.trim()) {
        setError('관심 키워드를 입력해주세요.');
        return;
    }
    setError('');
    setIsLoading(true);
    setResultText('');
    try {
        // Gemini 서비스가 제거되었습니다.
        setError('AI 서비스가 비활성화되었습니다.');
    } catch (e) {
        setError('추천을 불러오는 중 오류가 발생했습니다.');
    } finally {
        setIsLoading(false);
    }
  }, [keywords, purpose, style]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Header Area */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
                <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-full mr-3">
                    <BookIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">AI 맞춤 교양 추천</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">나의 관심사와 성향에 딱 맞는 교양 과목을 찾아보세요.</p>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5 animate-fade-in">
            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">관심사 키워드</label>
                 <input 
                    type="text" 
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="예: 심리학, 영화, 재테크, 운동"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm dark:text-gray-100"
                 />
                 <p className="text-xs text-gray-500 mt-1">요즘 관심있는 주제나 취미를 적어주세요.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">수강 목적 (Needs)</label>
                    <select 
                        value={purpose} 
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm dark:text-gray-100"
                    >
                        <option value="힐링/취미">😌 힐링 및 스트레스 해소</option>
                        <option value="학점 관리">📈 학점 잘 주는 꿀교양</option>
                        <option value="자기계발/지식">📚 새로운 지식 습득</option>
                        <option value="진로/취업">💼 취업 및 진로에 도움</option>
                        <option value="실용성">🛠️ 실생활에 유용한 정보</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">선호 수업 스타일</label>
                    <select 
                        value={style} 
                        onChange={(e) => setStyle(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-pink-500 focus:outline-none text-sm dark:text-gray-100"
                    >
                        <option value="팀플 없음">🚫 팀플 절대 사절</option>
                        <option value="과제 적음">📝 과제/시험 부담 적음</option>
                        <option value="발표 중심">🗣️ 발표 및 토론 선호</option>
                        <option value="체험/실습">🏃 직접 체험하고 실습</option>
                        <option value="온라인 강의">💻 비대면/온라인 강의</option>
                    </select>
                </div>
            </div>

            <button
                onClick={handleGetLiberalArts}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 shadow-lg"
            >
                {isLoading ? (
                     <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        추천 중...
                    </>
                ) : '나에게 딱 맞는 교양 찾기'}
            </button>

          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}

          {resultText && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
              <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">
                  AI 맞춤 교양 추천 결과
              </h3>
              <div className="prose prose-sm prose-pink dark:prose-invert max-w-none p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {resultText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiberalArtsRecommender;