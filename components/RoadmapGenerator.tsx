import React, { useState, useMemo } from 'react';
import { Major, ROADMAPS, RoadmapCourse, MajorRoadmap } from '../roadmapData';
import { Course, Semester, Lecture } from '../types';
import { parseSchedule } from '../utils/timetableParser';
import { checkTimeConflict } from '../utils/timeConflict';
import CourseSelectionModal from './CourseSelectionModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

interface RoadmapGeneratorProps {
  semesters: Semester[];
  courses: Course[]; // 현재 사용자의 모든 학기 강의 목록
  onAddCourses: (courses: Omit<Course, 'id' | 'color'>[]) => void;
  onAddSemester?: (name: string) => void;
  userId: string | null;
}
const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({ semesters, courses, onAddCourses, onAddSemester, userId }) => {
  const [selectedMajor, setSelectedMajor] = useState<Major>('소프트웨어학전공');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [courseSelectionModal, setCourseSelectionModal] = useState<{
    isOpen: boolean;
    courseName: string;
    existingCourses: Course[];
    lectures: Lecture[];
    semesterId: string;
  } | null>(null);

  // Firestore에서 강의 정보 조회
  const findLecturesInDB = async (courseName: string): Promise<Lecture[]> => {
    const lecturesRef = collection(db, 'lectures');
    const q = query(lecturesRef, where('course_name', '==', courseName));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture));
  };

  // 선택한 전공의 로드맵 가져오기
  const currentRoadmap = useMemo(() => {
    return ROADMAPS.find(r => r.major === selectedMajor);
  }, [selectedMajor]);

  // 로드맵 과목을 학년/학기별로 그룹화
  const groupedCourses = useMemo(() => {
    if (!currentRoadmap) return {};
    return currentRoadmap.courses.reduce((acc, course) => {
      const key = `${course.year}학년 ${course.semester}학기`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(course);
      return acc;
    }, {} as { [key: string]: RoadmapCourse[] });
  }, [currentRoadmap]);

  // 선택한 과목들을 시간표에 추가
  const handleAddToTimetable = async () => {
    if (selectedCourses.size === 0) {
      alert('추가할 과목을 선택해주세요.');
      return;
    }
    if (!userId) {
      alert('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    const newSemesters: { [name: string]: string } = {};

    // 먼저 필요한 학기들을 생성
    selectedCourses.forEach(courseName => {
      const roadmapCourse = currentRoadmap?.courses.find(c => c.name === courseName);
      if (roadmapCourse) {
        const semesterName = `${roadmapCourse.year}학년 ${roadmapCourse.semester}학기`;
        const semester = semesters.find(s => s.name === semesterName);
        if (!semester && onAddSemester) {
          // App.tsx에서 학기 추가를 호출하고, 임시로 ID를 생성하여 사용
          const year = roadmapCourse.year;
          const semesterNum = roadmapCourse.semester;
          const consistentId = `sem_${year}_${semesterNum}`;
          newSemesters[semesterName] = consistentId;
          onAddSemester(semesterName);
        }
      }
    });

    // 학기 생성이 반영될 시간을 잠시 기다림
    await new Promise(resolve => setTimeout(resolve, 100));

    for (const courseName of selectedCourses) {
      const lectures = await findLecturesInDB(courseName);
      const roadmapCourse = currentRoadmap?.courses.find(c => c.name === courseName);

      if (!roadmapCourse) continue;

      const semesterName = `${roadmapCourse.year}학년 ${roadmapCourse.semester}학기`;
      // onAddSemester 이후 업데이트된 semesters 목록을 다시 find 해야 함.
      // 이 예제에서는 props로 받은 semesters를 기준으로 하므로, App.tsx의 상태 업데이트가 중요.
      // 여기서는 간단하게 newSemesters에 있는 경우를 가정.
      const semester = semesters.find(s => s.name === semesterName) || { id: newSemesters[semesterName], name: semesterName, userId: userId };

      if (!semester?.id) continue;

      if (lectures.length === 0) {
        console.warn(`${courseName}에 해당하는 강의를 Firestore에서 찾을 수 없습니다.`);
        continue;
      }

      if (lectures.length === 1) {
        const lecture = lectures[0];
        const schedule = parseSchedule(lecture.timetable, lecture.hours);
        if (!schedule || !schedule.day) {
          alert(`${lecture.course_name}의 시간표 정보를 파싱할 수 없습니다. (시간표: ${lecture.timetable})`);
          continue;
        }

        // 해당 학기의 강의만 필터링
        const semesterCourses = courses.filter(c => c.semesterId === semester.id && c.userId === userId);
        const conflict = checkTimeConflict({ day: schedule.day, startTime: schedule.startTime, endTime: schedule.endTime }, semesterCourses);

        if (conflict.hasConflict) {
          const conflictNames = conflict.conflictingCourses.map(c => c.name).join(', ');
          if (!confirm(`${lecture.course_name}의 시간이 다음 강의와 겹칩니다:\n${conflictNames}\n그래도 추가하시겠습니까?`)) {
            continue;
          }
        }

        onAddCourses([{
          name: lecture.course_name,
          professor: lecture.professor,
          location: schedule.location || '',
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          credits: lecture.credits || 3,
          semesterId: semester.id,
        }]);
      } else {
        // 처리해야 할 여러 옵션 강의가 있다면 첫 번째 것만 모달로 띄우고 중단
        setCourseSelectionModal({
          isOpen: true,
          courseName,
          existingCourses: courses,
          lectures,
          semesterId: semester.id,
        });
        setLoading(false);
        return;
      }
    }

    // 모달을 띄우지 않고 모든 과목이 추가된 경우
    setSelectedCourses(new Set());
    alert(`선택한 과목들이 시간표에 추가되었습니다.`);
    setLoading(false);
  };

  // 전체 선택/해제
  const handleCourseSelect = (course: Omit<Course, 'id' | 'color'>) => {
    onAddCourses([course]);
    setCourseSelectionModal(null); // 현재 모달 닫기

    // 남은 선택된 과목들 처리 시작
    const remainingCourses = Array.from<string>(selectedCourses).filter(name => name !== course.name);
    setSelectedCourses(new Set(remainingCourses)); // 처리된 과목 제외

    // 비동기적으로 다음 과목 처리
    if (remainingCourses.length > 0) {
      processRemainingCourses(remainingCourses);
    } else {
      alert('모든 과목이 시간표에 추가되었습니다.');
    }
  };

  const processRemainingCourses = async (remaining: string[]) => {
    const courseNameToProcess = remaining[0];
    const lectures = await findLecturesInDB(courseNameToProcess);
    const roadmapCourse = currentRoadmap?.courses.find(c => c.name === courseNameToProcess);

    if (roadmapCourse && userId) {
      const semesterName = `${roadmapCourse.year}학년 ${roadmapCourse.semester}학기`;
      const semester = semesters.find(s => s.name === semesterName);

      if (semester?.id) {
        if (lectures.length > 1) {
          setCourseSelectionModal({
            isOpen: true,
            courseName: courseNameToProcess,
            existingCourses: courses,
            lectures,
            semesterId: semester.id,
          });
        } else if (lectures.length === 1) {
          // 단일 강의 처리 로직 (handleAddToTimetable과 유사)
          // ... onAddCourses 호출 ...
          // 다음 과목 처리
          const nextRemaining = remaining.slice(1);
          setSelectedCourses(new Set(nextRemaining));
          if (nextRemaining.length > 0) processRemainingCourses(nextRemaining);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 전공 선택 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <select
          value={selectedMajor}
          onChange={(e) => {
            setSelectedMajor(e.target.value as Major);
            setSelectedCourses(new Set()); // 전공 변경 시 선택 초기화
          }}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        >
          {ROADMAPS.map(roadmap => (
            <option key={roadmap.major} value={roadmap.major}>{roadmap.major}</option>
          ))}
        </select>
        <button
          onClick={handleAddToTimetable}
          disabled={loading || selectedCourses.size === 0}
          className="w-full sm:w-auto px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? '추가 중...' : `선택한 과목 (${selectedCourses.size}개) 시간표에 추가`}
        </button>
      </div>

      {/* 로드맵 과목 목록 */}
      <div className="space-y-8">
        {Object.entries(groupedCourses).map(([semester, coursesInSemester]: [string, RoadmapCourse[]]) => (
          <div key={semester}>
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{semester}</h3>
              <button
                onClick={() => {
                  const allCourseNames = coursesInSemester.map(c => c.name);
                  const allSelected = allCourseNames.every(name => selectedCourses.has(name));
                  const newSelected = new Set(selectedCourses);
                  if (allSelected) {
                    allCourseNames.forEach(name => newSelected.delete(name));
                  } else {
                    allCourseNames.forEach(name => newSelected.add(name));
                  }
                  setSelectedCourses(newSelected);
                }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                전체 선택/해제
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {coursesInSemester.map((course) => (
                <button
                  key={course.name}
                  onClick={() => {
                    const newSelected = new Set(selectedCourses);
                    if (newSelected.has(course.name)) {
                      newSelected.delete(course.name);
                    } else {
                      newSelected.add(course.name);
                    }
                    setSelectedCourses(newSelected);
                  }}
                  className={`p-3 rounded-lg text-left transition-all duration-200 shadow-sm ${
                    selectedCourses.has(course.name)
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500'
                      : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{course.name}</span>
                    {selectedCourses.has(course.name) && (
                      <div className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 분반 선택 모달 */}
      {courseSelectionModal?.isOpen && (
        <CourseSelectionModal
          isOpen={courseSelectionModal.isOpen}
          onClose={() => {
            setCourseSelectionModal(null);
            setSelectedCourses(new Set());
          }}
          courseName={courseSelectionModal.courseName}
          lectures={courseSelectionModal.lectures}
          existingCourses={courses}
          semesterId={courseSelectionModal.semesterId}
          onSelect={handleCourseSelect}
        />
      )}
    </div>
  );
};

export default RoadmapGenerator;
