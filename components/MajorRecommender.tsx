import React from 'react';
import GraduationCapIcon from './icons/GraduationCapIcon';
import RoadmapGenerator from './RoadmapGenerator';
import { Course, Semester } from '../types';

interface MajorRecommenderProps {
  semesters?: Semester[];
  courses?: Course[];
  onAddCourses?: (courses: Omit<Course, 'id' | 'color'>[]) => void;
  onAddSemester?: (name: string) => void;
}

const MajorRecommender: React.FC<MajorRecommenderProps> = ({
  semesters = [],
  courses = [],
  onAddCourses = () => {},
  onAddSemester,
}) => {
  const handleAddCourses = (coursesToAdd: Omit<Course, 'id' | 'color'>[]) => {
    // 각 과목에 ID와 색상 추가
    const coursesWithIds = coursesToAdd.map((course, index) => ({
      ...course,
      id: Date.now().toString() + index,
      color: course.color || '',
    }));
    
    // App.tsx의 handleSaveCourse를 호출하는 대신, 직접 courses 상태 업데이트
    coursesWithIds.forEach(course => {
      onAddCourses([course]);
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Header Area */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-3">
                    <GraduationCapIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">전공별 로드맵</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">전공별 권장 교과목을 선택하여 시간표에 추가할 수 있습니다.</p>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <RoadmapGenerator
            semesters={semesters}
            courses={courses}
            onAddCourses={handleAddCourses}
            onAddSemester={onAddSemester}
          />
        </div>
      </div>
    </div>
  );
};

export default MajorRecommender;