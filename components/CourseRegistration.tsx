import React, { useEffect, useState } from 'react';
import { Course } from '../types';
import { courseService } from '../services/courseService';
// import { ROADMAPS } from '../roadmapData'; // No longer needed
import { COURSE_COLORS } from '../constants';

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
        if (!userId || !semesterId) return;
        try {
            const fetchedCourses = await courseService.getUserCourses(userId, semesterId);
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

    const handleAddCourse = async (lecture: any) => {
        if (!userId || !semesterId) return;
        setLoading(true);
        try {
            // LectureData conversion logic
            let day = "월";
            let startTime = "09:00";
            let endTime = "10:00";

            if (lecture.schedule && lecture.schedule.length > 0) {
                const sched = lecture.schedule[0];
                day = sched.day;
                if (sched.periods && sched.periods.length > 0) {
                    const startPeriod = Math.min(...sched.periods);
                    const endPeriod = Math.max(...sched.periods);
                    // 1교시 -> 09:00
                    const startH = (startPeriod - 1) + 9;
                    const endH = (endPeriod - 1) + 9 + 1;

                    startTime = `${startH.toString().padStart(2, '0')}:00`;
                    endTime = `${endH.toString().padStart(2, '0')}:00`;
                }
            }

            const color = COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)];

            await courseService.addCourseToSemester({
                name: lecture.name,
                professor: lecture.professor,
                location: lecture.room,
                day: day,
                startTime: startTime,
                endTime: endTime,
                color: color,
                semesterId: semesterId,
                userId: userId,
                credits: lecture.credit || 3,
                lectureId: lecture.id,
                type: lecture.type
            });
            await fetchMyCourses();
        } catch (error) {
            alert("강의 추가 실패: " + error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCourse = async (id: string) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        setLoading(true);
        try {
            await courseService.deleteCourse(id);
            await fetchMyCourses();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] text-sm font-sans bg-white">
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

                {/* 2. Center Column (Course List) */}
                <div className="flex-1 flex flex-col p-3 bg-gray-50 overflow-hidden border-r border-gray-300">
                    <div className="flex-1 flex flex-col bg-white border border-gray-300 shadow-sm">
                        <div className="bg-[#e8ecef] p-1.5 border-b border-gray-300 flex justify-between items-center">
                            <h3 className="font-bold text-[#1f3a93] text-xs">▶ 개설강좌 리스트 (건수: {searchResult.length})</h3>
                            <div className="space-x-1">
                                <span className="text-xs text-gray-500">※ 과목코드를 클릭하면 강의계획서를 볼 수 있습니다.</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse text-xs table-fixed">
                                <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                                    <tr>
                                        <th className="border border-gray-300 px-1 py-1 w-10">NO</th>
                                        <th className="border border-gray-300 px-1 py-1 w-12">신청</th>
                                        <th className="border border-gray-300 px-1 py-1 w-16">이수구분</th>
                                        <th className="border border-gray-300 px-1 py-1 w-16">과목코드</th>
                                        <th className="border border-gray-300 px-1 py-1 w-10">학년</th>
                                        <th className="border border-gray-300 px-1 py-1 w-10">학점</th>
                                        <th className="border border-gray-300 px-1 py-1">교과목명</th>
                                        <th className="border border-gray-300 px-1 py-1 w-16">담당교수</th>
                                        <th className="border border-gray-300 px-1 py-1 w-24">강의시간/실</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResult.map((course, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 text-center even:bg-white odd:bg-gray-50">
                                            <td className="border border-gray-300 px-1 py-1">{idx + 1}</td>
                                            <td className="border border-gray-300 px-1 py-1">
                                                <button
                                                    onClick={() => handleAddCourse(course)}
                                                    className="bg-[#1f3a93] text-white px-2 py-0.5 rounded-sm hover:bg-[#152970]"
                                                >
                                                    신청
                                                </button>
                                            </td>
                                            <td className="border border-gray-300 px-1 py-1 text-gray-600">{course.type}</td>
                                            <td className="border border-gray-300 px-1 py-1 text-blue-600 cursor-pointer hover:underline">{course.id}</td>
                                            <td className="border border-gray-300 px-1 py-1">{course.year || '-'}</td>
                                            <td className="border border-gray-300 px-1 py-1">{course.credit || 3}</td>
                                            <td className="border border-gray-300 px-1 py-1 text-left pl-2 font-medium truncate" title={course.name}>{course.name}</td>
                                            <td className="border border-gray-300 px-1 py-1 truncate">{course.professor}</td>
                                            <td className="border border-gray-300 px-1 py-1 text-left pl-1 truncate" title={course.time_text}>{course.time_text || (course.schedule && course.schedule.length > 0 ? `${course.schedule[0].day} ${course.schedule[0].periods.join(',')}` : '')} / {course.room}</td>
                                        </tr>
                                    ))}
                                    {searchResult.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="py-8 text-gray-500 text-center">
                                                검색 결과가 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* 3. Right Column (Basket) */}
                <div className="w-80 flex flex-col p-3 bg-gray-50 overflow-hidden flex-shrink-0">
                    <div className="flex-1 flex flex-col bg-white border border-gray-300 shadow-sm">
                        <div className="bg-[#e8ecef] p-1.5 border-b border-gray-300 flex flex-col justify-center space-y-1">
                            <h3 className="font-bold text-[#1f3a93] text-xs">▶ 수강신청내역 (장바구니)</h3>
                            <div className="text-xs font-normal text-gray-600 flex justify-between">
                                <span>학점: <span className="font-bold text-red-600">{myCourses.reduce((sum, c) => sum + (c.credits || 0), 0)}</span></span>
                                <span>과목: <span className="font-bold text-blue-600">{myCourses.length}</span></span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <table className="w-full border-collapse text-xs table-fixed">
                                <thead className="bg-[#f5f5f5] sticky top-0 z-10">
                                    <tr>
                                        <th className="border border-gray-300 px-1 py-1 w-10">취소</th>
                                        <th className="border border-gray-300 px-1 py-1">교과목명</th>
                                        <th className="border border-gray-300 px-1 py-1 w-10">학점</th>
                                        <th className="border border-gray-300 px-1 py-1 w-16">시간</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myCourses.map((course) => (
                                        <tr key={course.id} className="hover:bg-red-50 text-center even:bg-white odd:bg-gray-50">
                                            <td className="border border-gray-300 px-1 py-1">
                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="bg-gray-500 text-white px-2 py-0.5 rounded-sm hover:bg-gray-600"
                                                >
                                                    삭제
                                                </button>
                                            </td>
                                            <td className="border border-gray-300 px-1 py-1 text-left pl-2 font-medium truncate" title={course.name}>{course.name}</td>
                                            <td className="border border-gray-300 px-1 py-1">{course.credits || 0}</td>
                                            <td className="border border-gray-300 px-1 py-1 truncate">{course.day} {course.startTime}</td>
                                        </tr>
                                    ))}
                                    {myCourses.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-4 text-gray-500">신청 내역 없음</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseRegistration;
