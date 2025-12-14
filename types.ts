
export enum DayOfWeek {
  MON = '월',
  TUE = '화',
  WED = '수',
  THU = '목',
  FRI = '금',
  SAT = '토',
  SUN = '일',
}

export interface LectureData {
  id: string;
  name: string;
  professor: string;
  room: string;
  dept: string;
  major: string;
  type: string;
  credit: number;
  hours: number;
  time_text: string;
  schedule: {
    day: string;
    periods: number[];
  }[];
  cyber_hours?: number; // 원본 데이터의 사이버 시간
}

export interface Semester {
  id: string;
  name: string; // e.g., "1학년 1학기", "2024년 2학기"
  userId: string;
  createdAt?: any;
}

export interface Course {
  id: string;
  semesterId: string; // Link course to a specific semester
  name: string;
  professor: string;
  location: string;
  day: string;       // 100% 사이버 강의인 경우 빈 문자열 "" 저장
  startTime: string; // "HH:MM" format
  endTime: string; // "HH:MM" format
  color: string;
  credits: number;
  userId: string;
  
  // 확장 필드
  lectureId?: string;
  type?: string;
  
  // [추가됨] 사이버 강의 시간
  cyberHours?: number;
  
  // [추가됨] 수강신청 관련 필드
  isTemp?: boolean;   // 수강신청 장바구니용 임시 과목 여부
  registrationStatus?: 'basket' | 'registered'; // 장바구니 vs 신청완료 상태
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export type AppView = 'timetable' | 'major' | 'chatbot' | 'profile' | 'registration';

export const PREDEFINED_SEMESTERS = [
  "1학년 1학기", "1학년 2학기",
  "2학년 1학기", "2학년 2학기",
  "3학년 1학기", "3학년 2학기",
  "4학년 1학기", "4학년 2학기"
];
