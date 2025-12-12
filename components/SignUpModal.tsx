import React, { useState } from 'react';
import { User } from '../types';
import { saveUser } from '../utils/auth';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    studentId: '',
    department: '',
    major: '',
    grade: '1',
    gender: 'male' as 'male' | 'female' | 'other',
    age: '',
  });
  const [error, setError] = useState('');

  const departments = ['컴퓨터공학부', '첨단IT학부'];
  const majors: Record<string, string[]> = {
    '컴퓨터공학부': ['소프트웨어학전공', '정보보호학전공', '멀티미디어학전공', '인공지능학전공'],
    '첨단IT학부': ['IoT전공', '핀테크전공', '빅데이터전공', 'AR·VR전공'],
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.username.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (formData.password.length < 4) {
      setError('비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.studentId.trim()) {
      setError('학번을 입력해주세요.');
      return;
    }
    if (!formData.department) {
      setError('학부를 선택해주세요.');
      return;
    }
    if (!formData.major) {
      setError('학과를 선택해주세요.');
      return;
    }
    if (!formData.age || parseInt(formData.age) < 1) {
      setError('나이를 올바르게 입력해주세요.');
      return;
    }

    try {
      const newUser: User = {
        id: Date.now().toString(),
        username: formData.username.trim(),
        password: formData.password, // 실제로는 해시화되어야 함
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department,
        major: formData.major,
        grade: parseInt(formData.grade),
        gender: formData.gender,
        age: parseInt(formData.age),
      };

      saveUser(newUser);
      onSuccess(newUser);
      onClose();
      
      // 폼 초기화
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        studentId: '',
        department: '',
        major: '',
        grade: '1',
        gender: 'male',
        age: '',
      });
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 transform transition-all scale-100 my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          회원가입
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                아이디 *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
                placeholder="아이디를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                이름 *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
                placeholder="이름을 입력하세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호 *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
                placeholder="4자 이상 입력하세요"
                minLength={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                비밀번호 확인 *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                학번 *
              </label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
                placeholder="학번을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                학년 *
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
              >
                <option value="1">1학년</option>
                <option value="2">2학년</option>
                <option value="3">3학년</option>
                <option value="4">4학년</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                학부 *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
              >
                <option value="">학부를 선택하세요</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                학과 *
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleChange}
                disabled={!formData.department}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                <option value="">학과를 선택하세요</option>
                {formData.department && majors[formData.department]?.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                성별 *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                나이 *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 border"
                required
                placeholder="나이를 입력하세요"
                min="1"
                max="100"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <div className="flex justify-end items-center pt-4 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 dark:focus:ring-offset-gray-800 transition-colors shadow-sm"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors shadow-sm"
            >
              회원가입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpModal;

