
export enum DayOfWeek {
  MON = '월',
  TUE = '화',
  WED = '수',
  THU = '목',
  FRI = '금',
}

export interface Semester {
  id: string;
  name: string; // e.g., "1학년 1학기", "2024년 2학기"
}

export interface Course {
  id: string;
  semesterId: string; // Link course to a specific semester
  name: string;
  professor: string;
  location: string;
  day: DayOfWeek;
  startTime: string; // "HH:MM" format
  endTime: string; // "HH:MM" format
  color: string;
  credits: number;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export type AppView = 'timetable' | 'major' | 'chatbot';

export interface User {
  id: string;
  username: string; // 아이디
  password: string; // 비밀번호 (실제로는 해시화되어야 함)
  name: string; // 이름
  studentId: string; // 학번
  department: string; // 학부
  major: string; // 학과
  grade: number; // 학년
  gender: 'male' | 'female' | 'other'; // 성별
  age: number; // 나이
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
