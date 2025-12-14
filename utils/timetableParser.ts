import { DayOfWeek } from '../types';

// 파싱된 시간표 정보 인터페이스
interface ScheduleInfo {
  day: DayOfWeek | string | null; // DayOfWeek enum 또는 string 허용
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
 */
export const parseSchedule = (timetable: string, hours?: number): ScheduleInfo | null => {
  // 1. [추가됨] 예외 케이스 처리 (nan, null, 빈 문자열)
  if (!timetable || timetable === 'nan' || timetable.trim() === '') {
    return { day: null, startTime: '', endTime: '', location: '시간 미지정' };
  }

  // 2. [추가됨] '별도' 일정 처리
  if (timetable.includes('별도')) {
    return { day: null, startTime: '', endTime: '', location: '별도 일정' };
  }

  // 3. 사이버 강의 처리
  if (['사', '비대면'].includes(timetable.trim())) {
    return { day: null, startTime: '', endTime: '', location: '사이버 강의' };
  }

  try {
    // 4. "본부516 : 목2,3" 또는 "본부516:목2,3" 또는 "목2,3" 형식 파싱
    // 정규식 설명: (장소 : )? (요일) (숫자와 쉼표)
    const regex = /(?:(.+?)\s*:\s*)?([월화수목금토일])([\d,]+)/;
    const match = timetable.match(regex);

    if (match) {
      const location = match[1] ? match[1].trim() : null;
      const day = match[2] as DayOfWeek; // 또는 string
      const periods = match[3].split(',').map(p => p.trim());

      if (periods.length > 0) {
        // 시작 시간 계산
        const startPeriod = periods[0];
        const startSlot = timeSlots[startPeriod];
        const startTime = startSlot ? startSlot.start : '09:00'; // 기본값 안전장치

        let endTime;

        // `hours`가 제공되면 우선적으로 사용 (정확도 높음)
        if (hours && hours > 0) {
          const startHour = parseInt(startTime.split(':')[0], 10);
          const endHour = startHour + hours;
          // 09:00 포맷 유지
          endTime = `${endHour < 10 ? '0' : ''}${endHour}:00`;
        } else {
          // `hours`가 없으면 마지막 교시로 종료시간 계산
          const endPeriod = periods[periods.length - 1];
          const endSlot = timeSlots[endPeriod];
          endTime = endSlot ? endSlot.end : '10:00';
        }

        return { day, startTime, endTime, location };
      }
    }
    
    // 5. 정규식 매칭 실패 시 (형식이 다른 경우)
    // 에러를 내지 않고 원본 텍스트를 location에 담아 반환
    return {
        day: null, 
        startTime: '', 
        endTime: '', 
        location: timetable // "중강당" 같은 경우 장소로 표시됨
    };

  } catch (error) {
    console.warn(`파싱 오류 발생: "${timetable}"`, error);
    // 오류 발생 시에도 앱이 멈추지 않도록 안전값 반환
    return { day: null, startTime: '', endTime: '', location: '시간 정보 오류' };
  }
};

/**
 * 여러 개의 시간표가 '/'로 구분된 경우 처리
 */
export const parseMultipleSchedules = (timetable: string, hours?: number): ScheduleInfo[] => {
  // 예외 처리
  if (!timetable || timetable === 'nan') return [];

  const parts = timetable.split('/');
  const schedules: ScheduleInfo[] = [];

  parts.forEach(part => {
    const schedule = parseSchedule(part.trim(), hours);
    // null이 아니고, 의미 있는 데이터일 때만 추가
    if (schedule) {
      schedules.push(schedule);
    }
  });

  return schedules;
};

