export enum DayOfWeek {
  MON = '월',
  TUE = '화',
  WED = '수',
  THU = '목',
  FRI = '금',
  SAT = '토',
  SUN = '일',
}

export interface Course {
  id: string;
  name: string;
  professor: string;
  location: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  credits: number;
  color: string;
  semesterId: string;
  userId: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

export type AppView = 'timetable' | 'major' | 'chatbot' | 'board';

export interface Lecture {
  id: string;
  No: number;
  track: string;
  faculty: string;
  major: string;
  code: number;
  class_no: number;
  course_name: string;
  credits: number;
  hours: number;
  professor: string;
  timetable: string;
}