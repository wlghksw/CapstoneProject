import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const StudyBoard: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 게시글 실시간 불러오기
  useEffect(() => {
    const q = collection(db, "studyPosts");
    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(list);
    });
  }, []);

  // 글 작성
  const createPost = async () => {
    if (!title || !content) return alert("제목과 내용을 입력하세요.");

    await addDoc(collection(db, "studyPosts"), {
      title,
      content,
      createdAt: serverTimestamp(),
    });

    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6 mt-6">
      <h2 className="text-xl font-bold">스터디 게시판</h2>

      {/* 글쓰기 */}
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

        <button
          onClick={createPost}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          글 작성
        </button>
      </div>

      {/* 게시글 목록 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="p-4 border rounded bg-gray-50 shadow-sm"
          >
            <h3 className="text-lg font-semibold">{post.title}</h3>
            <p className="text-sm mt-2 whitespace-pre-line">{post.content}</p>

            <div className="text-xs text-gray-500 mt-2">
              {post.createdAt?.toDate
                ? post.createdAt.toDate().toLocaleString()
                : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyBoard;
