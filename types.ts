
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
