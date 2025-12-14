import React, { useState } from 'react';
import { Semester, PREDEFINED_SEMESTERS } from '../types';
import { courseService } from '../services/courseService';

interface SemesterListModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[]; // 이미 생성된 학기 목록
  activeSemesterId: string;
  onSelectSemester: (id: string) => void;
  onSemesterCreated: () => void; // 생성 후 리프레시용
  userId: string | null;
}

const SemesterListModal: React.FC<SemesterListModalProps> = ({
  isOpen,
  onClose,
  semesters,
  activeSemesterId,
  onSelectSemester,
  onSemesterCreated,
  userId,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 이미 생성된 학기인지 확인하는 헬퍼 함수
  const getExistingSemesterId = (name: string) => {
    return semesters.find(s => s.name === name)?.id;
  };

  const handleSemesterClick = async (name: string) => {
    if (!userId) return;

    const existingId = getExistingSemesterId(name);

    if (existingId) {
      // 이미 존재하면 해당 학기로 이동
      onSelectSemester(existingId);
      onClose();
    } else {
      // 존재하지 않으면 새로 생성
      try {
        setLoading(true);
        const newId = await courseService.createSemester(userId, name);
        onSemesterCreated(); // 부모 컴포넌트 데이터 갱신
        onSelectSemester(newId);
        onClose();
      } catch (error) {
        alert("학기 생성 중 오류가 발생했습니다.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">학기 선택</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            이동할 학기를 선택하세요. 아직 생성되지 않은 학기는 자동으로 생성됩니다.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {PREDEFINED_SEMESTERS.map((semName) => {
              const existingId = getExistingSemesterId(semName);
              const isActive = existingId === activeSemesterId;
              const isCreated = !!existingId;

              return (
                <button
                  key={semName}
                  onClick={() => handleSemesterClick(semName)}
                  disabled={loading}
                  className={`
                    p-3 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${isActive 
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md ring-2 ring-blue-200' 
                      : isCreated
                        ? 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 border-dashed border-gray-300 dark:border-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>{semName}</span>
                    {isActive && <span>✓</span>}
                    {!isCreated && !isActive && <span className="text-[10px] opacity-70">(새로 만들기)</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterListModal;