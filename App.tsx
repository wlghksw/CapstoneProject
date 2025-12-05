
import React, { useState, useMemo, useCallback } from 'react';
import { AppView, Course, Semester } from './types';
import Navbar from './components/Navbar';
import Timetable from './components/Timetable';
import MajorRecommender from './components/MajorRecommender';
import CourseChatbot from './components/CourseChatbot';
import CreditTracker from './components/CreditTracker';
import { COURSE_COLORS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('timetable');
  
  // Initialize with one default semester
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: 'sem_1', name: '1학년 1학기' }
  ]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('sem_1');
  const [courses, setCourses] = useState<Course[]>([]);

  // Calculate total credits across ALL semesters for graduation progress
  const totalCredits = useMemo(() => {
    return courses.reduce((sum, course) => sum + course.credits, 0);
  }, [courses]);

  // Filter courses for the active semester
  const activeSemesterCourses = useMemo(() => {
    return courses.filter(c => c.semesterId === activeSemesterId);
  }, [courses, activeSemesterId]);

  const activeSemesterName = useMemo(() => {
    return semesters.find(s => s.id === activeSemesterId)?.name || '시간표';
  }, [semesters, activeSemesterId]);

  const handleSaveCourse = useCallback((courseData: Omit<Course, 'id' | 'color' | 'semesterId'>, id?: string) => {
    setCourses(prevCourses => {
      if (id) {
        // Edit existing course
        return prevCourses.map(c => c.id === id ? { ...c, ...courseData } : c);
      } else {
        // Add new course
        const newCourse: Course = {
          ...courseData,
          id: Date.now().toString(),
          semesterId: activeSemesterId, // Attach current semester ID
          color: COURSE_COLORS[prevCourses.length % COURSE_COLORS.length],
        };
        return [...prevCourses, newCourse];
      }
    });
  }, [activeSemesterId]);

  const handleAddCourses = useCallback((coursesToAdd: Omit<Course, 'id' | 'color'>[]) => {
    setCourses(prevCourses => {
      const newCourses = coursesToAdd.map((courseData, index) => {
        // semesterId가 없으면 activeSemesterId 사용
        const semesterId = 'semesterId' in courseData && courseData.semesterId 
          ? courseData.semesterId 
          : activeSemesterId;
        
        return {
          ...courseData,
          id: `${Date.now()}-${index}`,
          semesterId,
          color: courseData.color || COURSE_COLORS[(prevCourses.length + index) % COURSE_COLORS.length],
        } as Course;
      });
      return [...prevCourses, ...newCourses];
    });
  }, [activeSemesterId]);

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses(prevCourses => prevCourses.filter(c => c.id !== id));
  }, []);

  const handleAddSemester = useCallback((name: string) => {
    // 학기 이름에서 학년과 학기 추출하여 일관된 ID 생성
    const match = name.match(/(\d)학년 (\d)학기/);
    let newId: string;
    if (match) {
      const year = match[1];
      const semester = match[2];
      newId = `sem_${year}_${semester}`;
      // 이미 존재하는지 확인
      const existing = semesters.find(s => s.id === newId);
      if (existing) {
        // 이미 존재하면 기존 ID 사용
        newId = existing.id;
      }
    } else {
      newId = `sem_${Date.now()}`;
    }
    setSemesters(prev => {
      // 중복 체크
      const exists = prev.find(s => s.id === newId || s.name === name);
      if (exists) {
        return prev; // 이미 존재하면 추가하지 않음
      }
      return [{ id: newId, name }, ...prev]; // Add to top
    });
    setActiveSemesterId(newId); // Switch to new semester
  }, [semesters]);

  const handleSwitchSemester = useCallback((id: string) => {
    setActiveSemesterId(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'timetable':
        return (
            <div className="space-y-6">
                <CreditTracker currentCredits={totalCredits} totalCredits={120} />
                <Timetable 
                  courses={activeSemesterCourses} 
                  onSaveCourse={handleSaveCourse}
                  onDeleteCourse={handleDeleteCourse}
                  activeSemesterName={activeSemesterName}
                  activeSemesterId={activeSemesterId}
                  semesters={semesters}
                  onAddSemester={handleAddSemester}
                  onSwitchSemester={handleSwitchSemester}
                />
            </div>
        );
      case 'major':
        return (
          <MajorRecommender 
            semesters={semesters}
            courses={courses}
            onAddCourses={handleAddCourses}
            onAddSemester={handleAddSemester}
          />
        );
      case 'chatbot':
        return <CourseChatbot />;
      default:
        return (
            <div className="space-y-6">
                 <CreditTracker currentCredits={totalCredits} totalCredits={120} />
                 <Timetable 
                    courses={activeSemesterCourses}
                    onSaveCourse={handleSaveCourse}
                    onDeleteCourse={handleDeleteCourse}
                    activeSemesterName={activeSemesterName}
                    activeSemesterId={activeSemesterId}
                    semesters={semesters}
                    onAddSemester={handleAddSemester}
                    onSwitchSemester={handleSwitchSemester}
                  />
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      <main className="container max-w-3xl mx-auto px-4 pb-24 pt-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
