
import React, { useState, useMemo } from 'react';
import { Course, Semester } from '../types';
import { DAYS_OF_WEEK, TIME_SLOTS } from '../constants';
import CourseModal from './CourseModal';
import SemesterListModal from './SemesterListModal';
import PlusIcon from './icons/PlusIcon';
import ListIcon from './icons/ListIcon';

interface TimetableProps {
  courses: Course[];
  onSaveCourse: (courseData: Omit<Course, 'id' | 'color' | 'semesterId'>, id?: string) => void;
  onDeleteCourse: (id: string) => void;
  activeSemesterName: string;
  activeSemesterId: string;
  semesters: Semester[];
  onAddSemester: (name: string) => void;
  onSwitchSemester: (id: string) => void;
}

const Timetable: React.FC<TimetableProps> = ({ 
  courses, 
  onSaveCourse, 
  onDeleteCourse, 
  activeSemesterName,
  activeSemesterId,
  semesters,
  onAddSemester,
  onSwitchSemester
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSemesterListOpen, setIsSemesterListOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [initialData, setInitialData] = useState<Partial<Course> | null>(null);

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
    const totalMinutes = (hours - 9) * 60 + minutes; // Starting from 9:00
    return (totalMinutes / (12 * 60)) * 100; // Percentage of the total height (9am to 9pm)
  };
  
  const courseToStyle = (course: Course) => {
    const top = timeToPosition(course.startTime);
    const bottom = timeToPosition(course.endTime);
    const height = bottom - top;

    const dayIndex = DAYS_OF_WEEK.indexOf(course.day);
    
    return {
        left: `${dayIndex * 20}%`,
        width: '20%',
        top: `${top}%`,
        height: `${height}%`,
    };
  };

  const courseComponents = useMemo(() => courses.map(course => (
    <div
      key={course.id}
      className={`absolute p-1.5 rounded-md border shadow-sm cursor-pointer transform hover:scale-102 transition-all duration-200 ${course.color} opacity-90 hover:opacity-100 z-20`}
      style={courseToStyle(course)}
      onClick={(e) => {
        e.stopPropagation();
        handleOpenModal(course);
      }}
    >
      <p className="font-bold text-xs truncate">{course.name}</p>
      <p className="text-[10px] truncate opacity-75">{course.location}</p>
    </div>
  )), [courses]);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4 px-2">
        <button 
            onClick={() => setIsSemesterListOpen(true)}
            className="flex items-center space-x-2 group focus:outline-none"
        >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                {activeSemesterName}
            </h2>
            <div className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                <ListIcon className="w-5 h-5" />
            </div>
        </button>
        
        {/* Header right actions */}
        <div className="flex space-x-2">
             {/* Add Course Button (Desktop/Header view) */}
            <button 
                onClick={() => handleOpenModal()}
                className="text-blue-500 text-sm font-medium flex items-center hover:text-blue-600 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full"
            >
                <PlusIcon className="w-4 h-4 mr-1" /> 강의 추가
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-[auto,repeat(5,1fr)] grid-rows-1 relative text-[10px] sm:text-xs min-h-[60vh]">
            {/* Time column */}
            <div className="row-start-1 col-start-1 text-right pr-2 flex flex-col justify-between py-2">
                {TIME_SLOTS.map((time, index) => (
                    <div key={time} className="h-full text-gray-400 dark:text-gray-500 -mt-2">
                        {index % 2 === 0 ? time.split(':')[0] : ''}
                    </div>
                ))}
            </div>
            
            {/* Header row */}
            {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className="row-start-1 text-center font-medium py-2 text-gray-500 dark:text-gray-400" style={{ gridColumnStart: index + 2 }}>
                {day}
            </div>
            ))}

            {/* Grid lines and course area */}
            <div className="col-start-2 col-span-5 row-start-1 relative mt-8 border-t border-gray-100 dark:border-gray-700">
                {/* Horizontal lines - Added pointer-events-none */}
                {TIME_SLOTS.map((_, index) => (
                    <div key={index} className="absolute w-full border-t border-dashed border-gray-100 dark:border-gray-700 pointer-events-none" style={{ top: `${(index / 12) * 100}%` }}></div>
                ))}
                {/* Vertical lines - Added pointer-events-none and w-px */}
                {DAYS_OF_WEEK.slice(0, 4).map((_, index) => (
                    <div key={index} className="absolute top-0 bottom-0 w-px border-l border-gray-50 dark:border-gray-700 pointer-events-none" style={{ left: `${(index + 1) * 20}%`}}></div>
                ))}

                {/* Interactive Grid Cells for Adding Courses - Increased Z-index */}
                {DAYS_OF_WEEK.map((day, dayIndex) => (
                    TIME_SLOTS.map((time, timeIndex) => {
                        const [hStr, mStr] = time.split(':');
                        const h = Number(hStr);
                        const m = Number(mStr);
                        
                        // Format start time (HH:MM)
                        const startH = h < 10 ? `0${h}` : `${h}`;
                        const startM = m < 10 ? `0${m}` : `${m}`;
                        const startTimeStr = `${startH}:${startM}`;

                        // Calculate default end time (1 hour duration)
                        const endH = h + 1;
                        const endHStr = endH < 10 ? `0${endH}` : `${endH}`;
                        const endTimeStr = `${endHStr}:${startM}`;

                        return (
                            <div
                                key={`${day}-${time}`}
                                className="absolute w-1/5 border-gray-50 dark:border-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors duration-150 z-10"
                                style={{
                                    left: `${dayIndex * 20}%`,
                                    top: `${(timeIndex / 12) * 100}%`,
                                    height: `${(1 / 12) * 100}%`
                                }}
                                onClick={() => handleOpenModal(undefined, { day, startTime: startTimeStr, endTime: endTimeStr })}
                                title={`${day} ${time}에 강의 추가`}
                            />
                        );
                    })
                ))}

                {courseComponents}
                
            </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-20 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={onSaveCourse}
        onDelete={onDeleteCourse}
        courseToEdit={courseToEdit}
        initialData={initialData}
      />

      <SemesterListModal 
        isOpen={isSemesterListOpen}
        onClose={() => setIsSemesterListOpen(false)}
        semesters={semesters}
        activeSemesterId={activeSemesterId}
        onSelectSemester={onSwitchSemester}
        onAddSemester={onAddSemester}
      />
    </div>
  );
};

export default Timetable;
