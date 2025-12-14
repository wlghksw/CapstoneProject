import React, { useState, useEffect } from 'react';
import { parseSchedule } from '../utils/timetableParser';
import { Course, LectureData } from '../types';
import { checkTimeConflict } from '../utils/timeConflict';
import { courseService } from '../services/courseService';
import { COURSE_COLORS } from '../constants';

// 두 가지 모드를 모두 지원하는 Props 정의
interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCourses: Course[]; // 공통 필수: 시간 충돌 체크용
  semesterId: string;        // 공통 필수

  // [모드 1: 선택 모드] (RoadmapGenerator에서 사용)
  courseName?: string;
  lectures?: LectureData[];
  onSelect?: (course: Omit<Course, 'id' | 'color'>) => void;

  // [모드 2: 검색 모드] (Timetable에서 사용)
  userId?: string;
  onCourseAdded?: () => void; // DB 추가 후 새로고침 콜백
}

const CourseSelectionModal: React.FC<CourseSelectionModalProps> = ({
  isOpen,
  onClose,
  existingCourses,
  semesterId,
  // 선택 모드 Props
  courseName,
  lectures,
  onSelect,
  // 검색 모드 Props
  userId,
  onCourseAdded,
}) => {
  // --- State (검색 모드용) ---
  const [activeTab, setActiveTab] = useState<'major' | 'general'>('major');
  const [dbLectures, setDbLectures] = useState<LectureData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Effect: 검색 모드일 때 데이터 로드 ---
  useEffect(() => {
    // lectures가 없으면 검색 모드로 동작
    if (isOpen && !lectures) {
      const fetchFromDB = async () => {
        setLoading(true);
        try {
          let data: LectureData[] = [];
          if (searchTerm) {
             data = await courseService.searchLectures(searchTerm);
          } else {
             // 전공 탭일 때 예시로 '컴퓨터공학부' 로드 (실제 앱에서는 유저 정보 기반 필터링 권장)
             if (activeTab === 'major') {
               data = await courseService.getMajorLectures('컴퓨터공학부'); 
             } else {
               data = await courseService.getGeneralLectures();
             }
          }
          setDbLectures(data);
        } catch (error) {
          console.error("Lectures Load Error:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFromDB();
    }
  }, [isOpen, activeTab, searchTerm, lectures]);

  if (!isOpen) return null;

  // 같은 학기 강의만 필터링 (충돌 체크용)
  const semesterCourses = existingCourses.filter(c => c.semesterId === semesterId);

  // --- 공통 핸들러: 강의 선택/추가 시도 ---
  const handleAttemptAdd = async (lecture: LectureData) => {
    // 1. 시간표 파싱
    const schedule = parseSchedule(lecture.time_text, lecture.hours);
    
    if (!schedule || !schedule.day) {
      alert(`시간표 정보를 파싱할 수 없습니다. (${lecture.time_text})`);
      return;
    }

    // 2. 시간 충돌 체크
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
      alert(`⛔ 시간표가 겹쳐서 강의를 추가할 수 없습니다.\n(겹치는 강의: ${conflictNames})`);
      return; 
    }

    // 3. 모드에 따른 처리
    const courseData = {
      name: lecture.name,
      professor: lecture.professor,
      location: schedule.location || '',
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      credits: lecture.credit || 3,
      semesterId,
    };

    if (lectures && onSelect) {
      // [모드 1] 선택 모드: 부모 컴포넌트(Roadmap)에게 데이터 전달
      onSelect(courseData);
      onClose();
    } else if (userId && onCourseAdded) {
      // [모드 2] 검색 모드: 직접 DB에 추가
      try {
        const randomColor = COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];
        await courseService.addCourseToSemester({
            ...courseData,
            userId,
            color: randomColor,
            lectureId: lecture.id,
            type: lecture.type
        });
        alert(`${lecture.name} 강의가 추가되었습니다.`);
        onCourseAdded(); // 목록 갱신
      } catch (e) {
        console.error(e);
        alert("강의 추가 실패");
      }
    }
  };

  // ----------------------------------------------------------------
  // 렌더링 1: [선택 모드] (RoadmapGenerator에서 호출됨 - lectures 배열이 있음)
  // ----------------------------------------------------------------
  if (lectures && lectures.length > 0) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
              {courseName} - 시간 선택
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              원하는 시간을 선택해주세요. <span className="text-red-500 font-bold">시간이 겹치는 강의는 선택할 수 없습니다.</span>
            </p>
    
            <div className="space-y-3">
              {lectures.map((lecture, index) => {
                const schedule = parseSchedule(lecture.time_text, lecture.hours);
                if (!schedule) return null;
    
                const conflict = checkTimeConflict(
                  { day: schedule.day, startTime: schedule.startTime, endTime: schedule.endTime },
                  semesterCourses
                );
    
                return (
                  <button
                    key={index}
                    onClick={() => handleAttemptAdd(lecture)}
                    disabled={conflict.hasConflict} // 클릭 방지
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all relative ${
                      conflict.hasConflict
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10 cursor-not-allowed opacity-60'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{lecture.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">교수: {lecture.professor}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{schedule.day} {schedule.startTime} - {schedule.endTime}</div>
                      </div>
                      {conflict.hasConflict && (
                         <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-1 rounded">⛔ 겹침</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">취소</button>
            </div>
          </div>
        </div>
      );
  }

  // ----------------------------------------------------------------
  // 렌더링 2: [검색 모드] (Timetable에서 호출됨 - lectures가 undefined)
  // ----------------------------------------------------------------
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-end sm:items-center animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full sm:w-[600px] h-[80vh] sm:rounded-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">강의 추가</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">✕</button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 space-y-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'major' ? 'bg-white shadow text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('major')}
            >
              전공
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'general' ? 'bg-white shadow text-blue-600 dark:bg-gray-700 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('general')}
            >
              교양
            </button>
          </div>
          <input 
            type="text" 
            placeholder="과목명 또는 교수님 검색" 
            className="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="text-center py-10 text-gray-400">로딩 중...</div>
          ) : dbLectures.length === 0 ? (
            <div className="text-center py-10 text-gray-400">검색 결과가 없습니다.</div>
          ) : (
            dbLectures.map((lecture) => {
               // 리스트 렌더링 시에도 시간표 파싱해서 보여주기
               const schedule = parseSchedule(lecture.time_text, lecture.hours);
               
               // 이미 추가된 강의인지 확인 (선택 사항)
               const isAlreadyAdded = existingCourses.some(c => c.lectureId === lecture.id);

               return (
                <div key={lecture.id} className="p-4 border rounded-xl hover:border-blue-300 transition-colors flex justify-between items-center bg-white dark:bg-gray-800 dark:border-gray-700">
                    <div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{lecture.type}</span>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">{lecture.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                        {lecture.professor} | {lecture.room} | {lecture.credit}학점
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {schedule ? `${schedule.day} ${schedule.startTime}~${schedule.endTime}` : lecture.time_text}
                    </p>
                    </div>
                    <button 
                        onClick={() => handleAttemptAdd(lecture)}
                        disabled={isAlreadyAdded}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-transform active:scale-95 ${
                            isAlreadyAdded 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                    {isAlreadyAdded ? '추가됨' : '추가'}
                    </button>
                </div>
               );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseSelectionModal;