import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface UserProfile {
  username: string;
  studentId: string;
  name: string;
  department: string;
  major: string;
  grade: number;
  gender: 'male' | 'female' | 'other';
  age: number;
  semester: string;
  initialCredits: number;
}

interface ProfileEditProps {
  currentUser: User;
  onBack: () => void;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ currentUser, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    studentId: '',
    name: '',
    department: '',
    major: '',
    grade: 1,
    gender: 'male',
    age: 20,
    semester: '1학기',
    initialCredits: 0,
  });

  const departments = ['컴퓨터공학부', '첨단IT학부'];
  const majors = {
    '컴퓨터공학부': ['소프트웨어학전공', '정보보호학전공', '멀티미디어학전공', '인공지능학전공'],
    '첨단IT학부': ['IoT전공', '핀테크전공', '빅데이터전공', 'AR·VR전공'],
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        setProfile(data);
      }
    } catch (error) {
      console.error('프로필 로드 오류:', error);
      setError('프로필을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    // 유효성 검사
    if (!profile.name.trim()) {
      setError('이름을 입력해주세요.');
      setSaving(false);
      return;
    }
    if (!profile.studentId.trim()) {
      setError('학번을 입력해주세요.');
      setSaving(false);
      return;
    }
    if (!profile.department) {
      setError('학부를 선택해주세요.');
      setSaving(false);
      return;
    }
    if (!profile.major) {
      setError('학과를 선택해주세요.');
      setSaving(false);
      return;
    }
    if (!profile.age || Number(profile.age) < 1) {
      setError('나이를 올바르게 입력해주세요.');
      setSaving(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        name: profile.name,
        studentId: profile.studentId,
        department: profile.department,
        major: profile.major,
        grade: Number(profile.grade),
        gender: profile.gender,
        age: Number(profile.age),
        semester: profile.semester,
        initialCredits: Number(profile.initialCredits),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onBack();
      }, 1500);
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      setError('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">내정보 수정</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">프로필 정보를 수정할 수 있습니다.</p>
            </div>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              뒤로가기
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 학번 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              학번 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.studentId}
              onChange={(e) => setProfile({ ...profile, studentId: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 학부 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              학부 <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.department}
              onChange={(e) => {
                setProfile({ ...profile, department: e.target.value, major: '' });
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">학부 선택</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 학과 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              학과 <span className="text-red-500">*</span>
            </label>
            <select
              value={profile.major}
              onChange={(e) => setProfile({ ...profile, major: e.target.value })}
              disabled={!profile.department}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="">학과 선택</option>
              {profile.department && majors[profile.department as keyof typeof majors]?.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* 학년 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              현재 학년
            </label>
            <select
              value={profile.grade}
              onChange={(e) => setProfile({ ...profile, grade: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={1}>1학년</option>
              <option value={2}>2학년</option>
              <option value={3}>3학년</option>
              <option value={4}>4학년</option>
            </select>
          </div>

          {/* 성별 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              성별
            </label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value as 'male' | 'female' | 'other' })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* 나이 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              나이 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => setProfile({ ...profile, age: Number(e.target.value) })}
              min="1"
              max="100"
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 초기 학점 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              초기 학점
            </label>
            <input
              type="number"
              value={profile.initialCredits}
              onChange={(e) => setProfile({ ...profile, initialCredits: Number(e.target.value) })}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              이전 학기에서 이수한 학점을 입력하세요.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400">프로필이 성공적으로 업데이트되었습니다!</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;


