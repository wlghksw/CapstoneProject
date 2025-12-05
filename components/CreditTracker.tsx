
import React, { useState } from 'react';
import CreditReportModal from './CreditReportModal';

interface CreditTrackerProps {
  currentCredits: number;
  totalCredits: number;
}

const CreditTracker: React.FC<CreditTrackerProps> = ({ currentCredits, totalCredits }) => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  const progressPercentage = totalCredits > 0 ? (currentCredits / totalCredits) * 100 : 0;
  const cappedProgress = Math.min(progressPercentage, 100);
  const remainingCredits = Math.max(0, totalCredits - currentCredits);

  return (
    <>
    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between relative overflow-hidden">
      <div className="z-10">
        <div className="flex items-center space-x-2 mb-2">
             <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-full">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <polyline points="20 6 9 17 4 12"></polyline>
                 </svg>
             </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">잘하고 있어요!</h3>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
           졸업까지 {remainingCredits}학점 남았습니다.<br/>
           이대로 꾸준히 학점을 관리해 보세요.
        </p>
        <button 
            onClick={() => setIsReportOpen(true)}
            className="text-blue-500 dark:text-blue-400 text-sm font-semibold flex items-center hover:underline focus:outline-none"
        >
            학점 리포트 보기 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        </button>
      </div>
      
      {/* Progress Circle Visualization */}
      <div className="relative h-20 w-20 flex-shrink-0 ml-4">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Background Circle */}
          <path
            className="text-gray-100 dark:text-gray-700"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          {/* Progress Circle */}
          <path
            className="text-green-500"
            strokeDasharray={`${cappedProgress}, 100`}
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
             <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{Math.round(cappedProgress)}%</span>
        </div>
      </div>
    </div>

    <CreditReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
    />
    </>
  );
};

export default CreditTracker;
