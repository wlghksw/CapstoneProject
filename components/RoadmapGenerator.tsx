import React, { useState, useEffect, useMemo } from 'react';
import { Major, ROADMAPS, RoadmapCourse } from '../roadmapData';
import { Course, Semester } from '../types';
import { parseCSV, findCourseInCSV, findAllCoursesInCSV, parseSchedule, CSVCourse } from '../utils/csvParser';
import { checkTimeConflict } from '../utils/timeConflict';
import CourseSelectionModal from './CourseSelectionModal';

interface RoadmapGeneratorProps {
  semesters: Semester[];
  courses: Course[];
  onAddCourses: (courses: Omit<Course, 'id' | 'color'>[]) => void;
  onAddSemester?: (name: string) => void;
}

const RoadmapGenerator: React.FC<RoadmapGeneratorProps> = ({
  semesters,
  courses,
  onAddCourses,
  onAddSemester,
}) => {
  const [selectedMajor, setSelectedMajor] = useState<Major>('소프트웨어학전공');
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [csvCourses, setCsvCourses] = useState<CSVCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [courseSelectionModal, setCourseSelectionModal] = useState<{
    isOpen: boolean;
    courseName: string;
    csvCourses: CSVCourse[];
    semesterId: string;
  } | null>(null);

  // CSV 파일 로드
  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('/강좌내역 목록_통합.csv');
        const text = await response.text();
        const parsed = parseCSV(text);
        setCsvCourses(parsed);
      } catch (error) {
        console.error('CSV 파일 로드 실패:', error);
      }
    };
    loadCSV();
  }, []);

  // 선택한 전공의 로드맵 가져오기
  const currentRoadmap = useMemo(() => {
    return ROADMAPS.find(r => r.major === selectedMajor);
  }, [selectedMajor]);

  // 학년/학기별로 그룹화
  const groupedCourses = useMemo(() => {
    if (!currentRoadmap) return {};
    
    const grouped: Record<string, RoadmapCourse[]> = {};
    currentRoadmap.courses.forEach(course => {
      const key = `${course.year}-${course.semester}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(course);
    });
    
    return grouped;
  }, [currentRoadmap]);

  // 이미 시간표에 추가된 과목인지 확인
  const isCourseAdded = (courseName: string): boolean => {
    return courses.some(c => c.name === courseName);
  };

  // 과목 선택/해제
  const toggleCourse = (courseName: string) => {
    setSelectedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseName)) {
        next.delete(courseName);
      } else {
        next.add(courseName);
      }
      return next;
    });
  };

  // 선택한 과목들을 시간표에 추가
  const handleAddToTimetable = () => {
    if (selectedCourses.size === 0) {
      alert('추가할 과목을 선택해주세요.');
      return;
    }

    setLoading(true);
    const coursesToAdd: Omit<Course, 'id' | 'color'>[] = [];
    const semesterMap = new Map<string, string>(); // 학기 이름 -> 학기 ID 매핑

    // 먼저 필요한 학기들을 생성
    const neededSemesters = new Set<string>();
    selectedCourses.forEach(courseName => {
      const roadmapCourse = currentRoadmap?.courses.find(c => c.name === courseName);
      if (roadmapCourse) {
        const semesterName = `${roadmapCourse.year}학년 ${roadmapCourse.semester}학기`;
        const semester = semesters.find(s => s.name === semesterName);
        if (!semester && onAddSemester) {
          neededSemesters.add(semesterName);
          onAddSemester(semesterName);
        } else if (semester) {
          semesterMap.set(semesterName, semester.id);
        }
      }
    });

    // 학기 이름을 기반으로 일관된 ID 생성 (App.tsx와 동일한 방식)
    neededSemesters.forEach(semesterName => {
      const match = semesterName.match(/(\d)학년 (\d)학기/);
      if (match) {
        const year = match[1];
        const semester = match[2];
        const consistentId = `sem_${year}_${semester}`;
        semesterMap.set(semesterName, consistentId);
      }
    });

    // 과목 추가 (같은 과목이 여러 개 있으면 선택 모달 표시)
    const coursesToProcess: Array<{ courseName: string; semesterId: string }> = [];
    
    selectedCourses.forEach(courseName => {
      const roadmapCourse = currentRoadmap?.courses.find(c => c.name === courseName);
      if (roadmapCourse) {
        const semesterName = `${roadmapCourse.year}학년 ${roadmapCourse.semester}학기`;
        const semesterId = semesterMap.get(semesterName);
        if (semesterId) {
          coursesToProcess.push({ courseName, semesterId });
        }
      }
    });

    // 각 과목 처리
    const processCourse = (courseName: string, semesterId: string) => {
      const allCsvCourses = findAllCoursesInCSV(courseName, csvCourses);
      
      if (allCsvCourses.length === 0) {
        return null;
      } else if (allCsvCourses.length === 1) {
        // 하나만 있으면 바로 추가
        const csvCourse = allCsvCourses[0];
        const schedule = parseSchedule(csvCourse.시간표);
        if (!schedule || !schedule.day) return null;

        // 시간 중복 체크
        const semesterCourses = courses.filter(c => c.semesterId === semesterId);
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
          if (!confirm(`${courseName}의 시간이 다음 강의와 겹칩니다:\n${conflictNames}\n그래도 추가하시겠습니까?`)) {
            return null;
          }
        }

        return {
          name: csvCourse.교과목명,
          professor: csvCourse.교수명,
          location: schedule.location || '',
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          credits: parseInt(csvCourse.학점) || 3,
          semesterId,
        };
      } else {
        // 여러 개 있으면 선택 모달 표시
        setCourseSelectionModal({
          isOpen: true,
          courseName,
          csvCourses: allCsvCourses,
          semesterId,
        });
        return null; // 모달에서 처리
      }
    };

    // 먼저 하나만 있는 과목들 처리
    coursesToProcess.forEach(({ courseName, semesterId }) => {
      const allCsvCourses = findAllCoursesInCSV(courseName, csvCourses);
      if (allCsvCourses.length === 1) {
        const course = processCourse(courseName, semesterId);
        if (course) {
          coursesToAdd.push(course);
        }
      }
    });

    // 여러 개 있는 과목이 있으면 모달 표시하고 종료
    const multiCourseOptions = coursesToProcess.filter(({ courseName }) => {
      const allCsvCourses = findAllCoursesInCSV(courseName, csvCourses);
      return allCsvCourses.length > 1;
    });

    if (multiCourseOptions.length > 0) {
      // 첫 번째 여러 개 있는 과목의 모달 표시
      const firstMulti = multiCourseOptions[0];
      setCourseSelectionModal({
        isOpen: true,
        courseName: firstMulti.courseName,
        csvCourses: findAllCoursesInCSV(firstMulti.courseName, csvCourses),
        semesterId: firstMulti.semesterId,
      });
      setLoading(false);
      return;
    }

    // 모든 과목이 하나씩만 있고 처리 완료
    if (coursesToAdd.length > 0) {
      onAddCourses(coursesToAdd);
      setSelectedCourses(new Set());
      alert(`${coursesToAdd.length}개의 과목이 시간표에 추가되었습니다.`);
    } else {
      alert('추가할 수 있는 과목을 찾지 못했습니다. CSV 파일에 해당 과목이 있는지 확인해주세요.');
    }

    setLoading(false);

    if (coursesToAdd.length > 0) {
      onAddCourses(coursesToAdd);
      setSelectedCourses(new Set());
      alert(`${coursesToAdd.length}개의 과목이 시간표에 추가되었습니다.`);
    } else {
      alert('추가할 수 있는 과목을 찾지 못했습니다. CSV 파일에 해당 과목이 있는지 확인해주세요.');
    }

    setLoading(false);
  };

  // 전체 선택/해제
  const toggleAllCourses = (year: number, semester: number) => {
    const key = `${year}-${semester}`;
    const yearCourses = groupedCourses[key] || [];
    const allSelected = yearCourses.every(c => selectedCourses.has(c.name));
    
    setSelectedCourses(prev => {
      const next = new Set(prev);
      yearCourses.forEach(course => {
        if (allSelected) {
          next.delete(course.name);
        } else {
          next.add(course.name);
        }
      });
      return next;
    });
  };

  const handleCourseSelect = (course: Omit<Course, 'id' | 'color'>) => {
    // 선택한 과목 추가
    onAddCourses([course]);
    
    // 다음 여러 개 있는 과목 처리
    const remainingSelected = Array.from(selectedCourses).filter(name => {
      const allCsvCourses = findAllCoursesInCSV(name, csvCourses);
      return allCsvCourses.length > 1 && name !== courseSelectionModal?.courseName;
    });

    if (remainingSelected.length > 0) {
      // 다음 과목의 모달 표시
      const nextCourseName = remainingSelected[0];
      const roadmapCourse = currentRoadmap?.courses.find(c => c.name === nextCourseName);
      if (roadmapCourse) {
        const semesterName = `${roadmapCourse.year}학년 ${roadmapCourse.semester}학기`;
        const match = semesterName.match(/(\d)학년 (\d)학기/);
        let semesterId = '';
        if (match) {
          semesterId = `sem_${match[1]}_${match[2]}`;
        } else {
          const semester = semesters.find(s => s.name === semesterName);
          semesterId = semester?.id || '';
        }
        
        setCourseSelectionModal({
          isOpen: true,
          courseName: nextCourseName,
          csvCourses: findAllCoursesInCSV(nextCourseName, csvCourses),
          semesterId,
        });
      } else {
        setCourseSelectionModal(null);
        setSelectedCourses(new Set());
        alert('과목이 시간표에 추가되었습니다.');
      }
    } else {
      // 모든 과목 처리 완료
      setCourseSelectionModal(null);
      setSelectedCourses(new Set());
      alert('과목이 시간표에 추가되었습니다.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          전공별 로드맵 생성
        </h2>

        {/* 전공 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            전공 선택
          </label>
          <select
            value={selectedMajor}
            onChange={(e) => {
              setSelectedMajor(e.target.value as Major);
              setSelectedCourses(new Set());
            }}
            className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
          >
            {ROADMAPS.map(roadmap => (
              <option key={roadmap.major} value={roadmap.major}>
                {roadmap.major}
              </option>
            ))}
          </select>
        </div>

        {/* 로드맵 표시 */}
        {currentRoadmap && (
          <div className="space-y-6">
            {[1, 2, 3, 4].map(year => (
              <div key={year} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  {year}학년
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map(semester => {
                    const key = `${year}-${semester}`;
                    const yearCourses = groupedCourses[key] || [];
                    
                    if (yearCourses.length === 0) return null;

                    return (
                      <div key={semester} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-700 dark:text-gray-300">
                            {semester}학기
                          </h4>
                          <button
                            onClick={() => toggleAllCourses(year, semester)}
                            className="text-xs text-blue-500 hover:text-blue-600"
                          >
                            {yearCourses.every(c => selectedCourses.has(c.name)) ? '전체 해제' : '전체 선택'}
                          </button>
                        </div>
                        <div className="space-y-2">
                          {yearCourses.map(course => {
                            const isAdded = isCourseAdded(course.name);
                            const isSelected = selectedCourses.has(course.name);
                            
                            return (
                              <label
                                key={course.name}
                                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                                  isAdded
                                    ? 'bg-gray-100 dark:bg-gray-700 opacity-60'
                                    : isSelected
                                    ? 'bg-blue-50 dark:bg-blue-900/30'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleCourse(course.name)}
                                  disabled={isAdded}
                                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className={`text-sm ${isAdded ? 'line-through' : ''}`}>
                                  {course.name}
                                  {isAdded && <span className="ml-2 text-xs text-gray-500">(추가됨)</span>}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 추가 버튼 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAddToTimetable}
            disabled={selectedCourses.size === 0 || loading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? '추가 중...' : `선택한 ${selectedCourses.size}개 과목 시간표에 추가`}
          </button>
        </div>
      </div>

      {/* Course Selection Modal */}
      {courseSelectionModal && (
        <CourseSelectionModal
          isOpen={courseSelectionModal.isOpen}
          onClose={() => {
            setCourseSelectionModal(null);
            setSelectedCourses(new Set());
          }}
          courseName={courseSelectionModal.courseName}
          csvCourses={courseSelectionModal.csvCourses}
          existingCourses={courses}
          semesterId={courseSelectionModal.semesterId}
          onSelect={handleCourseSelect}
        />
      )}
    </div>
  );
};

export default RoadmapGenerator;

