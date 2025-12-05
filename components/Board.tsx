import React from 'react';
import PlusIcon from './icons/PlusIcon';

const Board: React.FC = () => {
  const posts = [
    { id: 1, title: '이번 학기 꿀교양 추천좀요 🙏', author: '익명', time: '10분 전', likes: 5, comments: 2, category: '자유' },
    { id: 2, title: '중간고사 기간 도서관 자리 있나요?', author: '익명', time: '30분 전', likes: 12, comments: 8, category: '정보' },
    { id: 3, title: '컴공 3학년 전공 질문입니다', author: '컴공생', time: '1시간 전', likes: 3, comments: 1, category: '학업' },
    { id: 4, title: '학식 메뉴 오늘 뭔가요?', author: '배고파', time: '2시간 전', likes: 8, comments: 4, category: '생활' },
    { id: 5, title: '댄스 동아리 신입 부원 모집합니다! 💃', author: '댄스동아리', time: '3시간 전', likes: 15, comments: 0, category: '홍보' },
    { id: 6, title: '노트북 분실하신 분 찾아요', author: '천사', time: '5시간 전', likes: 20, comments: 3, category: '생활' },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-6">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 ml-2">게시판</h2>
          <div className="flex space-x-2">
             <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </button>
             <button className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full transition-colors">
                <PlusIcon className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Categories (Optional Scrollable Row) */}
        <div className="px-4 py-3 flex space-x-2 overflow-x-auto border-b border-gray-50 dark:border-gray-700 no-scrollbar">
            {['전체', '자유', '정보', '학업', '생활', '홍보', '장터'].map((cat, idx) => (
                <button 
                    key={cat} 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        idx === 0 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Post List */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {posts.map((post) => (
            <div key={post.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-normal bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 mr-2 align-middle">{post.category}</span>
                      {post.title}
                  </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                  (내용 미리보기) 안녕하세요, 혹시 이번 학기 꿀교양 아시는 분 계신가요? 과제 적고 팀플 없는 과목으로 추천 부탁드립니다...
              </p>
              <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
                <div className="flex space-x-2 items-center">
                    <span>{post.author}</span>
                    <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                    <span>{post.time}</span>
                </div>
                <div className="flex space-x-3">
                    <span className="text-red-400 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        {post.likes}
                    </span>
                    <span className="text-blue-400 flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        {post.comments}
                    </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Board;