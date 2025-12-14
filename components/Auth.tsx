import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [grade, setGrade] = useState('1');
  const [semester, setSemester] = useState('1');
  const [initialCredits, setInitialCredits] = useState('0');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const isFirstSemester = grade === '1' && semester === '1';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // 로딩 시작

    if (!studentId.trim() || !password.trim()) {
      setError('학번과 비밀번호를 입력해주세요.');
      setLoading(false);
      return;
    }

    const email = `${studentId}@student.com`;

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (password !== passwordConfirm) {
          setError('비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          studentId,
          grade: `${grade}학년`,
          semester: `${semester}학기`,
          initialCredits: isFirstSemester ? 0 : Number(initialCredits),
        });

        await addDoc(collection(db, 'semesters'), {
          name: '1학년 1학기',
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('학번 또는 비밀번호가 올바르지 않습니다.');
          break;
        case 'auth/email-already-in-use':
          setError('이미 가입된 학번입니다.');
          break;
        case 'auth/weak-password':
          setError('비밀번호는 6자리 이상이어야 합니다.');
          break;
        default:
          setError('오류가 발생했습니다. 다시 시도해주세요.');
          break;
      }
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">BU-Planner</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">나만의 스마트한 대학 생활 플래너</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-200 mb-6">{isLogin ? '로그인' : '회원가입'}</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">학번</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                placeholder="20201234"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                placeholder="6자리 이상"
                required
                disabled={loading}
              />
            </div>
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">비밀번호 확인</label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">현재 학년</label>
                    <select value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 px-3 py-2 border" disabled={loading}>
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                      <option value="4">4학년</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">현재 학기</label>
                    <select value={semester} onChange={(e) => setSemester(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 px-3 py-2 border" disabled={loading}>
                      <option value="1">1학기</option>
                      <option value="2">2학기</option>
                    </select>
                  </div>
                </div>
                {!isFirstSemester && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">이전 학기까지 총 이수 학점</label>
                    <input
                      type="number"
                      value={initialCredits}
                      onChange={(e) => setInitialCredits(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm bg-white dark:bg-gray-700 px-3 py-2 border"
                      placeholder="예: 35"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                )}
              </>
            )}
            {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
              disabled={loading}
            >
              {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm text-blue-500 hover:underline" disabled={loading}>
              {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
