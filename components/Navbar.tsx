import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import { auth } from '../services/firebase';
import { signOut, User } from 'firebase/auth';

interface NavbarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentUser: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, currentUser }) => {
  const navItems = [
    { id: 'study', label: '스터디', icon: null },

    { id: 'major', label: '전공', icon: ChartBarIcon },
    { id: 'timetable', label: '홈', icon: HomeIcon },
    { id: 'chatbot', label: 'AI 채팅', icon: ChatBubbleIcon },
  ] as const;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <header className="bg-gray-50 dark:bg-gray-900 fixed top-0 left-0 right-0 z-40 px-4 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">BU-Planner</h1>
        {currentUser && (
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            로그아웃
          </button>
        )}
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-3xl mx-auto px-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as AppView)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                activeView === item.id
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {/* 아이콘 여부에 따라 조건부 렌더링 */}
              {item.icon ? (
                <item.icon
                  className={`transition-transform duration-200 ${
                    activeView === item.id ? 'scale-110' : ''
                  } ${item.id === 'timetable' ? 'w-7 h-7' : 'w-6 h-6'}`}
                  strokeWidth={activeView === item.id ? 2.5 : 2}
                />
              ) : (
                <span className="text-[11px] font-semibold">{item.label}</span>
              )}

              {/* 라벨 */}
              {item.icon && <span className="text-[10px]">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
