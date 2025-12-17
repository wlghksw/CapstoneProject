import React, { useEffect, useState, useMemo } from 'react';
import { db, auth } from '../services/firebase';
import { courseService } from '../services/courseService';
import { Course } from '../types';
import StudyIcon from './icons/StudyIcon';
import PlusIcon from './icons/PlusIcon';
import StudyRoomModal from './StudyRoomModal';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';

interface StudyRoom {
  id: string;
  courseId: string;
  courseName: string;
  professor?: string;
  lectureId?: string; // 같은 강의를 식별하기 위한 ID
  semesterId: string;
  creatorId: string;
  participants: string[];
  createdAt: any;
  description?: string;
  capacity?: number;
}

const StudyBoard: React.FC = () => {
  const [registeredCourses, setRegisteredCourses] = useState<Course[]>([]);
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const user = auth.currentUser;

  // 수강신청 완료된 과목 목록 가져오기
  useEffect(() => {
    const fetchRegisteredCourses = async () => {
      if (!user) return;
      
      try {
        // 모든 학기의 수강신청 완료된 과목 가져오기
        const semesters = await courseService.getUserSemesters(user.uid);
        let allCourses: Course[] = [];
        
        for (const semester of semesters) {
          const courses = await courseService.getUserCourses(user.uid, semester.id);
          // 수강신청 완료된 과목만 필터링 (isTemp가 false이고 registrationStatus가 'registered')
          const registered = courses.filter(
            c => !c.isTemp && c.registrationStatus === 'registered'
          );
          allCourses = [...allCourses, ...registered];
        }
        
        setRegisteredCourses(allCourses);
      } catch (error) {
        console.error('Failed to fetch registered courses:', error);
      }
    };

    fetchRegisteredCourses();
  }, [user]);

  // 실시간 스터디 방 목록 불러오기
  useEffect(() => {
    if (registeredCourses.length === 0) return;

    // 수강신청한 과목의 식별자 생성 (과목명 + 교수명 조합 또는 lectureId)
    const courseIdentifiers = registeredCourses.map(course => {
      // lectureId가 있으면 그것을 사용, 없으면 과목명+교수명 조합 사용
      if (course.lectureId) {
        return { type: 'lectureId', value: course.lectureId };
      }
      return { 
        type: 'name', 
        value: `${course.name}|${course.professor || ''}` 
      };
    });
    
    if (courseIdentifiers.length === 0) return;

    // 모든 스터디 방을 가져온 후 클라이언트에서 필터링
    const q = collection(db, 'studyRooms');

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const allRooms = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as StudyRoom[];

        // 수강신청한 과목의 스터디 방만 필터링
        // lectureId로 매칭하거나, 과목명+교수명 조합으로 매칭
        const filteredRooms = allRooms.filter(room => {
          return courseIdentifiers.some(identifier => {
            if (identifier.type === 'lectureId' && room.lectureId) {
              return room.lectureId === identifier.value;
            }
            if (identifier.type === 'name') {
              const roomIdentifier = `${room.courseName}|${room.professor || ''}`;
              return roomIdentifier === identifier.value;
            }
            return false;
          });
        });
        
        setStudyRooms(filteredRooms);
      },
      (error) => {
        console.error('Error in study rooms snapshot:', error);
      }
    );

    return () => unsubscribe();
  }, [registeredCourses]);

  // 과목별로 그룹화된 스터디 방
  const roomsByCourse = useMemo(() => {
    const grouped: { [courseId: string]: { course: Course; rooms: StudyRoom[] } } = {};
    
    registeredCourses.forEach(course => {
      // 같은 강의를 식별하기 위해 lectureId 또는 과목명+교수명 조합 사용
      const rooms = studyRooms.filter(room => {
        if (course.lectureId && room.lectureId) {
          return room.lectureId === course.lectureId;
        }
        const courseIdentifier = `${course.name}|${course.professor || ''}`;
        const roomIdentifier = `${room.courseName}|${room.professor || ''}`;
        return courseIdentifier === roomIdentifier;
      });
      
      // 스터디 방이 있거나 선택된 과목이면 표시
      if (rooms.length > 0 || selectedCourseId === course.id) {
        grouped[course.id] = { course, rooms };
      }
    });
    
    return grouped;
  }, [registeredCourses, studyRooms, selectedCourseId]);

  // 스터디 방 생성
  const createStudyRoom = async () => {
    // 중복 클릭 방지: 이미 생성 중이면 리턴
    if (isCreating) {
      console.log('Already creating a room, ignoring duplicate click');
      return;
    }
    
    if (!user || !selectedCourseId) {
      alert('과목을 선택해주세요.');
      return;
    }

    const course = registeredCourses.find(c => c.id === selectedCourseId);
    if (!course) {
      alert('선택한 과목을 찾을 수 없습니다.');
      return;
    }

    const capNum = capacity ? Number(capacity) : null;
    if (capNum !== null && (isNaN(capNum) || capNum <= 0)) {
      alert('정원은 1 이상의 숫자여야 합니다.');
      return;
    }

    // 생성 시작 전에 즉시 상태 업데이트하여 중복 클릭 방지
    setIsCreating(true);
    
    try {
      console.log('Creating study room for course:', course.name, 'by user:', user.uid);
      
      await addDoc(collection(db, 'studyRooms'), {
        courseId: selectedCourseId,
        courseName: course.name,
        professor: course.professor || '',
        lectureId: course.lectureId || null, // 같은 강의를 식별하기 위한 ID
        semesterId: course.semesterId,
        creatorId: user.uid,
        participants: [user.uid], // 생성자도 참여자에 포함
        description: description.trim() || '',
        capacity: capNum,
        createdAt: serverTimestamp(),
      });

      console.log('Study room created successfully');
      
      setDescription('');
      setCapacity('');
      setSelectedCourseId(null);
      alert('스터디 방이 생성되었습니다!');
    } catch (error) {
      console.error('Failed to create study room:', error);
      alert('스터디 방 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  // 스터디 방 참여
  const handleJoinRoom = async (room: StudyRoom) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 이미 참여했는지 확인
    if (room.participants?.includes(user.uid)) {
      alert('이미 참여한 스터디 방입니다.');
      return;
    }

    // 정원 초과 체크
    const currentCount = room.participants?.length || 0;
    if (room.capacity !== null && room.capacity !== undefined && currentCount >= room.capacity) {
      alert('정원이 이미 가득 찼습니다.');
      return;
    }

    try {
      const roomRef = doc(db, 'studyRooms', room.id);
      await updateDoc(roomRef, {
        participants: [...(room.participants || []), user.uid],
      });
      alert('스터디 방에 참여했습니다!');
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('참여에 실패했습니다.');
    }
  };

  // 스터디 방 나가기
  const handleLeaveRoom = async (room: StudyRoom) => {
    if (!user) return;

    if (!room.participants?.includes(user.uid)) {
      alert('참여하지 않은 스터디 방입니다.');
      return;
    }

    try {
      const roomRef = doc(db, 'studyRooms', room.id);
      const updatedParticipants = room.participants.filter(uid => uid !== user.uid);
      
      // 참여자가 없으면 방 삭제 (선택사항)
      if (updatedParticipants.length === 0) {
        await updateDoc(roomRef, {
          participants: [],
        });
      } else {
        await updateDoc(roomRef, {
          participants: updatedParticipants,
        });
      }
      
      alert('스터디 방에서 나갔습니다.');
    } catch (error) {
      console.error('Failed to leave room:', error);
      alert('나가기에 실패했습니다.');
    }
  };

  // 스터디 방 삭제 (방장만 가능)
  const handleDeleteRoom = async (room: StudyRoom) => {
    if (!user) return;

    if (room.creatorId !== user.uid) {
      alert('방장만 방을 삭제할 수 있습니다.');
      return;
    }

    if (!confirm('정말로 이 스터디 방을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      const roomRef = doc(db, 'studyRooms', room.id);
      
      // 삭제 전에 문서가 존재하는지 확인
      console.log('Deleting room:', room.id, room.courseName);
      
      await deleteDoc(roomRef);
      
      console.log('Room deleted successfully');
      
      // 삭제 후 로컬 상태에서도 즉시 제거 (실시간 업데이트를 기다리지 않고)
      setStudyRooms(prevRooms => prevRooms.filter(r => r.id !== room.id));
      
      alert('스터디 방이 삭제되었습니다.');
    } catch (error) {
      console.error('Failed to delete room:', error);
      alert('방 삭제에 실패했습니다: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">로그인이 필요합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  if (registeredCourses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full mr-3">
                <StudyIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">과목별 스터디 그룹</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">수강신청한 과목으로 스터디 그룹을 만들 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="p-12 text-center">
            <div className="mb-4">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                <StudyIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              수강신청한 과목이 없습니다
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              수강신청을 완료하면 해당 과목의 스터디 그룹을 만들 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full mr-3">
              <StudyIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">과목별 스터디 그룹</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">수강신청한 과목으로 스터디 그룹을 만들고 참여할 수 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 스터디 방 생성 폼 */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">새 스터디 방 만들기</h3>
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
              <PlusIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              과목 선택
            </label>
            <select
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(e.target.value || null)}
            >
              <option value="">과목을 선택하세요</option>
            {registeredCourses.map((course) => {
              // 같은 과목의 스터디 방 개수 확인 (정보 표시용)
              const roomCount = studyRooms.filter(room => {
                if (course.lectureId && room.lectureId) {
                  return room.lectureId === course.lectureId;
                }
                const courseIdentifier = `${course.name}|${course.professor || ''}`;
                const roomIdentifier = `${room.courseName}|${room.professor || ''}`;
                return courseIdentifier === roomIdentifier;
              }).length;
              
              return (
                <option key={course.id} value={course.id}>
                  {course.name} {course.professor && `(${course.professor})`} {roomCount > 0 && ` - 기존 방 ${roomCount}개`}
                </option>
              );
            })}
            </select>
          </div>

          {selectedCourseId && (
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  설명 (선택사항)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                  placeholder="스터디 방에 대한 설명을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    정원 (선택사항)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-24 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="정원"
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      min={1}
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">명 (비워두면 제한 없음)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={createStudyRoom}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                {isCreating ? '생성 중...' : '스터디 방 만들기'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 과목별 스터디 방 목록 */}
      <div className="space-y-4">
        {Object.keys(roomsByCourse).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
            <div className="mb-4">
              <div className="inline-flex p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
                <StudyIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              아직 생성된 스터디 방이 없습니다
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              위에서 과목을 선택하여 스터디 방을 만들어보세요.
            </p>
          </div>
        ) : (
          Object.values(roomsByCourse).map(({ course, rooms }) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {/* 과목 헤더 */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {course.name}
                  {course.professor && (
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                      ({course.professor})
                    </span>
                  )}
                </h3>
              </div>
              
              {/* 스터디 방 목록 */}
              <div className="p-4 space-y-3">
                {rooms.map((room) => {
                  const current = room.participants?.length || 0;
                  const isFull = room.capacity !== null && room.capacity !== undefined && current >= room.capacity;
                  const isParticipant = room.participants?.includes(user.uid) || false;
                  const isCreator = room.creatorId === user.uid;

                  return (
                    <div
                      key={room.id}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:shadow-md transition-shadow"
                    >
                      {room.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-line leading-relaxed">
                          {room.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="font-medium">
                              {current}명
                              {room.capacity !== null && room.capacity !== undefined && ` / ${room.capacity}명`}
                            </span>
                          </div>
                          {isCreator && (
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                              방장
                            </span>
                          )}
                          {isParticipant && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                              참여중
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isCreator ? (
                          // 방장인 경우: 채팅하기 + 방 삭제 버튼
                          <>
                            <button
                              onClick={() => {
                                setSelectedRoom(room);
                                setIsModalOpen(true);
                              }}
                              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                              채팅하기
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              삭제
                            </button>
                          </>
                        ) : !isParticipant ? (
                          // 참여하지 않은 경우: 참여하기 버튼
                          <button
                            disabled={isFull}
                            onClick={() => handleJoinRoom(room)}
                            className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              isFull
                                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
                            }`}
                          >
                            {isFull ? '정원 마감' : '참여하기'}
                          </button>
                        ) : (
                          // 참여한 경우: 채팅하기 + 나가기 버튼
                          <>
                            <button
                              onClick={() => {
                                setSelectedRoom(room);
                                setIsModalOpen(true);
                              }}
                              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                              채팅하기
                            </button>
                            <button
                              onClick={() => handleLeaveRoom(room)}
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              나가기
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 스터디 방 채팅 모달 */}
      <StudyRoomModal
        isOpen={isModalOpen}
        room={selectedRoom}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoom(null);
        }}
      />
    </div>
  );
};

export default StudyBoard;
