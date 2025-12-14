
import React, { useState, useEffect, useMemo } from 'react';
import { Course, DayOfWeek } from '../types';
import { DAYS_OF_WEEK } from '../constants';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Omit<Course, 'id' | 'color' | 'semesterId'>, id?: string) => void;
  onDelete?: (id: string) => void;
  courseToEdit?: Course | null;
  initialData?: Partial<Course> | null;
}

const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, onSave, onDelete, courseToEdit, initialData }) => {
  const [name, setName] = useState('');
  const [professor, setProfessor] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.MON);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [credits, setCredits] = useState(3);
  const [error, setError] = useState('');

  // Generate time options (08:00 to 23:30, 30 min intervals)
  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = 8; hour <= 23; hour++) {
      const h = hour.toString().padStart(2, '0');
      options.push(`${h}:00`);
      options.push(`${h}:30`);
    }
    return options;
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (courseToEdit) {
      setName(courseToEdit.name);
      setProfessor(courseToEdit.professor);
      setLocation(courseToEdit.location);
      setDay(courseToEdit.day);
      setStartTime(courseToEdit.startTime);
      setEndTime(courseToEdit.endTime);
      setCredits(courseToEdit.credits);
    } else if (initialData) {
      setName('');
      setProfessor('');
      setLocation('');
      setDay(initialData.day || DayOfWeek.MON);
      setStartTime(initialData.startTime || '09:00');
      setEndTime(initialData.endTime || '10:00');
      setCredits(3);
    } else {
      // Reset form default
      setName('');
      setProfessor('');
      setLocation('');
      setDay(DayOfWeek.MON);
      setStartTime('09:00');
      setEndTime('10:00');
      setCredits(3);
    }
    setError('');
  }, [courseToEdit, initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('과목명을 입력해주세요.');
      return;
    }
    if (startTime >= endTime) {
        setError('종료 시간은 시작 시간보다 늦어야 합니다.');
        return;
    }
     if (credits <= 0) {
        setError('학점은 0보다 커야 합니다.');
        return;
    }
    
    onSave({ name, professor, location, day, startTime, endTime, credits: Number(credits) }, courseToEdit?.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {courseToEdit ? '강의 수정' : '강의 추가'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-[2fr,1fr] gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">과목명</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border" required placeholder="예: 프로그래밍기초" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">학점</label>
              <input type="number" value={credits} onChange={(e) => setCredits(Number(e.target.value))} min="0" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">교수명</label>
              <input type="text" value={professor} onChange={(e) => setProfessor(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">강의실</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">요일</label>
            <select value={day} onChange={(e) => setDay(e.target.value as DayOfWeek)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border">
              {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">시작 시간</label>
              <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border">
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">종료 시간</label>
              <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border">
                  {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          <div className="flex justify-end items-center pt-4 space-x-2">
            {courseToEdit && onDelete && (
                <button type="button" onClick={() => { if(courseToEdit) onDelete(courseToEdit.id); onClose(); }} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors shadow-sm">삭제</button>
            )}
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800 transition-colors shadow-sm">취소</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors shadow-sm">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
