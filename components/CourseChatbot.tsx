
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { createCourseChat, continueCourseChatStream } from '../services/geminiService';
import RobotIcon from './icons/RobotIcon';
import PlusIcon from './icons/PlusIcon';
import { Chat } from '@google/genai';

const CourseChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', text: '안녕하세요! 어떤 종류의 교양 과목을 찾고 계신가요? 관심사를 알려주시면 추천해 드릴게요.', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      chatRef.current = createCourseChat();
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      setMessages(prev => [...prev, { 
        id: 'error', 
        text: 'AI 채팅을 초기화하는 중 오류가 발생했습니다. API 키를 확인해주세요.', 
        sender: 'ai' 
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    
    if (!textToSend.trim() || !chatRef.current) return;

    const userMessage: Message = { id: Date.now().toString(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    // Only clear input if we are sending what's in the input field
    if (typeof textOverride !== 'string') {
        setInput('');
    }
    
    setIsMenuOpen(false);
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);
    
    try {
      const stream = await continueCourseChatStream(chatRef.current, textToSend);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: msg.text + chunkText } : msg
            ));
        }
      }
    } catch (error) {
        setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: '오류가 발생했습니다. 잠시 후 다시 시도해주세요.' } : msg
        ));
    } finally {
      setIsLoading(false);
    }
  }, [input]);

  const faqOptions = [
    { label: '팀플', query: '이 강의의 팀플 방식은 어떻게 돼? 팀프로젝트나/조별과제가 많이 있어?' },
    { label: '온라인 수업', query: '이 강의에는 온라인 수업이 있어?.' },
    { label: '수업 난이도', query: '이 강의에 난이도는 어떻게 돼?' },
  ];

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-180px)] flex flex-col">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex-grow flex flex-col overflow-hidden">
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
                {/* FAQ Menu */}
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
