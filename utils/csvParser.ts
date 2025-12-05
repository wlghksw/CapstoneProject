// CSV 파일 파싱 및 강좌 매칭 유틸리티

import { DayOfWeek } from '../types';

export interface CSVCourse {
  교과목명: string;
  교수명: string;
  시간표: string;
  학점: string;
  강의실?: string;
}

/**
 * CSV 시간표 문자열을 파싱하여 요일과 시간 정보 추출
 * 예: "본부516 : 목2,3/ 사" -> { day: '목', startTime: '10:00', endTime: '12:00', location: '본부516' }
 */
export function parseSchedule(scheduleStr: string): {
  day: DayOfWeek | null;
  startTime: string;
  endTime: string;
  location: string;
} | null {
  if (!scheduleStr || scheduleStr.trim() === '') {
    return null;
  }

  // 강의실 추출 (예: "본부516 : 목2,3/ 사")
  const locationMatch = scheduleStr.match(/^([^:]+)\s*:/);
  const location = locationMatch ? locationMatch[1].trim() : '';

  // 요일 추출 (월, 화, 수, 목, 금)
  const dayMatch = scheduleStr.match(/(월|화|수|목|금)/);
  if (!dayMatch) {
    return null;
  }
  const day = dayMatch[1] as DayOfWeek;

  // 시간 추출 (예: "2,3" -> 2교시, 3교시)
  const timeMatch = scheduleStr.match(/(\d+),(\d+)/);
  if (!timeMatch) {
    // 단일 교시인 경우 (예: "2")
    const singleTimeMatch = scheduleStr.match(/(\d+)/);
    if (singleTimeMatch) {
      const period = parseInt(singleTimeMatch[1]);
      const startTime = periodToTime(period);
      const endTime = periodToTime(period + 1);
      return { day, startTime, endTime, location };
    }
    return null;
  }

  const startPeriod = parseInt(timeMatch[1]);
  const endPeriod = parseInt(timeMatch[2]);
  
  const startTime = periodToTime(startPeriod);
  const endTime = periodToTime(endPeriod + 1); // 마지막 교시의 끝 시간

  return { day, startTime, endTime, location };
}

/**
 * 교시를 시간으로 변환
 * 1교시: 09:00, 2교시: 10:00, ... 9교시: 17:00
 */
function periodToTime(period: number): string {
  const hour = 8 + period; // 1교시 = 9시
  return `${hour.toString().padStart(2, '0')}:00`;
}

/**
 * CSV 파일 내용을 파싱하여 Course 배열로 변환
 */
export function parseCSV(csvContent: string): CSVCourse[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  // 헤더 제거
  const dataLines = lines.slice(1);
  
  const courses: CSVCourse[] = [];
  
  for (const line of dataLines) {
    // CSV 파싱 (쉼표로 구분, 따옴표 처리)
    const columns = parseCSVLine(line);
    
    if (columns.length >= 11) {
      courses.push({
        교과목명: columns[6]?.trim() || '',
        교수명: columns[9]?.trim() || '',
        시간표: columns[10]?.trim() || '',
        학점: columns[7]?.trim() || '3',
        강의실: columns[10]?.trim() || '',
      });
    }
  }
  
  return courses;
}

/**
 * CSV 라인을 올바르게 파싱 (쉼표와 따옴표 처리)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

/**
 * 교과목명으로 CSV에서 강좌 찾기 (첫 번째 매칭만 반환)
 */
export function findCourseInCSV(courseName: string, csvCourses: CSVCourse[]): CSVCourse | null {
  // 정확한 매칭 시도
  let found = csvCourses.find(c => c.교과목명 === courseName);
  if (found) return found;
  
  // 부분 매칭 시도 (공백 제거, 대소문자 무시)
  const normalizedName = courseName.replace(/\s+/g, '').toLowerCase();
  found = csvCourses.find(c => 
    c.교과목명.replace(/\s+/g, '').toLowerCase().includes(normalizedName) ||
    normalizedName.includes(c.교과목명.replace(/\s+/g, '').toLowerCase())
  );
  
  return found || null;
}

/**
 * 교과목명으로 CSV에서 모든 강좌 찾기 (같은 과목의 다른 시간대 포함)
 */
export function findAllCoursesInCSV(courseName: string, csvCourses: CSVCourse[]): CSVCourse[] {
  const results: CSVCourse[] = [];
  
  // 정확한 매칭
  csvCourses.forEach(c => {
    if (c.교과목명 === courseName) {
      results.push(c);
    }
  });
  
  if (results.length > 0) return results;
  
  // 부분 매칭 시도 (공백 제거, 대소문자 무시)
  const normalizedName = courseName.replace(/\s+/g, '').toLowerCase();
  csvCourses.forEach(c => {
    const normalizedCourseName = c.교과목명.replace(/\s+/g, '').toLowerCase();
    if (
      normalizedCourseName.includes(normalizedName) ||
      normalizedName.includes(normalizedCourseName)
    ) {
      results.push(c);
    }
  });
  
  return results;
}

