// 전공별 학년별 로드맵 데이터

export type Major = '소프트웨어학전공' | '정보보호학전공' | '멀티미디어학전공' | '인공지능학전공';

export interface RoadmapCourse {
  name: string; // 교과목명
  year: number; // 학년
  semester: 1 | 2; // 학기
  credits?: number; // 학점 (선택사항)
}

export interface MajorRoadmap {
  major: Major;
  courses: RoadmapCourse[];
}

export const ROADMAPS: MajorRoadmap[] = [
  {
    major: '소프트웨어학전공',
    courses: [
      // 1학년 1학기
      { name: '이산수학', year: 1, semester: 1 },
      { name: 'C언어프로그래밍', year: 1, semester: 1 },
      { name: '파이썬 프로그래밍', year: 1, semester: 1 },
      // 1학년 2학기
      { name: '파이썬응용', year: 1, semester: 2 },
      { name: 'C++프로그래밍', year: 1, semester: 2 },
      // 2학년 1학기
      { name: 'JAVA프로그래밍', year: 2, semester: 1 },
      { name: '자료구조론', year: 2, semester: 1 },
      { name: '운영체제론', year: 2, semester: 1 },
      { name: '유닉스시스템', year: 2, semester: 1 },
      { name: '컴퓨터구조론', year: 2, semester: 1 },
      // 2학년 2학기
      { name: '소프트웨어공학', year: 2, semester: 2 },
      { name: '웹프로그래밍', year: 2, semester: 2 },
      { name: 'UI/UX디자인', year: 2, semester: 2 },
      { name: '알고리즘 및 실습', year: 2, semester: 2 },
      // 3학년 1학기
      { name: '웹응용프로그래밍', year: 3, semester: 1 },
      { name: '데이터베이스이론 및 실습', year: 3, semester: 1 },
      { name: '인공지능', year: 3, semester: 1 },
      { name: '컴퓨터네트워크', year: 3, semester: 1 },
      // 3학년 2학기
      { name: '유닉스프로그래밍', year: 3, semester: 2 },
      { name: 'JSP와서블릿', year: 3, semester: 2 },
      { name: '스마트폰프로그래밍', year: 3, semester: 2 },
      { name: '빅데이터', year: 3, semester: 2 },
      // 4학년 1학기
      { name: '크로스플랫폼앱프로그래밍', year: 4, semester: 1 },
      { name: '객체지향모델링', year: 4, semester: 1 },
      { name: 'JAVA 응용 프로그래밍', year: 4, semester: 1 },
      // 4학년 2학기
      { name: '캡스톤디자인', year: 4, semester: 2 },
    ],
  },
  {
    major: '정보보호학전공',
    courses: [
      // 기초교과군
      { name: 'C언어프로그래밍', year: 1, semester: 1 },
      { name: '파이썬 프로그래밍', year: 1, semester: 1 },
      { name: '이산수학', year: 1, semester: 1 },
      // 핵심교과군 (2-3학년 권장)
      { name: 'JAVA프로그래밍', year: 2, semester: 1 },
      { name: '자료구조론', year: 2, semester: 1 },
      { name: '운영체제론', year: 2, semester: 1 },
      { name: '유닉스시스템', year: 2, semester: 1 },
      { name: '정보보호개론', year: 2, semester: 2 },
      { name: '정보보안법규', year: 2, semester: 2 },
      // 심화·응용군 (3-4학년 권장)
      { name: '전자상거래보안 이론 및 실습', year: 3, semester: 1 },
      { name: '데이터베이스이론 및 실습', year: 3, semester: 1 },
      { name: 'iOS프로그래밍', year: 3, semester: 1 },
      { name: '침해사고 대응 개론', year: 3, semester: 2 },
      { name: '정보보호관리체계', year: 4, semester: 1 },
      { name: '웹서버구축', year: 4, semester: 1 },
      { name: '파이썬응용프로그래밍', year: 4, semester: 1 },
      { name: '악성코드 분석', year: 4, semester: 2 },
      { name: '캡스톤디자인', year: 4, semester: 2 },
    ],
  },
  {
    major: '멀티미디어학전공',
    courses: [
      // 1학년 1학기
      { name: '파이썬 프로그래밍', year: 1, semester: 1 },
      { name: '이산수학', year: 1, semester: 1 },
      { name: 'C언어프로그래밍', year: 1, semester: 1 },
      // 1학년 2학기
      { name: '파이썬응용', year: 1, semester: 2 },
      { name: 'C++프로그래밍', year: 1, semester: 2 },
      // 2학년 1학기
      { name: 'JAVA프로그래밍', year: 2, semester: 1 },
      { name: '유닉스시스템', year: 2, semester: 1 },
      // 2학년 2학기
      { name: '알고리즘 및 실습', year: 2, semester: 2 },
      { name: '데이터베이스이론 및 실습', year: 2, semester: 2 },
      // 3학년 1학기
      { name: '디지털영상처리', year: 3, semester: 1 },
      // 3학년 2학기
      { name: 'OpenCV프로그래밍', year: 3, semester: 2 },
      // 4학년 1학기
      { name: '3D게임프로그래밍', year: 4, semester: 1 },
      // 4학년 2학기
      { name: '캡스톤디자인', year: 4, semester: 2 },
    ],
  },
  {
    major: '인공지능학전공',
    courses: [
      // 1학년
      { name: '파이썬 프로그래밍', year: 1, semester: 1 },
      { name: 'C언어프로그래밍', year: 1, semester: 1 },
      { name: '이산수학', year: 1, semester: 1 },
      // 2학년
      { name: '파이썬응용', year: 2, semester: 1 },
      { name: 'C++프로그래밍', year: 2, semester: 1 },
      { name: '컴퓨터구조론', year: 2, semester: 1 },
      { name: '자료구조론', year: 2, semester: 2 },
      { name: 'JAVA프로그래밍', year: 2, semester: 2 },
      { name: '웹프로그래밍', year: 2, semester: 2 },
      // 3학년
      { name: '운영체제론', year: 3, semester: 1 },
      { name: '알고리즘 및 실습', year: 3, semester: 1 },
      { name: '유닉스시스템', year: 3, semester: 1 },
      { name: '인공지능', year: 3, semester: 1 },
      { name: 'IoT응용제어', year: 3, semester: 2 },
      // 4학년
      { name: '드론제어 및 실습', year: 4, semester: 1 },
      { name: '빅데이터', year: 4, semester: 1 },
      { name: '창의기초프로젝트', year: 4, semester: 1 },
      { name: '캡스톤디자인', year: 4, semester: 2 },
    ],
  },
];











