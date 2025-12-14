
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppView, Course, Semester } from './types';
import Navbar from './components/Navbar';
import Timetable from './components/Timetable';
import MajorRecommender from './components/MajorRecommender';
import CourseChatbot from './components/CourseChatbot';
import CreditTracker from './components/CreditTracker';
import { COURSE_COLORS } from './constants';
import { db, auth } from './services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, getDocs, where, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import Auth from './components/Auth';
import SplashScreen from './components/SplashScreen';

interface UserProfile {
  initialCredits: number;
}

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('timetable');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false); // Auth 상태 초기화 여부 추적
  
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string>('');
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      // 일정 시간 후 인증 상태를 true로 설정하여 스플래시 화면을 제어
      setTimeout(() => {
        setAuthInitialized(true);
      }, 1500); // 1.5초 후에 화면 전환
    });

    return () => {
      authUnsubscribe();
    };
  }, []);

  // Fetch all courses for credit calculation
  useEffect(() => {
    if (!currentUser) {
      setAllCourses([]);
      return;
    }
    const q = query(collection(db, "courses"), where("userId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesFromFirestore = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setAllCourses(coursesFromFirestore);
    });
    return unsubscribe;
  }, [currentUser, setAllCourses]);

  // Fetch semesters
  useEffect(() => {
    if (!currentUser) {
      setSemesters([]);
      return;
    }
    const q = query(collection(db, "semesters"), where("userId", "==", currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedSemesters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Semester));
      setSemesters(fetchedSemesters);
      // 활성 학기가 없거나, 현재 활성 학기가 더 이상 존재하지 않는 경우 첫 번째 학기를 활성 학기로 설정
      if (fetchedSemesters.length > 0 && !fetchedSemesters.some(s => s.id === activeSemesterId)) {
        setActiveSemesterId(fetchedSemesters[0].id);
      }
    });
    return unsubscribe;
  }, [currentUser, activeSemesterId, setSemesters]);

  // Calculate total credits across ALL semesters for graduation progress
  const totalCredits = useMemo(() => {
    const courseCredits = allCourses.reduce((sum, course) => sum + course.credits, 0);
    return (userProfile?.initialCredits || 0) + courseCredits;
  }, [allCourses, userProfile]);

  const activeSemesterName = useMemo(() => {
    return semesters.find(s => s.id === activeSemesterId)?.name || '시간표';
  }, [semesters, activeSemesterId]);

  const handleSaveCourse = useCallback(async (courseData: Omit<Course, 'id' | 'color' | 'semesterId'>, id?: string) => {
    if (id) {
      // Edit existing course
      const courseRef = doc(db, "courses", id);
      await updateDoc(courseRef, { ...courseData });
    } else {
      // Add new course
      if (!currentUser) return;
      const coursesQuery = query(collection(db, "courses"), where("semesterId", "==", activeSemesterId));
      const courseCount = (await getDocs(coursesQuery)).size;
      const newCourseData = {
        ...courseData,
        semesterId: activeSemesterId,
        color: COURSE_COLORS[courseCount % COURSE_COLORS.length],
        userId: currentUser.uid,
      };
      await addDoc(collection(db, "courses"), newCourseData);
    }
  }, [activeSemesterId, currentUser]);

  const handleAddCourses = useCallback(async (coursesToAdd: Omit<Course, 'id' | 'color'>[]) => {
    if (!currentUser) return;

    // 현재 활성 학기의 과목 수를 가져와서 색상을 순차적으로 할당
    const coursesQuery = query(collection(db, "courses"), where("semesterId", "==", activeSemesterId));
    const courseCountSnapshot = await getDocs(coursesQuery);
    let currentCourseCount = courseCountSnapshot.size;

    for (const courseData of coursesToAdd) {
      const newCourseData = {
        ...courseData,
        color: COURSE_COLORS[currentCourseCount % COURSE_COLORS.length],
        userId: currentUser.uid,
      };
      await addDoc(collection(db, "courses"), newCourseData);
      currentCourseCount++;
    }
  }, [currentUser, activeSemesterId]);

  const handleDeleteCourse = useCallback((id: string) => {
    const courseRef = doc(db, "courses", id);
    deleteDoc(courseRef);
  }, []);

  const handleAddSemester = useCallback(async (name: string) => {
    if (!currentUser) return;
    const newSemester = { name, createdAt: serverTimestamp(), userId: currentUser.uid };
    addDoc(collection(db, "semesters"), newSemester).then(docRef => {
      setActiveSemesterId(docRef.id);
    });
  }, [currentUser]);

  const handleSwitchSemester = useCallback((id: string) => {
    setActiveSemesterId(id);
  }, []);

  // 인증 상태가 확인될 때까지 스플래시 화면 표시
  if (!authInitialized) {
    return <SplashScreen />;
  }

  // 인증 확인 후 사용자가 없으면 로그인 화면 표시
  if (!currentUser) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'timetable':
        return (
            <div className="space-y-6">
                <CreditTracker currentCredits={totalCredits} totalCredits={120} />
                <Timetable 
                  onSaveCourse={handleSaveCourse}
                  onDeleteCourse={handleDeleteCourse}
                  activeSemesterName={activeSemesterName}
                  activeSemesterId={activeSemesterId}
                  semesters={semesters}
                  onAddSemester={handleAddSemester}
                  userId={currentUser?.uid || null}
                  onSwitchSemester={handleSwitchSemester}
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
            userId={currentUser?.uid || null}
          />
        );
      case 'chatbot':
        return <CourseChatbot />;
      default:
        return (
            <div className="space-y-6">
                 <CreditTracker currentCredits={totalCredits} totalCredits={120} />
                 <Timetable 
                    onSaveCourse={handleSaveCourse}
                    onDeleteCourse={handleDeleteCourse}
                    activeSemesterName={activeSemesterName}
                    activeSemesterId={activeSemesterId}
                    semesters={semesters}
                    onAddSemester={handleAddSemester}
                    userId={currentUser?.uid || null}
                    onSwitchSemester={handleSwitchSemester}
                  />
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Navbar activeView={activeView} setActiveView={setActiveView} currentUser={currentUser} />
      <main className="container max-w-3xl mx-auto px-4 pb-24 pt-20">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
