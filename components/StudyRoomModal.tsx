import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../services/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDoc,
  doc,
} from 'firebase/firestore';

interface StudyRoom {
  id: string;
  courseId: string;
  courseName: string;
  professor?: string;
  lectureId?: string;
  semesterId: string;
  creatorId: string;
  participants: string[];
  createdAt: any;
  description?: string;
  capacity?: number;
}

interface Message {
  id: string;
  roomId: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: any;
}

interface UserInfo {
  uid: string;
  name: string;
  username?: string;
  studentId?: string;
}

interface StudyRoomModalProps {
  isOpen: boolean;
  room: StudyRoom | null;
  onClose: () => void;
}

const StudyRoomModal: React.FC<StudyRoomModalProps> = ({ isOpen, room, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [participants, setParticipants] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  // 메시지 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 참여자 정보 가져오기
  useEffect(() => {
    if (!room || !isOpen) return;

    const fetchParticipants = async () => {
      try {
        const participantInfos: UserInfo[] = [];
        
        for (const uid of room.participants || []) {
          try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              participantInfos.push({
                uid,
                name: data.name || data.username || '이름 없음',
                username: data.username,
                studentId: data.studentId,
              });
            } else {
              participantInfos.push({
                uid,
                name: '이름 없음',
              });
            }
          } catch (error) {
            console.error(`Failed to fetch user ${uid}:`, error);
            participantInfos.push({
              uid,
              name: '이름 없음',
            });
          }
        }
        
        setParticipants(participantInfos);
      } catch (error) {
        console.error('Failed to fetch participants:', error);
      }
    };

    fetchParticipants();
  }, [room, isOpen]);

  // 실시간 메시지 가져오기
  useEffect(() => {
    if (!room || !isOpen) return;

    const messagesRef = collection(db, 'studyRooms', room.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      // 메시지에 사용자 이름 추가
      const messagesWithNames = await Promise.all(
        messagesData.map(async (msg) => {
          if (msg.userName) return msg;
          
          try {
            const userDoc = await getDoc(doc(db, 'users', msg.userId));
            if (userDoc.exists()) {
              const data = userDoc.data();
              return {
                ...msg,
                userName: data.name || data.username || '이름 없음',
              };
            }
          } catch (error) {
            console.error(`Failed to fetch user name for ${msg.userId}:`, error);
          }
          
          return { ...msg, userName: '이름 없음' };
        })
      );

      setMessages(messagesWithNames);
    });

    return () => unsubscribe();
  }, [room, isOpen]);

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !room || !messageText.trim()) return;

    // 참여자인지 확인
    if (!room.participants?.includes(user.uid)) {
      alert('참여자만 메시지를 보낼 수 있습니다.');
      return;
    }

    setLoading(true);
    try {
      const messagesRef = collection(db, 'studyRooms', room.id, 'messages');
      
      // 사용자 이름 가져오기
      let userName = '이름 없음';
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          userName = data.name || data.username || '이름 없음';
        }
      } catch (error) {
        console.error('Failed to fetch user name:', error);
      }

      await addDoc(messagesRef, {
        roomId: room.id,
        userId: user.uid,
        userName,
        text: messageText.trim(),
        createdAt: serverTimestamp(),
      });

      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !room) return null;

  const currentUserInfo = participants.find(p => p.uid === user?.uid);
  const isParticipant = room.participants?.includes(user?.uid || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {room.courseName}
              {room.professor && (
                <span className="text-sm font-normal text-gray-600 dark:text-gray-400 ml-2">
                  ({room.professor})
                </span>
              )}
            </h2>
            {room.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {room.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 메시지 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 참여자 정보 */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  참여자 ({participants.length}명):
                </span>
                {participants.map((p) => (
                  <span
                    key={p.uid}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.uid === user?.uid
                        ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {p.name}
                    {p.uid === room.creatorId && ' (방장)'}
                  </span>
                ))}
              </div>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  아직 메시지가 없습니다. 첫 메시지를 보내보세요!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.userId === user?.uid;
                  return (
                    <div
                      key={msg.id}
                      className={`flex w-full ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-purple-500 text-white rounded-br-sm'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="text-xs font-semibold mb-1 opacity-80">
                            {msg.userName || '이름 없음'}
                          </div>
                        )}
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {msg.text}
                        </div>
                        {msg.createdAt && (
                          <div className={`text-xs mt-1 opacity-70 ${
                            isOwnMessage ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            {msg.createdAt.toDate ? 
                              new Date(msg.createdAt.toDate()).toLocaleTimeString('ko-KR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : 
                              '방금'
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            {isParticipant ? (
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !messageText.trim()}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    전송
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center text-sm text-gray-600 dark:text-gray-400">
                참여자만 메시지를 보낼 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRoomModal;

