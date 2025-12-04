
import React, { useState } from 'react';
import { Semester } from '../types';
import PlusIcon from './icons/PlusIcon';

interface SemesterListModalProps {
  isOpen: boolean;
  onClose: () => void;
  semesters: Semester[];
  activeSemesterId: string;
  onSelectSemester: (id: string) => void;
  onAddSemester: (name: string) => void;
  onDeleteSemester?: (id: string) => void;
}

const SemesterListModal: React.FC<SemesterListModalProps> = ({
  isOpen,
  onClose,
  semesters,
  activeSemesterId,
  onSelectSemester,
  onAddSemester,
  onDeleteSemester
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState('');

  if (!isOpen) return null;

  const handleAddClick = () => {
    setIsAdding(true);
    setNewSemesterName('');
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSemesterName.trim()) {
      onAddSemester(newSemesterName.trim());
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">시간표 목록</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
            {/* Add New Form */}
            {isAdding ? (
                <form onSubmit={handleSubmitNew} className="p-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <input
                        type="text"
                        value={newSemesterName}
                        onChange={(e) => setNewSemesterName(e.target.value)}
                        placeholder="예: 2학년 1학기"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button" 
                            onClick={() => setIsAdding(false)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200"
                        >
                            취소
                        </button>
                        <button 
                            type="submit" 
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                        >
                            확인
                        </button>
                    </div>
                </form>
            ) : (
                <button 
                    onClick={handleAddClick}
                    className="w-full p-4 flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 font-medium"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    새 시간표 만들기
                </button>
            )}

            {/* Semester List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {semesters.map((semester) => (
                    <div 
                        key={semester.id}
                        onClick={() => {
                            onSelectSemester(semester.id);
                            onClose();
                        }}
                        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                            activeSemesterId === semester.id 
                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                        <div>
                            <p className={`font-bold ${
                                activeSemesterId === semester.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'
                            }`}>
                                {semester.name}
                            </p>
                        </div>
                        {activeSemesterId === semester.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterListModal;
