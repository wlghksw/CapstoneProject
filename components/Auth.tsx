import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  // 로그인·회원가입 공통
  const [username, setUsername] = useState('');      // 아이디
  const [studentId, setStudentId] = useState('');    // 학번
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // 회원가입 전용 필드들
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('1');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('');
  const [semester, setSemester] = useState('1');
  const [initialCredits, setInitialCredits] = useState('0');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = ['컴퓨터공학부', '첨단IT학부'];
  const majors = {
    '컴퓨터공학부': ['소프트웨어학전공', '정보보호학전공', '멀티미디어학전공', '인공지능학전공'],
    '첨단IT학부': ['IoT전공', '핀테크전공', '빅데이터전공', 'AR·VR전공'],
  };

  const isFirstSemester = grade === '1' && semester === '1';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 로그인
    if (isLogin) {
      try {
        const email = `${username}`; 
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err: any) {
        switch (err.code) {
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            break;
          default:
            setError('로그인 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // 회원가입 유효성 검사
    if (!username.trim()) {
      setError("아이디를 입력해주세요.");
      setLoading(false);
      return;
    }
    if (!studentId.trim()) {
      setError("학번을 입력해주세요.");
      setLoading(false);
      return;
    }
    if (password.length < 4) {
      setError("비밀번호는 4자 이상이어야 합니다.");
      setLoading(false);
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      setLoading(false);
      return;
    }
    if (!department) {
      setError("학부를 선택해주세요.");
      setLoading(false);
      return;
    }
    if (!major) {
      setError("학과를 선택해주세요.");
      setLoading(false);
      return;
    }
    if (!age || Number(age) < 1) {
      setError("나이를 올바르게 입력해주세요.");
      setLoading(false);
      return;
    }

    // 회원가입 처리
    try {
      const email = `${username}`; // 내부 전용 이메일
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username,
        studentId,
        name,
        department,
        major,
        grade: Number(grade),
        gender,
        age: Number(age),
        semester: `${semester}학기`,
        initialCredits: isFirstSemester ? 0 : Number(initialCredits),
      });

      await addDoc(collection(db, 'semesters'), {
        name: '1학년 1학기',
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 아이디입니다.');
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          {isLogin ? '로그인' : '회원가입'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">

          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* 로그인 전용 / 회원가입 추가 필드 */}
          {!isLogin && (
            <>
              {/* 이름 */}
              <div>
                <label className="block text-sm font-medium">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full border px-3 py-2 rounded-md"
                />
              </div>

              {/* 학번 */}
              <div>
                <label className="block text-sm font-medium">학번</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="mt-1 block w-full border px-3 py-2 rounded-md"
                />
              </div>

              {/* 학부 */}
              <div>
                <label className="block text-sm font-medium">학부</label>
                <select
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); setMajor(''); }}
                  className="mt-1 block w-full border px-3 py-2 rounded-md"
                  required
                >
                  <option value="">학부 선택</option>
                  {departments.map(d => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 학과 */}
              <div>
                <label className="block text-sm font-medium">학과</label>
                <select
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  disabled={!department}
                  className="mt-1 block w-full border px-3 py-2 rounded-md disabled:opacity-50"
                  required
                >
                  <option value="">학과 선택</option>
                  {department && majors[department].map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* 성별 */}
              <div>
                <label className="block text-sm font-medium">성별</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
                  className="mt-1 block w-full border px-3 py-2 rounded-md"
                >
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              </div>

              {/* 나이 */}
              <div>
                <label className="block text-sm font-medium">나이</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="1"
                  max="100"
                  required
                  className="mt-1 block w-full border px-3 py-2 rounded-md"
                />
              </div>

              {/* 학년 / 학기 */}
              <div>
                <label className="block text-sm font-medium">현재 학년</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="mt-1 block w-full border px3 py2 rounded-md"
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                  <option value="4">4학년</option>
                </select>
              </div>

            </>
          )}

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* 비밀번호 확인 */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium">비밀번호 확인</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                className="mt-1 block w-full border px-3 py-2 rounded-md"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold"
            disabled={loading}
          >
            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-500 text-sm"
          >
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;

