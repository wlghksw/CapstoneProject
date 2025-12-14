import { DayOfWeek } from './types';

// 요일 설정 (기존 유지)
export const DAYS_OF_WEEK: DayOfWeek[] = [
  DayOfWeek.MON, 
  DayOfWeek.TUE, 
  DayOfWeek.WED, 
  DayOfWeek.THU, 
  DayOfWeek.FRI
];

// 시간 슬롯 설정: 09:00 ~ 18:00 (총 10개 슬롯)
// 수정 사항: 9:00 -> 09:00 (앞에 0을 채워서 시간 포맷 통일)
export const TIME_SLOTS: string[] = Array.from({ length: 10 }, (_, i) => {
  const hour = i + 9;
  return `${hour < 10 ? '0' : ''}${hour}:00`; 
});

// 과목 색상 (사용자 지정 디자인 유지)
export const COURSE_COLORS: string[] = [
  'bg-red-200 border-red-300 text-red-800',
  'bg-blue-200 border-blue-300 text-blue-800',
  'bg-green-200 border-green-300 text-green-800',
  'bg-yellow-200 border-yellow-300 text-yellow-800',
  'bg-purple-200 border-purple-300 text-purple-800',
  'bg-pink-200 border-pink-300 text-pink-800',
  'bg-indigo-200 border-indigo-300 text-indigo-800',
  'bg-teal-200 border-teal-300 text-teal-800',
];