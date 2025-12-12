
import React from 'react';
import { AppView, User } from '../types';
import HomeIcon from './icons/HomeIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';

interface NavbarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  user: User | null;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoutClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeView, 
  setActiveView,
  user,
  onLoginClick,
  onSignUpClick,
  onLogoutClick,
}) => {
  const navItems = [
    { id: 'major', label: '전공', icon: ChartBarIcon },
    { id: 'timetable', label: '홈', icon: HomeIcon },
    { id: 'chatbot', label: 'AI 채팅', icon: ChatBubbleIcon },
  ] as const;

  return (
    <>
      {/* Top Header for mobile app feel */}
      <header className="bg-gray-50 dark:bg-gray-900 fixed top-0 left-0 right-0 z-40 px-4 py-4 flex justify-between items-center">
         <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">Uni-Planner</h1>
         <div className="flex items-center space-x-2">
           {user ? (
             <>
               <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                 {user.name}님 ({user.major})
               </span>
               <button
                 onClick={onLogoutClick}
                 className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
               >
                 로그아웃
               </button>
             </>
           ) : (
             <>
               <button
                 onClick={onLoginClick}
                 className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
               >
                 로그인
               </button>
               <button
                 onClick={onSignUpClick}
                 className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
               >
                 회원가입
               </button>
             </>
           )}
         </div>
      </header>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-3xl mx-auto px-1">
          {navItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                activeView === item.id
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <item.icon 
                className={`transition-transform duration-200 ${
                    activeView === item.id ? 'scale-110' : ''
                } ${item.id === 'timetable' ? 'w-7 h-7' : 'w-6 h-6'}`} 
                strokeWidth={activeView === item.id ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium ${item.id === 'timetable' ? 'font-bold' : ''}`}>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
