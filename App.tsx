import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppView, Course, Semester } from './types';
import Navbar from './components/Navbar';
import Timetable from './components/Timetable';
import MajorRecommender from './components/MajorRecommender';
import CourseChatbot from './components/CourseChatbot';
import CourseRegistration from './components/CourseRegistration';
import CreditTracker from './components/CreditTracker';
import { auth, db } from './services/firebase'; // auth는 상태 체크용, db는 userProfile용
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Auth from './components/Auth';
import SplashScreen from './components/SplashScreen';
import { courseService } from './services/courseService'; // Service Import
import { COURSE_COLORS } from './constants';

import StudyBoard from './components/StudyBoard';


interface UserProfile {
  initialCredits: number;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('timetable');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('');
  const [allCourses, setAllCourses] = useState<Course[]>([]); // 전체 학점 계산용

  // 1. 인증 및 유저 프로필 로드
  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
          // 로그인 성공 시 초기 데이터 로드
          await loadInitialData(user.uid);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
        setSemesters([]);
        setAllCourses([]);
      }

      setTimeout(() => {
        setAuthInitialized(true);
      }, 1500);
    });

    return () => authUnsubscribe();
  }, []);

  // 2. 데이터 로드 함수 (Service 사용)
  const loadInitialData = async (userId: string) => {
    try {
      // 학기 목록 가져오기
      const fetchedSemesters = await courseService.getUserSemesters(userId);
      setSemesters(fetchedSemesters);

      // 활성 학기 설정 (없으면 가장 최근 학기 or 첫 학기)
      if (fetchedSemesters.length > 0) {
        // 기존 선택된 학기가 유효한지 확인
        const isActiveValid = fetchedSemesters.some(s => s.id === activeSemesterId);
        if (!activeSemesterId || !isActiveValid) {
          // 이름순 정렬되어 있으므로 마지막(최신) 학기 or 첫 학기 선택
          setActiveSemesterId(fetchedSemesters[fetchedSemesters.length - 1].id);
        }
      }

      // 전체 과목 가져오기 (학점 계산용 - 모든 학기 Loop)
      // 실제 서비스에서는 'users/{uid}/stats' 같은 곳에 합계를 저장하거나, 
      // 필요할 때만 가져오는 것이 좋으나, 여기서는 전체를 가져옵니다.
      let totalCourses: Course[] = [];
      for (const sem of fetchedSemesters) {
        const courses = await courseService.getUserCourses(userId, sem.id);
        totalCourses = [...totalCourses, ...courses];
      }
      setAllCourses(totalCourses);

    } catch (error) {
      console.error("Failed to load initial data:", error);
    }
  };

  // 데이터 리프레시 핸들러 (Timetable 등 하위 컴포넌트에서 호출)
  const handleRefresh = useCallback(() => {
    if (currentUser) {
      loadInitialData(currentUser.uid);
    }
  }, [currentUser, activeSemesterId]);

  // 학점 계산
  const totalCredits = useMemo(() => {
    // credits 필드가 없는 경우 대비 (기본 0)
    const courseCredits = allCourses.reduce((sum, course) => sum + (course.credits || 0), 0);
    return (userProfile?.initialCredits || 0) + courseCredits;
  }, [allCourses, userProfile]);

  const activeSemesterName = useMemo(() => {
    return semesters.find(s => s.id === activeSemesterId)?.name || '';
  }, [semesters, activeSemesterId]);

  // 학기 변경 핸들러
  const handleSwitchSemester = useCallback((id: string) => {
    setActiveSemesterId(id);
  }, []);

  // 학기 추가 핸들러 (MajorRecommender 등에서 사용)
  const handleAddSemester = useCallback(async (name: string) => {
    if (!currentUser) return;
    try {
      const newId = await courseService.createSemester(currentUser.uid, name);
      await loadInitialData(currentUser.uid); // 목록 갱신
      setActiveSemesterId(newId); // 새 학기로 이동
    } catch (error) {
      console.error(error);
      alert("학기 생성 중 오류가 발생했습니다.");
    }
  }, [currentUser]);

  // 강의 수동 저장 (Timetable에서 직접 호출하지 않고 모달 내부에서 처리하지만, 호환성을 위해 유지)
  const handleSaveCourse = useCallback(async (courseData: Omit<Course, 'id' | 'color' | 'semesterId' | 'userId'>, id?: string) => {
    if (!currentUser || !activeSemesterId) return;

    // 구현 필요 시 Service에 update 메서드 추가하여 연결
    // 현재 구조에서는 Timetable 내부 모달이 직접 Service를 호출하는 것이 더 깔끔함.
    // 여기서는 리프레시만 트리거합니다.
    handleRefresh();
  }, [currentUser, activeSemesterId, handleRefresh]);

  // 강의 삭제 (Timetable에서 호출)
  const handleDeleteCourse = useCallback(async (id: string) => {
    try {
      await courseService.deleteCourse(id);
      handleRefresh(); // 삭제 후 데이터 갱신
    } catch (error) {
      console.error("Delete failed", error);
    }
  }, [handleRefresh]);

  // 여러 강의 추가 (MajorRecommender용)
  const handleAddCourses = useCallback(async (coursesToAdd: Omit<Course, 'id' | 'color'>[]) => {
    if (!currentUser) return;
    try {
      const promises = coursesToAdd.map((c, index) => {
        // 색상을 랜덤 또는 순서대로 지정해 주어야 함
        // 여기서는 간단하게 index를 이용해 색상을 배정합니다.
        const assignedColor = COURSE_COLORS[index % COURSE_COLORS.length];

        return courseService.addCourseToSemester({
          ...c,
          userId: currentUser.uid,
          color: assignedColor, // [중요] 누락된 color 속성 추가
        });
      });

      await Promise.all(promises);
      handleRefresh();
    } catch (error) {
      console.error("Batch add failed", error);
    }
  }, [currentUser, handleRefresh]);


  // 렌더링 시작
  if (!authInitialized) return <SplashScreen />;
  if (!currentUser) return <Auth />;

  const renderContent = () => {
    switch (activeView) {
      case 'timetable':
        return (
          <div className="space-y-6">
            <CreditTracker currentCredits={totalCredits} totalCredits={120} />
            <Timetable
              activeSemesterName={activeSemesterName}
              activeSemesterId={activeSemesterId}
              semesters={semesters}
              userId={currentUser.uid}
              onRefresh={handleRefresh} // 데이터 변경 시 호출
              onSwitchSemester={handleSwitchSemester}
              // 하위 호환성 및 에러 방지를 위해 빈 함수 혹은 래퍼 전달
              onSaveCourse={handleSaveCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddSemester={handleAddSemester}
              onNavigateToRegistration={() => setActiveView('registration')}
            />
          </div>
        );
      case 'major':
        return (
          <MajorRecommender
            semesters={semesters}
            courses={allCourses}
            onAddCourses={handleAddCourses}
            onAddSemester={handleAddSemester}
            userId={currentUser.uid}
          />
        );
      case 'chatbot':
        return <CourseChatbot />;
      case 'study':
        return <StudyBoard />;

      case 'registration':
        return (
          <CourseRegistration
            userId={currentUser.uid}
            semesterId={activeSemesterId}
            onBack={() => setActiveView('timetable')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Navbar activeView={activeView} setActiveView={setActiveView} currentUser={currentUser} />
      <main className={`mx-auto px-4 pb-24 pt-20 ${activeView === 'registration' ? 'w-full' : 'container max-w-3xl'}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;