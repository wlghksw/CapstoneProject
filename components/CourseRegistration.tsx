import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { courseService } from '../services/courseService';
// import { ROADMAPS } from '../roadmapData'; // No longer needed
import { COURSE_COLORS, DAYS_OF_WEEK } from '../constants';

interface CourseRegistrationProps {
    userId: string;
    semesterId: string;
    onBack: () => void;
}

const CourseRegistration: React.FC<CourseRegistrationProps> = ({
    userId,
    semesterId,
    onBack
}) => {
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Load user's courses
    const fetchMyCourses = async () => {
        console.log("Fetching courses for:", userId, semesterId);
        if (!userId || !semesterId) {
            console.error("Missing userId or semesterId");
            return;
        }
        try {
            const fetchedCourses = await courseService.getUserCourses(userId, semesterId);
            console.log("Fetched raw courses:", fetchedCourses);
            console.log("Statuses:", fetchedCourses.map(c => `${c.name}: ${c.registrationStatus}`));
            setMyCourses(fetchedCourses);
        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const results = await courseService.searchLectures(searchTerm);
            setSearchResult(results);
        } catch (error) {
            console.error("Search failed:", error);
            alert("검색 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCourses();
        // searchResult is initially empty or we can load suggestions
        // setSearchResult([]); 
    }, [userId, semesterId]);

    const handleAddCourse = async (lecture: any, targetStatus: 'basket' | 'registered') => {
        if (!userId || !semesterId) return;
        setLoading(true);
        try {
            // Check if course already exists in myCourses (either basket or registered)
            const existingCourse = myCourses.find(c => c.lectureId === lecture.id || c.name === lecture.name);

            if (existingCourse) {
                console.log("Found existing:", existingCourse); // Debug
                // If already registered, do nothing (or alert)
                if (existingCourse.registrationStatus === 'registered') {
                    alert("이미 수강신청된 강좌입니다. (목록을 확인하세요)");
                    setLoading(false);
                    return;
                }

                // If in basket and we are trying to register, UPDATE it
                if (targetStatus === 'registered') {
                    console.log("Updating from Basket to Registered:", existingCourse.id);
                    await courseService.updateCourse(existingCourse.id, { registrationStatus: 'registered' });
                    await fetchMyCourses();
                    alert(`[장바구니->신청] ${lecture.name} 수강신청 완료! 내역에서 확인하세요.`);
                    setLoading(false);
                    return;
                }

                // If in basket and trying to add to basket again, do nothing
                if (targetStatus === 'basket') {
                    alert("이미 장바구니에 담긴 강좌입니다.");
                    setLoading(false);
                    return;
                }
            }

            // LectureData conversion logic (New Course)
            let day = "월";
            let startTime = "09:00";
            let endTime = "10:00";

            // 1. Try to use structured schedule
            if (lecture.schedule && lecture.schedule.length > 0) {
                const sched = lecture.schedule[0];
                day = sched.day;
                if (sched.periods && sched.periods.length > 0) {
                    const startPeriod = Math.min(...sched.periods);
                    const endPeriod = Math.max(...sched.periods);
                    const startH = (startPeriod - 1) + 9;
                    const endH = (endPeriod - 1) + 9 + 1;
                    startTime = `${startH.toString().padStart(2, '0')}:00`;
                    endTime = `${endH.toString().padStart(2, '0')}:00`;
                }
            }
            // 2. Fallback: Parse time_text (e.g., "본부518 : 화6,7,8/ 사 /")
            else if (lecture.time_text) {
                // Modified Regex to handle optional spaces: "월 4,5"
                const dayMatch = lecture.time_text.match(/([월화수목금토일])\s*([0-9,]+)/);
                if (dayMatch) {
                    day = dayMatch[1];
                    const periods = dayMatch[2].split(',').map(Number);
                    if (periods.length > 0) {
                        const startPeriod = Math.min(...periods);
                        const endPeriod = Math.max(...periods);
                        const startH = (startPeriod - 1) + 9;
                        const endH = (endPeriod - 1) + 9 + 1;
                        startTime = `${startH.toString().padStart(2, '0')}:00`;
                        endTime = `${endH.toString().padStart(2, '0')}:00`;
                    }
                }
            }

            console.log("Adding New Course:", lecture.name, day, startTime, endTime); // Debug Log

            const color = COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];

            await courseService.addCourseToSemester({
                name: lecture.name || "이름 없음",
                professor: lecture.professor || "",
                location: lecture.room || "",
                day: day,
                startTime: startTime,
                endTime: endTime,
                color: color,
                semesterId: semesterId,
                userId: userId,
                credits: lecture.credit || 3,
                lectureId: lecture.id,
                type: lecture.type || "일반",
                isTemp: true, // 수강신청 페이지 전용 (임시)
                registrationStatus: targetStatus // 상태 지정
            });
            await fetchMyCourses();

            if (targetStatus === 'basket') {
                alert("강의가 장바구니에 담겼습니다.");
            } else {
                alert(`[신규신청] ${lecture.name} 수강신청 완료! 내역에서 확인하세요.`);
            }
        } catch (error) {
            console.error(error);
            alert("강의 추가 실패: " + error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterCourse = async (id: string) => {
        setLoading(true);
        try {
            await courseService.updateCourse(id, { registrationStatus: 'registered' });
            await fetchMyCourses();
            alert("수강신청이 완료되었습니다! (시간표에 반영됨)");
        } catch (error) {
            console.error(error);
            alert("수강신청 실패: " + error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (id: string) => {
        handleDeleteClick(id);
    };

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string, status: 'basket' | 'registered' } | null>(null);

    const handleDeleteClick = (id: string) => {
        const course = myCourses.find(c => c.id === id);
        if (!course) {
            alert("오류: 삭제할 강좌 정보를 찾을 수 없습니다. (새로고침 후 다시 시도해주세요)");
            return;
        }
        setDeleteTarget({
            id: course.id,
            name: course.name,
            status: course.registrationStatus || 'basket'
        });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setLoading(true);
        try {
            await courseService.deleteCourse(deleteTarget.id);
            await fetchMyCourses();
            // alert("삭제되었습니다."); // Modal stays open or closes, better to not alert if modal gives visual feedback
            setIsDeleteModalOpen(false);
            setDeleteTarget(null);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("삭제 실패: " + error);
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
    };

    const timeToPosition = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const totalMinutes = (hours - 9) * 60 + minutes;
        return (totalMinutes / (9 * 60)) * 100; // 9시간 기준 (09:00 ~ 18:00)
    };

    const courseToStyle = (course: Course) => {
        const top = timeToPosition(course.startTime);
        const bottom = timeToPosition(course.endTime);
        const height = bottom - top;
        // const dayIndex = DAYS_OF_WEEK.indexOf(course.day as any); // Type assertion if needed
        const dayIndex = ["월", "화", "수", "목", "금"].indexOf(course.day); // Explicit/Fallout fallback

        return {
            left: `${dayIndex * 20}%`,
            width: '20%',
            top: `${top}%`,
            height: `${height}%`,
        };
    };

    return (
        <div className="flex flex-col h-screen text-sm font-sans bg-white">
            {/* Header Bar */}
            <div className="bg-[#2c3e50] text-white p-2 flex justify-between items-center shadow-md flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg">수강신청</span>
                    <span className="text-xs text-gray-300">| 2025학년도 1학기</span>
                </div>
                <button onClick={onBack} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs">
                    종료(TimeTable)
                </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* 1. Left Sidebar (Search Filters) */}
                <div className="w-64 bg-gray-100 border-r border-gray-300 p-3 flex flex-col space-y-3 overflow-y-auto flex-shrink-0">
                    <div className="bg-white p-2 border border-gray-300 shadow-sm">
                        <h3 className="font-bold text-blue-800 mb-2 border-b border-gray-200 pb-1">🔍 조회 조건</h3>
                        <div className="space-y-2 text-xs">
                            <div>
                                <label className="block text-gray-600 mb-1">캠퍼스/학기</label>
                                <select className="w-full border p-1"><option>백석대학교 / 1학기</option></select>
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1">소속</label>
                                <select className="w-full border p-1"><option>사범학부</option></select>
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1">학년/학반</label>
                                <div className="flex space-x-1">
                                    <select className="w-1/2 border p-1"><option>1학년</option></select>
                                    <input type="text" className="w-1/2 border p-1" placeholder="반" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-600 mb-1">교과목명</label>
                                <input
                                    type="text"
                                    className="w-full border p-1"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="검색어 입력"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="w-full bg-[#1f3a93] text-white py-1.5 mt-2 rounded-sm hover:bg-[#152970]"
                            >
                                조회
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-2 border border-gray-300 shadow-sm flex-1">
                        <h3 className="font-bold text-blue-800 mb-2 border-b border-gray-200 pb-1">ℹ️ 공지사항</h3>
                        <p className="text-xs text-gray-500">
                            수강신청 기간입니다.<br />
                            필수 과목을 확인하세요.
                        </p>
                    </div>
                </div>

                {/* 2. Center Column (Course List & Timetable) -> Now Main Content Area */}
                <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">

                    {/* Top Half: Search Results */}
                    <div className="h-1/2 flex flex-col p-3 pb-1.5 border-b border-gray-300">
                        <div className="flex-1 flex flex-col bg-white border border-gray-300 shadow-sm overflow-hidden">
                            <div className="bg-[#e8ecef] p-1.5 border-b border-gray-300 flex justify-between items-center">
                                <h3 className="font-bold text-[#1f3a93] text-xs">▶ 개설강좌 리스트 (건수: {searchResult.length})</h3>
                                <div className="space-x-1">
                                    <span className="text-xs text-gray-500">※ 과목코드를 클릭하면 강의계획서를 볼 수 있습니다.</span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full border-collapse text-xs table-fixed">
                                    <thead className="bg-[#f5f5f5] sticky top-0 z-10 border-b border-gray-300 font-bold text-gray-700">
                                        <tr>
                                            <th className="border-r border-gray-300 px-1 py-1 w-10">NO</th>
                                            <th className="border-r border-gray-300 px-1 py-1 w-16">신청</th>
                                            <th className="border-r border-gray-300 px-1 py-1 w-20">이수구분</th>
                                            <th className="border-r border-gray-300 px-1 py-1 w-16">과목코드</th>
                                            <th className="border-r border-gray-300 px-1 py-1 w-10">학년</th>
                                            <th className="border-r border-gray-300 px-1 py-1 w-10">학점</th>
                                            <th className="border-r border-gray-300 px-1 py-1 w-48">교과목명</th>
                                            <th className="border-r border-gray-300 px-1 py-1 w-16">담당교수</th>
                                            <th className="border-r border-gray-300 px-1 py-1">강의시간/실</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {searchResult.map((course, idx) => {
                                            const isRegistered = myCourses.some(c => (c.lectureId === course.id || c.name === course.name) && c.registrationStatus === 'registered');

                                            return (
                                                <tr key={idx} className="hover:bg-blue-50 text-center even:bg-white odd:bg-[#fcfcfc] h-10">
                                                    <td className="border-r border-gray-300 px-1 py-1 text-gray-600">{idx + 1}</td>
                                                    <td className="border-r border-gray-300 px-1 py-1">
                                                        {isRegistered ? (
                                                            <button
                                                                disabled
                                                                className="bg-gray-400 text-white w-full h-8 flex items-center justify-center rounded-sm font-medium text-xs cursor-not-allowed"
                                                            >
                                                                신청됨
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAddCourse(course, 'registered')}
                                                                className="bg-[#1f3a93] text-white w-full h-8 flex items-center justify-center rounded-sm hover:bg-[#152970] font-medium text-xs shadow-sm transition-colors"
                                                            >
                                                                신청
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="border-r border-gray-300 px-1 py-1 text-gray-600 font-medium text-[11px] leading-tight break-keep">{course.type || "기초교과군"}</td>
                                                    <td className="border-r border-gray-300 px-1 py-1 text-blue-600 cursor-pointer hover:underline font-medium">{course.id}</td>
                                                    <td className="border-r border-gray-300 px-1 py-1 text-gray-600">{course.year || '-'}</td>
                                                    <td className="border-r border-gray-300 px-1 py-1 text-gray-600 font-medium">{course.credit || 3}</td>
                                                    <td className="border-r border-gray-300 px-2 py-1 text-left font-medium text-gray-800 truncate" title={course.name}>{course.name}</td>
                                                    <td className="border-r border-gray-300 px-1 py-1 truncate text-gray-600">{course.professor}</td>
                                                    <td className="border-r border-gray-300 px-2 py-1 text-left text-gray-600 text-[11px] truncate" title={course.time_text}>{course.time_text || (course.schedule && course.schedule.length > 0 ? `${course.schedule[0].day} ${course.schedule[0].periods.join(',')}` : '')} {course.room ? `/ ${course.room}` : ''}</td>
                                                </tr>
                                            );
                                        })}
                                        {searchResult.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="py-12 text-gray-400 text-center">
                                                    검색 결과가 없습니다.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Half: Split into Timetable (Left) and History List (Right) */}
                    <div className="h-1/2 flex p-3 pt-1.5 space-x-3">
                        {/* Bottom Left: Visual Timetable */}
                        <div className="flex-1 flex flex-col bg-white border border-gray-300 shadow-sm relative overflow-hidden">
                            <div className="bg-[#e8ecef] p-1.5 border-b border-gray-300 flex flex-col justify-center space-y-1">
                                <h3 className="font-bold text-[#1f3a93] text-xs">▶ 내 시간표 (Visual)</h3>
                            </div>

                            {/* Visual Timetable Grid */}
                            <div className="flex-1 relative border-l border-b border-r border-gray-200">
                                {/* Days Header */}
                                <div className="flex border-b border-gray-200 h-6">
                                    {["월", "화", "수", "목", "금"].map(day => (
                                        <div key={day} className="flex-1 text-center text-xs text-gray-600 font-medium leading-6 bg-gray-50 border-r border-gray-100 last:border-r-0">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Time Grid */}
                                <div className="absolute top-6 left-0 right-0 bottom-0">
                                    {/* Horizontal Lines for Hours */}
                                    {Array.from({ length: 9 }).map((_, i) => (
                                        <div key={i} className="absolute w-full border-b border-dashed border-gray-100" style={{ top: `${(i + 1) * (100 / 9)}%` }}></div>
                                    ))}

                                    {/* Vertical Lines */}
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="absolute h-full border-r border-dashed border-gray-100" style={{ left: `${(i + 1) * 20}%` }}></div>
                                    ))}

                                    {/* Courses - Show ONLY registered courses in Visual Timetable */}
                                    {myCourses.filter(c => c.registrationStatus === 'registered').map(course => {
                                        const style = courseToStyle(course);
                                        return (
                                            <div
                                                key={course.id}
                                                className={`absolute p-1 rounded-sm shadow-sm cursor-pointer hover:opacity-100 opacity-90 transition-opacity z-10 flex flex-col justify-center items-center text-center overflow-hidden leading-none ${course.color || 'bg-blue-100 text-blue-800'}`}
                                                style={style}
                                                onClick={() => handleDeleteCourse(course.id)}
                                                title={`${course.name} (클릭하여 삭제)`}
                                            >
                                                <div className="font-bold text-xs truncate w-full px-1">{course.name}</div>
                                                <div className="text-[10px] truncate">{course.location}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Right: History List (Confirmed Courses) */}
                        <div className="w-80 flex flex-col bg-white border border-gray-300 shadow-sm flex-shrink-0">
                            <div className="bg-[#e8ecef] p-1.5 border-b border-gray-300 flex flex-col justify-center space-y-1">
                                <h3 className="font-bold text-[#1f3a93] text-xs">▶ 수강신청내역 (완료)</h3>
                                <div className="text-xs font-normal text-gray-600 flex justify-between">
                                    {/* Calculate only registered credits */}
                                    <span>학점: <span className="font-bold text-red-600">{myCourses.filter(c => c.registrationStatus === 'registered').reduce((sum, c) => sum + (c.credits || 0), 0)}</span></span>
                                    <span>과목: <span className="font-bold text-blue-600">{myCourses.filter(c => c.registrationStatus === 'registered').length}</span></span>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <table className="w-full border-collapse text-xs table-fixed">
                                    <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                                        <tr>
                                            <th className="border border-gray-300 px-1 py-1 w-12">취소</th>
                                            <th className="border border-gray-300 px-1 py-1">교과목명</th>
                                            <th className="border border-gray-300 px-1 py-1 w-10">학점</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myCourses.filter(c => c.registrationStatus === 'registered').map((course) => (
                                            <tr key={course.id} className="hover:bg-red-50 text-center even:bg-white odd:bg-gray-50">
                                                <td className="border border-gray-300 px-1 py-1">
                                                    <button
                                                        onClick={() => handleDeleteCourse(course.id)}
                                                        className="bg-gray-500 text-white px-2 py-0.5 rounded-sm hover:bg-gray-600 text-[10px]"
                                                    >
                                                        삭제
                                                    </button>
                                                </td>
                                                <td className="border border-gray-300 px-1 py-1 text-left pl-2 font-medium truncate" title={course.name}>
                                                    {course.name}
                                                </td>
                                                <td className="border border-gray-300 px-1 py-1">{course.credits || 0}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Right Sidebar (Basket) */}
                <div className="w-80 flex flex-col p-3 bg-gray-50 overflow-hidden flex-shrink-0 border-l border-gray-300">
                    <div className="flex-1 flex flex-col bg-white border border-gray-300 shadow-sm">
                        <div className="bg-[#e8ecef] p-1.5 border-b border-gray-300 flex flex-col justify-center space-y-1">
                            <h3 className="font-bold text-[#1f3a93] text-xs">▶ 장바구니</h3>
                            <div className="text-xs font-normal text-gray-600 flex justify-between">
                                <span>과목수: <span className="font-bold text-blue-600">{myCourses.filter(c => c.registrationStatus !== 'registered').length}</span></span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse text-xs table-fixed">
                                <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                                    <tr>
                                        <th className="border border-gray-300 px-1 py-1 w-20">신청/삭제</th>
                                        <th className="border border-gray-300 px-1 py-1">교과목명</th>
                                        <th className="border border-gray-300 px-1 py-1 w-10">학점</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myCourses.filter(c => c.registrationStatus !== 'registered').map((course) => (
                                        <tr key={course.id} className="hover:bg-green-50 text-center even:bg-white odd:bg-gray-50">
                                            <td className="border border-gray-300 px-1 py-1 flex justify-center space-x-1">
                                                <button
                                                    onClick={() => handleRegisterCourse(course.id)}
                                                    className="bg-blue-600 text-white px-2 py-0.5 rounded-sm hover:bg-blue-700 text-[10px]"
                                                >
                                                    신청
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(course.id)}
                                                    className="bg-gray-500 text-white px-2 py-0.5 rounded-sm hover:bg-gray-600 text-[10px]"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                            <td className="border border-gray-300 px-1 py-1 text-left pl-2 font-medium truncate" title={course.name}>{course.name}</td>
                                            <td className="border border-gray-300 px-1 py-1">{course.credits || 0}</td>
                                        </tr>
                                    ))}
                                    {myCourses.filter(c => c.registrationStatus !== 'registered').length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-4 text-gray-500 text-center">비어있음</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-96 animate-fade-in-up">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {deleteTarget.status === 'registered' ? '수강신청 취소' : '장바구니 삭제'}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                <span className="font-semibold text-blue-600">{deleteTarget.name}</span>을(를) <br />
                                {deleteTarget.status === 'registered' ? '수강내역에서 삭제하시겠습니까?' : '장바구니에서 삭제하시겠습니까?'}
                            </p>
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                >
                                    삭제하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseRegistration;

