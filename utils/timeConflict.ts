// 시간 중복 체크 유틸리티

import { Course, DayOfWeek } from '../types';

/**
 * 두 시간대가 겹치는지 확인
 */
export function isTimeOverlapping(
  day1: DayOfWeek,
  startTime1: string,
  endTime1: string,
  day2: DayOfWeek,
  startTime2: string,
  endTime2: string
): boolean {
  // 다른 요일이면 겹치지 않음
  if (day1 !== day2) return false;

  // 시간을 분으로 변환
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1 = timeToMinutes(startTime1);
  const end1 = timeToMinutes(endTime1);
  const start2 = timeToMinutes(startTime2);
  const end2 = timeToMinutes(endTime2);

  // 시간대가 겹치는지 확인
  return !(end1 <= start2 || end2 <= start1);
}

/**
 * 새 강의가 기존 강의들과 시간이 겹치는지 확인
 */
export function checkTimeConflict(
  newCourse: { day: DayOfWeek; startTime: string; endTime: string },
  existingCourses: Course[]
): { hasConflict: boolean; conflictingCourses: Course[] } {
  const conflictingCourses: Course[] = [];

  for (const existingCourse of existingCourses) {
    if (
      isTimeOverlapping(
        newCourse.day,
        newCourse.startTime,
        newCourse.endTime,
        existingCourse.day,
        existingCourse.startTime,
        existingCourse.endTime
      )
    ) {
      conflictingCourses.push(existingCourse);
    }
  }

  return {
    hasConflict: conflictingCourses.length > 0,
    conflictingCourses,
  };
}











