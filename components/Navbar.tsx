
import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import UserIcon from './icons/UserIcon';
import StudyIcon from './icons/StudyIcon';
import { auth } from '../services/firebase'; // Import auth
import { signOut, User } from 'firebase/auth'; // Import signOut and User type

interface NavbarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  currentUser: User | null; // Add currentUser prop
}

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView, currentUser }) => {
  const navItems = [
    { id: 'study', label: '스터디', icon: StudyIcon },
    { id: 'major', label: '전공', icon: ChartBarIcon },
    { id: 'timetable', label: '홈', icon: HomeIcon },
    { id: 'chatbot', label: 'AI 채팅', icon: ChatBubbleIcon },
    { id: 'profile', label: '내정보', icon: UserIcon },
  ] as const;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // App.tsx's onAuthStateChanged will handle state update and navigation
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <>
      {/* Top Header for mobile app feel */}
      <header className="bg-gray-50 dark:bg-gray-900 fixed top-0 left-0 right-0 z-40 px-4 py-4 flex justify-between items-center">
         <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">BU-Planner</h1>
         {currentUser && ( // Conditionally render logout button
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              로그아웃
            </button>
          )}
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
