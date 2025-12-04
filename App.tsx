
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

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses(prevCourses => prevCourses.filter(c => c.id !== id));
  }, []);

  const handleAddSemester = useCallback((name: string) => {
    const newId = `sem_${Date.now()}`;
    setSemesters(prev => [{ id: newId, name }, ...prev]); // Add to top
    setActiveSemesterId(newId); // Switch to new semester
  }, []);

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
        return <MajorRecommender />;
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
