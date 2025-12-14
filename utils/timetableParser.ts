import { DayOfWeek, Course } from '../types';

// 파싱된 시간표 정보 인터페이스
interface ScheduleInfo {
  day: DayOfWeek | null;
  startTime: string;
  endTime: string;
  location: string | null;
}

// 교시별 시작 및 종료 시간 정의 (1시간 단위)
const timeSlots: { [key: string]: { start: string; end: string } } = {
  '1': { start: '09:00', end: '10:00' },
  '2': { start: '10:00', end: '11:00' },
  '3': { start: '11:00', end: '12:00' },
  '4': { start: '12:00', end: '13:00' },
  '5': { start: '13:00', end: '14:00' },
  '6': { start: '14:00', end: '15:00' },
  '7': { start: '15:00', end: '16:00' },
  '8': { start: '16:00', end: '17:00' },
  '9': { start: '17:00', end: '18:00' },
  '10': { start: '18:00', end: '19:00' },
  '11': { start: '19:00', end: '20:00' },
  '12': { start: '20:00', end: '21:00' },
};

/**
 * 시간표 문자열을 파싱하여 요일, 시작/종료 시간, 장소를 추출합니다.
 * @param timetable - "본부516 : 목2,3" 또는 "본부516 : 목2" 형식의 시간표 문자열
 * @param hours - 강의 시간 (우선순위 높음)
 * @returns {ScheduleInfo | null} 파싱된 시간표 정보 또는 null
 */
export const parseSchedule = (timetable: string, hours?: number): ScheduleInfo | null => {
  // 사이버 강의, 비대면 또는 정보 없는 경우
  if (!timetable || ['사', '비대면', ''].includes(timetable.trim())) {
    return { day: null, startTime: '', endTime: '', location: timetable.trim() };
  }

  // "본부516 : 목2" 또는 "본부516:목2,3" 또는 "목2,3" 형식 파싱
  const regex = /(?:(.+?)\s*:\s*)?([월화수목금토일])([\d,]+)/;
  const match = timetable.match(regex);

  if (match) {
    const location = match[1] ? match[1].trim() : null;
    const day = match[2] as DayOfWeek;
    const periods = match[3].split(',').map(p => p.trim());

    if (periods.length > 0) {
      const startPeriod = periods[0];
      const startTime = timeSlots[startPeriod]?.start;
      let endTime;

      // `hours`가 제공되면 우선적으로 사용
      if (hours && hours > 0 && startTime) {
        const startHour = parseInt(startTime.split(':')[0], 10);
        const endHour = startHour + hours;
        endTime = `${String(endHour).padStart(2, '0')}:00`;
      } else {
        // `hours`가 없으면 기존 방식대로 마지막 교시로 종료시간 계산
        const endPeriod = periods[periods.length - 1];
        endTime = timeSlots[endPeriod]?.end;
      }

      if (startTime && endTime) {
        return { day, startTime, endTime, location };
      }
    }
  }
  
  // 정규식에 맞지 않는 경우 (e.g., "목4,5")
  const simpleRegex = /([월화수목금토일])([\d,]+)/;
  const simpleMatch = timetable.match(simpleRegex);
  if(simpleMatch) {
    const day = simpleMatch[1] as DayOfWeek;
    const periods = simpleMatch[2].split(',').map(p => p.trim());
    if (periods.length > 0) {
      const startPeriod = periods[0];
      const startTime = timeSlots[startPeriod]?.start;
      let endTime;

      if (hours && hours > 0 && startTime) {
        const startHour = parseInt(startTime.split(':')[0], 10);
        const endHour = startHour + hours;
        endTime = `${String(endHour).padStart(2, '0')}:00`;
      } else {
        const endPeriod = periods[periods.length - 1];
        endTime = timeSlots[endPeriod]?.end;
      }

      if (startTime && endTime) {
        return { day, startTime, endTime, location: null };
      }
    }
  }

  console.warn(`시간표 형식을 파싱할 수 없습니다: "${timetable}"`);
  return null;
};

/**
 * "화1,2"와 같은 시간표 문자열을 파싱하여 여러 개의 ScheduleInfo 객체로 변환합니다.
 * @param timetable - "본부511:화2" 또는 "공A502:월1,2/본부511:화2" 형식의 시간표 문자열
 * @param hours - 강의 시간
 * @returns {ScheduleInfo[]} 파싱된 시간표 정보 배열
 */
export const parseMultipleSchedules = (timetable: string, hours?: number): ScheduleInfo[] => {
  if (!timetable || ['사', '비대면', ''].includes(timetable.trim())) {
    return [{ day: null, startTime: '', endTime: '', location: timetable.trim() }];
  }

  // "공A502:월1,2/본부511:화2"와 같이 '/'로 구분된 여러 시간표 처리
  const parts = timetable.split('/');
  const schedules: ScheduleInfo[] = [];

  parts.forEach(part => {
    // hours를 parseSchedule로 전달
    const schedule = parseSchedule(part.trim(), hours);
    if (schedule) {
      schedules.push(schedule);
    }
  });

  return schedules;
};
