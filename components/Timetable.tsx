import React, { useState, useMemo, useEffect } from 'react';
import { Course, Semester } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../constants';
import CourseModal from './CourseModal';
import SemesterListModal from './SemesterListModal';
import CourseSelectionModal from './CourseSelectionModal';
import PlusIcon from './icons/PlusIcon';
import PencilIcon from './icons/PencilIcon';
import ListIcon from './icons/ListIcon';
import { courseService } from '../services/courseService';

interface TimetableProps {
  onSaveCourse: (courseData: Omit<Course, 'id' | 'color' | 'semesterId' | 'userId'>, id?: string) => void;
  onDeleteCourse: (id: string) => void;
  activeSemesterName: string;
  activeSemesterId: string;
  semesters: Semester[];
  onAddSemester: (name: string) => void;
  userId: string | null;
  onSwitchSemester: (id: string) => void;
  onRefresh: () => void;
  onNavigateToRegistration: () => void; // 추가
}

const Timetable: React.FC<TimetableProps> = ({
  onSaveCourse,
  onDeleteCourse,
  activeSemesterName,
  activeSemesterId,
  semesters,
  userId,
  onSwitchSemester,
  onRefresh,
  onNavigateToRegistration
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSemesterListOpen, setIsSemesterListOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [initialData, setInitialData] = useState<Partial<Course> | null>(null);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);

  // 강의 데이터 불러오기
  const fetchCourses = async () => {
    if (!activeSemesterId || !userId) return;
    try {
      const courses = await courseService.getUserCourses(userId, activeSemesterId);
      setCurrentCourses(courses);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [activeSemesterId, userId]);

  const handleOpenModal = (course?: Course, initial?: Partial<Course>) => {
    if (course) {
      setCourseToEdit(course);
      setInitialData(null);
    } else {
      setCourseToEdit(null);
      setInitialData(initial || null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCourseToEdit(null);
    setInitialData(null);
  };

  const timeToPosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours - 9) * 60 + minutes;
    return (totalMinutes / (9 * 60)) * 100; // 9시간 기준 (09:00 ~ 18:00)
  };

  const courseToStyle = (course: Course) => {
    const top = timeToPosition(course.startTime);
    const bottom = timeToPosition(course.endTime);
    const height = bottom - top;
    const dayIndex = DAYS_OF_WEEK.indexOf(course.day as any);

    return {
      left: `${dayIndex * 20}%`,
      width: '20%',
      top: `${top}%`,
      height: `${height}%`,
    };
  };

  const courseComponents = useMemo(() => currentCourses.map(course => (
    <div
      key={course.id}
      className={`absolute p-1.5 rounded-md border shadow-sm cursor-pointer transform hover:scale-[1.02] transition-all duration-200 ${course.color} opacity-90 hover:opacity-100 z-20`}
      style={courseToStyle(course)}
      onClick={(e) => {
        e.stopPropagation();
        handleOpenModal(course);
      }}
    >
      <p className="font-bold text-xs truncate leading-tight">{course.name}</p>
      <p className="text-[10px] truncate opacity-75">{course.location}</p>
    </div>
  )), [currentCourses]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 px-2">
        <button
          onClick={() => setIsSemesterListOpen(true)}
          className="flex items-center space-x-2 group focus:outline-none"
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 transition-colors">
            {activeSemesterName ? `${activeSemesterName}` : "학기 선택"}
          </h2>
          <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
            <ListIcon className="w-5 h-5" />
          </div>
        </button>

        <div className="flex space-x-2">
          <button
            onClick={onNavigateToRegistration}
            className="text-emerald-500 text-sm font-medium flex items-center hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-full transition-colors"
          >
            <PencilIcon className="w-4 h-4 mr-1" /> 수강 신청
          </button>
          <button
            onClick={() => setIsSelectionModalOpen(true)}
            className="text-blue-500 text-sm font-medium flex items-center hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-full transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-1" /> 강의 추가
          </button>
        </div>
      </div>

      {/* Main Timetable Container */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 min-h-[600px]">

        {/* 그리드 구조 개선: 시간표 헤더(요일)와 바디(시간+내용) 분리 */}
        <div className="flex flex-col h-full min-h-[540px]">

          {/* 1. 요일 헤더 */}
          <div className="flex mb-2 border-b border-gray-100 dark:border-gray-700 pb-2">
            <div className="w-10 flex-shrink-0"></div> {/* 시간 열 공간 확보 */}
            <div className="flex-1 grid grid-cols-5">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 text-sm">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* 2. 시간표 바디 */}
          <div className="flex-1 flex relative">

            {/* 시간 표시 열 (좌측) */}
            <div className="w-10 flex-shrink-0 relative border-r border-gray-100 dark:border-gray-700 text-right pr-2">
              {TIME_SLOTS.map((time, index) => {
                // 마지막 시간(18:00)은 선만 긋고 텍스트는 표시 안 하거나, 필요하면 표시
                if (index === TIME_SLOTS.length - 1) return null;
                return (
                  <div
                    key={time}
                    className="absolute w-full text-xs text-gray-400 dark:text-gray-500 transform -translate-y-1/2"
                    style={{ top: `${(index / (TIME_SLOTS.length - 1)) * 100}%` }}
                  >
                    {time.split(':')[0]}
                  </div>
                );
              })}
            </div>

            {/* 메인 그리드 영역 */}
            <div className="flex-1 relative">
              {/* 가로선 (시간 구분선) */}
              {TIME_SLOTS.map((_, index) => (
                <div
                  key={index}
                  className="absolute w-full border-t border-dashed border-gray-100 dark:border-gray-700 pointer-events-none"
                  style={{ top: `${(index / (TIME_SLOTS.length - 1)) * 100}%` }}
                ></div>
              ))}

              {/* 세로선 (요일 구분선) */}
              {DAYS_OF_WEEK.slice(0, 4).map((_, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-px border-l border-gray-50 dark:border-gray-700 pointer-events-none"
                  style={{ left: `${(index + 1) * 20}%` }}
                ></div>
              ))}

              {/* 강의 추가용 클릭 영역 */}
              {DAYS_OF_WEEK.map((day, dayIndex) => (
                TIME_SLOTS.slice(0, -1).map((time, timeIndex) => {
                  const [hStr, mStr] = time.split(':');
                  const h = Number(hStr);
                  const m = Number(mStr);

                  const startTimeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                  const endTimeStr = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                  return (
                    <div
                      key={`${day}-${time}`}
                      className="absolute w-1/5 border-gray-50 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors duration-150 z-10"
                      style={{
                        left: `${dayIndex * 20}%`,
                        top: `${(timeIndex / (TIME_SLOTS.length - 1)) * 100}%`,
                        height: `${(1 / (TIME_SLOTS.length - 1)) * 100}%`
                      }}
                      onClick={() => handleOpenModal(undefined, { day: day as any, startTime: startTimeStr, endTime: endTimeStr })}
                      title={`${day} ${time}에 강의 추가`}
                    />
                  );
                })
              ))}

              {/* 실제 강의 블록 */}
              {courseComponents}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 플로팅 버튼 */}
      <button
        onClick={() => setIsSelectionModalOpen(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50 sm:hidden"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {/* --- 모달 영역 --- */}

      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={(data, id) => {
          onSaveCourse(data, id);
          fetchCourses();
        }}
        onDelete={(id) => {
          onDeleteCourse(id);
          fetchCourses();
        }}
        courseToEdit={courseToEdit}
        initialData={initialData}
      />

      {/* [수정 완료] existingCourses prop을 전달하여 에러 해결 */}
      <CourseSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        userId={userId || ""}
        semesterId={activeSemesterId}
        onCourseAdded={fetchCourses}
        existingCourses={currentCourses} // <-- 여기가 핵심! 빠져있던 부분 추가
      />

      <SemesterListModal
        isOpen={isSemesterListOpen}
        onClose={() => setIsSemesterListOpen(false)}
        semesters={semesters}
        activeSemesterId={activeSemesterId}
        onSelectSemester={onSwitchSemester}
        onSemesterCreated={onRefresh}
        userId={userId}
      />
    </div>
  );
};

export default Timetable;