import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';

const StudyBoard: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [capacity, setCapacity] = useState('');

  const user = auth.currentUser;

  // 🔥 실시간 게시글 불러오기
  useEffect(() => {
    const q = collection(db, 'studyPosts');
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(list);
    });
  }, []);

  // 🔥 글 작성
  const createPost = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력하세요.');
      return;
    }

    const capNum = capacity ? Number(capacity) : null;
    if (capNum !== null && (isNaN(capNum) || capNum <= 0)) {
      alert('정원은 1 이상의 숫자여야 합니다.');
      return;
    }

    await addDoc(collection(db, 'studyPosts'), {
      title,
      content,
      capacity: capNum, // 정원
      participants: [], // ⭐ 신청자 목록
      createdAt: serverTimestamp(),
    });

    setTitle('');
    setContent('');
    setCapacity('');
  };

  // 🔥 신청하기 기능
  const handleApply = async (post: any) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const postRef = doc(db, 'studyPosts', post.id);

    // 이미 신청했는지 확인
    if (post.participants?.includes(user.uid)) {
      alert('이미 신청한 스터디입니다.');
      return;
    }

    const currentCount = post.participants?.length || 0;

    // 정원 초과 체크
    if (post.capacity !== null && currentCount >= post.capacity) {
      alert('정원이 이미 가득 찼습니다.');
      return;
    }

    // Firestore 업데이트
    await updateDoc(postRef, {
      participants: [...(post.participants || []), user.uid],
    });

    alert('신청 완료!');
  };

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-xl font-bold">스터디 게시판</h2>

      <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="제목 입력"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 border rounded h-24"
          placeholder="내용 입력"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <input
            type="number"
            className="w-32 p-2 border rounded"
            placeholder="정원"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min={1}
          />
          <span className="text-sm text-gray-600">명</span>
        </div>

        <button
          onClick={createPost}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          글 작성
        </button>
      </div>

      {/* 🔥 게시글 목록 */}
      <div className="space-y-4">
        {posts.map((post) => {
          const current = post.participants?.length || 0;
          const isFull =
            post.capacity !== null && current >= post.capacity;

          return (
            <div
              key={post.id}
              className="p-4 border rounded bg-gray-50 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{post.title}</h3>

              <p className="text-sm mt-1 whitespace-pre-line">{post.content}</p>

              <div className="text-sm text-gray-700 mt-2">
                정원:{' '}
                {post.capacity ? `${current} / ${post.capacity}명` : '제한 없음'}
              </div>

              {/* 🔥 신청 버튼 */}
              <button
                disabled={isFull}
                onClick={() => handleApply(post)}
                className={`mt-3 px-3 py-1 rounded text-white ${
                  isFull
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {isFull ? '모집 마감' : '신청하기'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudyBoard;
