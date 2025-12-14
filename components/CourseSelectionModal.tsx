import React from 'react';
import { parseSchedule } from '../utils/timetableParser';
import { Course, Lecture } from '../types';
import { checkTimeConflict } from '../utils/timeConflict';

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseName: string;
  lectures: Lecture[];
  existingCourses: Course[];
  semesterId: string;
  onSelect: (course: Omit<Course, 'id' | 'color'>) => void;
}

const CourseSelectionModal: React.FC<CourseSelectionModalProps> = ({
  isOpen,
  onClose,
  courseName,
  lectures,
  existingCourses,
  semesterId,
  onSelect,
}) => {
  if (!isOpen) return null;

  // 같은 학기의 기존 강의만 체크
  const semesterCourses = existingCourses.filter(c => c.semesterId === semesterId);

  const handleSelectCourse = (lecture: Lecture) => {
    const schedule = parseSchedule(lecture.timetable, lecture.hours);
    if (!schedule || !schedule.day) {
      alert('시간표 정보를 파싱할 수 없습니다.');
      return;
    }

    // 시간 중복 체크
    const conflict = checkTimeConflict(
      {
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
      semesterCourses
    );

    if (conflict.hasConflict) {
      const conflictNames = conflict.conflictingCourses.map(c => c.name).join(', ');
      if (!confirm(`시간이 겹치는 강의가 있습니다:\n${conflictNames}\n그래도 추가하시겠습니까?`)) {
        return;
      }
    }

    onSelect({
      name: courseName,
      professor: lecture.professor,
      location: schedule.location || '',
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      credits: lecture.credits || 3,
      semesterId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          {courseName} - 시간 선택
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          같은 과목의 다른 시간대가 있습니다. 원하는 시간을 선택해주세요.
        </p>

        <div className="space-y-3">
          {lectures.map((lecture, index) => {
            const schedule = parseSchedule(lecture.timetable, lecture.hours);
            if (!schedule) return null;

            const conflict = checkTimeConflict(
              {
                day: schedule.day,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
              },
              semesterCourses
            );

            return (
              <button
                key={index}
                onClick={() => handleSelectCourse(lecture)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  conflict.hasConflict
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:border-yellow-500'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {lecture.course_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      교수: {lecture.professor}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {schedule.day} {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {schedule.location} | {lecture.credits}학점
                    </div>
                  </div>
                  {conflict.hasConflict && (
                    <div className="ml-2 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                      ⚠️ 시간 겹침
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800 transition-colors shadow-sm"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionModal;
