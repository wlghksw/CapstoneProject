import React, { useState, useEffect } from 'react';
import { parseSchedule } from '../utils/timetableParser';
import { Course, LectureData, DayOfWeek } from '../types';
import { checkTimeConflict } from '../utils/timeConflict';
import { courseService } from '../services/courseService';
import { COURSE_COLORS } from '../constants';

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCourses: Course[];
  semesterId: string;
  courseName?: string;
  lectures?: LectureData[];
  onSelect?: (course: Omit<Course, 'id' | 'color'>) => void;
  userId?: string;
  onCourseAdded?: () => void;
}

const CourseSelectionModal: React.FC<CourseSelectionModalProps> = ({
  isOpen,
  onClose,
  existingCourses,
  semesterId,
  courseName,
  lectures,
  onSelect,
  userId,
  onCourseAdded,
}) => {
  const [activeTab, setActiveTab] = useState<'major' | 'general'>('major');
  const [dbLectures, setDbLectures] = useState<LectureData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // 검색 모드일 때 데이터 로드
  useEffect(() => {
    if (isOpen && !lectures) {
      const fetchFromDB = async () => {
        setLoading(true);
        try {
          let data: LectureData[] = [];
          if (searchTerm) {
             data = await courseService.searchLectures(searchTerm);
          } else {
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

  const semesterCourses = existingCourses.filter(c => c.semesterId === semesterId);

  // 강의 추가 핸들러
  const handleAttemptAdd = async (lecture: LectureData) => {
    const schedule = parseSchedule(lecture.time_text, lecture.hours);
    
    if (!schedule) {
      alert(`시간표 정보를 파싱할 수 없습니다. (${lecture.time_text})`);
      return;
    }

    // 1. 시간 충돌 체크 (대면 수업인 경우에만)
    let conflict = { hasConflict: false, conflictingCourses: [] as any[] };
    
    // 요일(day)이 있는 경우에만 충돌 체크 수행
    if (schedule.day) {
        conflict = checkTimeConflict(
            { 
              day: schedule.day as DayOfWeek, 
              startTime: schedule.startTime, 
              endTime: schedule.endTime 
            },
            semesterCourses
        );
    }

    if (conflict.hasConflict) {
      const conflictNames = conflict.conflictingCourses.map(c => c.name).join(', ');
      alert(`⛔ 시간표가 겹쳐서 강의를 추가할 수 없습니다.\n(겹치는 강의: ${conflictNames})`);
      return; 
    }

    // 2. 데이터 구성 (사이버 시간 포함)
    const courseData = {
      name: lecture.name,
      professor: lecture.professor,
      location: schedule.location || '장소 미정',
      day: (schedule.day as string) || '', // 요일 없으면 빈 문자열 (100% 사이버)
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      credits: lecture.credit || 3,
      semesterId,
      // [추가됨] 사이버 시간 정보 저장
      cyberHours: lecture.cyber_hours || 0,
    };

    if (lectures && onSelect) {
      onSelect(courseData);
      onClose();
    } else if (userId && onCourseAdded) {
      try {
        const randomColor = COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];
        await courseService.addCourseToSemester({
            ...courseData,
            userId,
            color: randomColor,
            lectureId: lecture.id,
            type: lecture.type
        });
        
        // 추가 완료 메시지 (사이버 강의 정보 포함)
        let msg = `${lecture.name} 강의가 추가되었습니다.`;
        if (!schedule.day) {
          msg += `\n(100% 사이버 강의로 하단 목록에 표시됩니다)`;
        } else if (lecture.cyber_hours && lecture.cyber_hours > 0) {
           msg += `\n(대면 수업 + 사이버 ${lecture.cyber_hours}시간)`;
        }
        alert(msg);
        
        onCourseAdded();
      } catch (e) {
        console.error(e);
        alert("강의 추가 실패");
      }
    }
  };

  // 렌더링용 리스트 (선택 모드 or 검색 모드)
  const listToRender = (lectures && lectures.length > 0) ? lectures : dbLectures;
  const isSearchMode = !lectures;

  // 공통 리스트 아이템 렌더러
  const renderListItem = (lecture: LectureData) => {
    const schedule = parseSchedule(lecture.time_text, lecture.hours);
    
    // 충돌 여부 및 표시 텍스트 계산
    let conflict = { hasConflict: false };
    let displayTime = lecture.time_text;
    const isCyberOnly = !schedule?.day; // 요일이 없으면 100% 사이버
    const hasCyberHour = lecture.cyber_hours && lecture.cyber_hours > 0; // 사이버 시간 존재 여부

    if (schedule) {
        if (schedule.day) {
            conflict = checkTimeConflict(
                { 
                  day: schedule.day as DayOfWeek, 
                  startTime: schedule.startTime, 
                  endTime: schedule.endTime 
                },
                semesterCourses
            );
            displayTime = `${schedule.day} ${schedule.startTime}~${schedule.endTime}`;
        } else {
            // 요일 없음 -> 사이버 강의 또는 시간 미지정
            displayTime = schedule.location || "시간 미지정";
        }
    }

    const isAlreadyAdded = existingCourses.some(c => c.lectureId === lecture.id);

    return (
        <div key={lecture.id} className="p-4 border rounded-xl hover:border-blue-300 transition-colors flex justify-between items-center bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2">
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">{lecture.type}</span>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{lecture.name}</h3>
                    
                    {/* [추가됨] 사이버 강의 배지 표시 */}
                    {isCyberOnly ? (
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded border border-purple-100 dark:border-purple-800">
                            💻 100% 사이버
                        </span>
                    ) : hasCyberHour ? (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800">
                            + 💻 {lecture.cyber_hours}시간
                        </span>
                    ) : null}
                </div>
                
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                    {lecture.professor} | {lecture.credit}학점 | {lecture.room}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 font-medium">
                    {displayTime}
                </p>
            </div>
            
            <div className="ml-3 flex flex-col items-end gap-1">
                <button 
                    onClick={() => handleAttemptAdd(lecture)}
                    disabled={isAlreadyAdded || conflict.hasConflict}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-transform active:scale-95 whitespace-nowrap ${
                        isAlreadyAdded || conflict.hasConflict
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                {isAlreadyAdded ? '추가됨' : '추가'}
                </button>
                {conflict.hasConflict && (
                    <span className="text-[10px] text-red-500 font-medium">⛔ 겹침</span>
                )}
            </div>
        </div>
    );
  };

  // --- 메인 렌더링 ---
  return (
    <div className={`fixed inset-0 bg-black/60 z-50 flex justify-center ${isSearchMode ? 'items-end sm:items-center' : 'items-center'} animate-fade-in`}>
      <div className={`bg-white dark:bg-gray-900 w-full ${isSearchMode ? 'sm:w-[600px] h-[80vh] sm:rounded-2xl' : 'max-w-md rounded-lg max-h-[80vh]'} flex flex-col shadow-2xl overflow-hidden`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {courseName ? `${courseName} - 시간 선택` : '강의 추가'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">✕</button>
        </div>

        {/* 검색 모드일 때만 탭과 검색창 표시 */}
        {isSearchMode && (
          <div className="p-4 space-y-4 bg-white dark:bg-gray-900">
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
        )}

        {/* 선택 모드일 때 안내 문구 */}
        {!isSearchMode && (
           <div className="px-4 pt-4">
             <p className="text-sm text-gray-600 dark:text-gray-400">
                원하는 시간을 선택해주세요. <span className="text-red-500 font-bold">시간이 겹치는 강의는 선택할 수 없습니다.</span>
             </p>
           </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black/20">
          {loading ? (
            <div className="text-center py-10 text-gray-400">로딩 중...</div>
          ) : listToRender.length === 0 ? (
            <div className="text-center py-10 text-gray-400">검색 결과가 없습니다.</div>
          ) : (
            listToRender.map(lecture => renderListItem(lecture))
          )}
        </div>

        {/* 선택 모드일 때 하단 닫기 버튼 */}
        {!isSearchMode && (
             <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white">취소</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default CourseSelectionModal;