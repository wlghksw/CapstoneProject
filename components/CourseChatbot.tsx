
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import RobotIcon from './icons/RobotIcon';
import PlusIcon from './icons/PlusIcon';

// 백엔드 API 서버 URL (포트 5000)
const API_URL = 'http://localhost:5000';

// 강의 목록 데이터
const COURSE_CATEGORIES = [
  {
    category: '균형 - 인간문화이해',
    courses: [
      '독서지도의 이해(교류)',
      '문화카페기행(교류)',
      '미래사회와 과학기술 - 조영철',
      '정신건강의 이해 - 박명옥',
      '정신건강의 이해 - 한미현',
      '결혼과 가족',
      'AI 시대의 심리학 - 임헌만',
      '성경 속 명장면 프로덕션 - 박선미',
      '사랑의 심리학 - 한정희',
      '문학의 이해 - 권윤경',
      '문학의 이해 - 문광헌',
      '문학의 이해 - 임성규',
      '세계문화사 - 이승준',
      '한국사상과 문화 - 이승준',
      '그림으로 심리읽기 - 송춘의',
      '생명과 죽음의 이해 - 허정완',
      '문화콘텐츠와창의성(교류성)',
      '인간심리와 행동 - 최혜란',
      '한국문화유산의 이해 - 전상욱',
      '인간과 윤리 - 황보갑',
      '현대인의 삶과 철학 - 최한빈',
      '문화인류학의 이해 - 윤영조',
      '문화현상의 철학적 이해 - 이선우',
      '동양철학의 이해 - 이승원',
      '동양철학의 이해 - 민경삼',
      '서양철학의 이해 - 최한빈',
      '인문학과의 만남 - 강태평',
      '고전산책 - 류영하',
      '고전산책 - 권윤경',
      '언어와 문화간 의사소통 - 배진영',
      '언어와 문화간 의사소통 - 이남희',
      '포스트휴먼시대와 인간 - 김완종',
      '인류공동유산의이해와보존 - 정수환',
    ]
  },
  {
    category: '균형 - 자연과학기술이해',
    courses: [
      '전쟁과 무기체계 - 황선남',
      '전쟁과 무기체계 - 이성복',
      '지구의탐구 - 윤정희',
      '자연과 인간 - 전인수',
      '천문학과 우주의 이해 - 정연철',
      '환경과 기술 - 전인수',
      '4차 산업혁명의 이해 - 이용태',
      '생명의 신비 - 문성채',
      '보건학 - 박혜원',
      '인공지능',
    ]
  },
  {
    category: '균형 - 예술체육이해',
    courses: [
      '메가트렌드와 미래디자인 - 최가을',
      '메가트렌드와 미래디자인 - 강은정',
      '음악으로 세상읽기 - 이재은',
      '음악으로 세상읽기 - 곽안나',
      '문학과 미술로 만나는 음악 - 임청화',
      '문학과 미술로 만나는 음악 - 이재은',
      '문화예술교육개론 - 정재미',
      '포스트모던아트읽기 - 노정은',
      '포스트모던아트읽기 - 조용준',
      '영상예술의 이해 - 김종국',
      '현대생활과 체육 - 박재서',
      '색채디자인의 이해 - 김민성',
      '클래식음악 산책 - 곽안나',
      '현대사회와 디자인 - 조은환',
      '태권도의이론과실제 - 유광현',
      '웨이트트레이닝이론과실제 - 이상규',
      '유튜버와영상제작 - 이은화',
      '창작곡과유튜브 - 이은화',
      '풋살의이론과실제 - 최지만',
      '골프의이론과실제 - 김동현',
      '골프의이론과실제 - 최완욱',
      '골프의이론과실제 - 김태승',
      '공연예술의 이해와 참여 - 김제영',
      '음악을 통한 심리학의 이해 - 이상연',
      '음악감상법',
      '배드민턴의 이해와 실제 - 김휘태',
    ]
  },
  {
    category: '균형 - 사회역사 이해',
    courses: [
      '국제관계와 질서 - 이우진',
      '국제관계와 질서 - 유현선',
      '여성학 - 정의솔',
      '여성학 - 허연숙',
      '생활과 법률 - 이우진',
      '정치와 미디어 커뮤니케이션 - 유준석',
      '반려동물과 현대사회 - 윤서영',
      '한국사 탐방 - 이승준',
      '알기쉬운 정치 경제 - 김두중',
      '국가안보론 - 황선남',
      '전쟁사 - 구재서',
      '전쟁사 - 임경민',
      '소수집단의 이해와 지원 - 박현정',
      '천안의 이해 - 이승원',
      '국제개발협력의 이해 - 맹창호',
      '진로탐색과 미래설계 - 박영진',
      '진로탐색과 미래설계 - 이연복',
      '성공취업실전 - 이향정',
      '성공취업실전 - 박영진',
      '성공취업실전 - 이화연',
      '글로벌시대의 다문화교육 - 김동욱',
      '경제학의 이해 - 정진욱',
      '경제학의 이해 - 남정우',
      '경제학의 이해 - 윤종인',
      '시장과 경제 - 이경락',
      '시장과 경제 - 박성민',
      '시장과 경제 - 이찬기',
      '정치와 사회 - 유준석',
      '청년발달과 자기이해 - 배라영',
      '청년발달과 자기이해 - 신경숙',
      '저출산고령화 사회의 이해와 과제 - 조은미',
    ]
  }
];

const CourseChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: '안녕하세요! 백석대학교 과목 정보 챗봇입니다. 왼쪽에서 강의를 선택하거나 직접 질문해주세요.', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['균형 - 인간문화이해']));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    
    if (!textToSend.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    if (typeof textOverride !== 'string') {
        setInput('');
    }
    
    setIsMenuOpen(false);
    setIsLoading(true);

    try {
      // 백엔드 서버는 포트 5000에서 실행됩니다
      const apiUrl = 'http://localhost:5000';
      const requestUrl = `${apiUrl}/chat`;
      console.log('[DEBUG] API 요청 URL:', requestUrl);
      console.log('[DEBUG] 현재 시간:', new Date().toISOString());
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: textToSend }),
      });

      if (!response.ok) {
        throw new Error('서버 오류가 발생했습니다.');
      }

      const data = await response.json();
      const aiMessage: Message = { 
        id: Date.now().toString(), 
        text: data.answer || '죄송합니다. 답변을 생성할 수 없습니다.', 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('API 호출 오류:', error);
      const aiMessage: Message = { 
        id: Date.now().toString(), 
        text: '서버에 연결할 수 없습니다. 백엔드 서버가 포트 5001에서 실행 중인지 확인해주세요.', 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const handleCourseClick = (courseName: string) => {
    setSelectedCourse(courseName);
    handleSend(`${courseName} 강의 어때?`);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const faqOptions = [
    { label: '팀플', query: '이 강의의 팀플 방식은 어떻게 돼? 팀프로젝트나/조별과제가 많이 있어?' },
    { label: '온라인 수업', query: '이 강의에는 온라인 수업이 있어?.' },
    { label: '수업 난이도', query: '이 강의에 난이도는 어떻게 돼?' },
  ];

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* 왼쪽: 강의 목록 */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-800 dark:text-gray-200 text-lg">강의 목록</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {COURSE_CATEGORIES.map((categoryData) => (
            <div key={categoryData.category} className="mb-2">
              <button
                onClick={() => toggleCategory(categoryData.category)}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-between transition-colors"
              >
                <span>{categoryData.category}</span>
                <span className="text-xs">
                  {expandedCategories.has(categoryData.category) ? '▼' : '▶'}
                </span>
              </button>
              {expandedCategories.has(categoryData.category) && (
                <div className="ml-2 mt-1 space-y-1">
                  {categoryData.courses.map((course) => (
                    <button
                      key={course}
                      onClick={() => handleCourseClick(course)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${
                        selectedCourse === course
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {course}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 챗봇 */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-3">
            <RobotIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="font-bold text-gray-800 dark:text-gray-200">AI 튜터</h2>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <RobotIcon className="h-4 w-4 text-indigo-500" />
                </div>
              )}
              <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600'
              }`}>
                {msg.text || (
                  <div className="flex items-center space-x-1 h-5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 relative">
          {isMenuOpen && (
            <div className="absolute bottom-full left-3 mb-2 flex flex-col gap-2 z-20 min-w-[160px] animate-scale-in origin-bottom-left">
              {faqOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleSend(option.query)}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold hover:bg-blue-50 dark:hover:bg-gray-600 hover:text-blue-600 dark:hover:text-blue-400 text-left transition-all transform hover:scale-105 flex items-center"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-3 rounded-full transition-all duration-200 focus:outline-none ${
                isMenuOpen 
                ? 'bg-gray-200 dark:bg-gray-600 rotate-45 text-gray-700 dark:text-gray-200' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400'
              }`}
              title="자주 묻는 질문"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="메시지를 입력하세요..."
              className="flex-grow px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-100 text-sm transition-shadow"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseChatbot;
