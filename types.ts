// types.ts

export enum DayOfWeek {
  MON = '월',
  TUE = '화',
  WED = '수',
  THU = '목',
  FRI = '금',
  SAT = '토',
  SUN = '일',
}

// Firestore 'lectures' 컬렉션의 원본 데이터 구조 (JSON 변환 결과와 일치)
export interface LectureData {
  id: string;        // 예: "0154701" (과목코드+분반)
  name: string;      // 교과목명
  professor: string; // 교수명
  room: string;      // 강의실 (classroom)
  dept: string;      // 학부
  major: string;     // 전공
  type: string;      // 이수구분
  credit: number;    // 학점
  hours: number;     // 시수
  time_text: string; // 원본 시간 텍스트
  schedule: {
    day: string;
    periods: number[];
  }[];
  cyber_hours?: number;
}

// 사용자 시간표에 저장된 과목 정보
export interface Course {
  id: string;
  name: string;
  professor: string;
  location: string;
  day: string;       // DayOfWeek 대신 string으로 하여 유연성 확보 (Service 호환)
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  color: string;
  semesterId: string;
  userId: string;
  
  // 추가된 필드
  credits: number;   // 학점
  lectureId?: string; // 원본 강의 데이터 참조 ID
  type?: string;      // 전공/교양 구분
}

export interface Semester {
  id: string;
  name: string; // "1학년 1학기" 등
  userId: string;
  createdAt?: any;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export type AppView = 'timetable' | 'major' | 'chatbot' | 'board';

// 고정 학기 목록 상수
export const PREDEFINED_SEMESTERS = [
  "1학년 1학기", "1학년 2학기",
  "2학년 1학기", "2학년 2학기",
  "3학년 1학기", "3학년 2학기",
  "4학년 1학기", "4학년 2학기"
];