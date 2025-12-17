## 프로젝트 구조

```
├── App.tsx # 메인 애플리케이션 컴포넌트
├── components # UI 컴포넌트
│ ├── Auth.tsx # 인증 관련 컴포넌트
│ ├── Board.tsx # 게시판 컴포넌트
│ ├── CourseChatbot.tsx # 과목 챗봇 컴포넌트
│ ├── CourseModal.tsx # 과목 정보 모달
│ ├── CourseSelectionModal.tsx # 과목 선택 모달
│ ├── CreditReportModal.tsx # 학점 보고서 모달
│ ├── CreditTracker.tsx # 학점 추적기
│ ├── LiberalArtsRecommender.tsx # 교양 추천 컴포넌트
│ ├── MajorRecommender.tsx # 전공 추천 컴포넌트
│ ├── Navbar.tsx # 네비게이션 바
│ ├── NoteTaker.tsx # 노트 필기 컴포넌트
│ ├── RoadmapGenerator.tsx # 로드맵 생성기
│ ├── SemesterListModal.tsx # 학기 목록 모달
│ ├── SplashScreen.tsx # 스플래시 화면
│ ├── Timetable.tsx # 시간표 컴포넌트
│ └── icons # 아이콘 컴포넌트
├── constants.ts # 상수
├── index.html # HTML 진입점
├── index.tsx # React 진입점
├── package.json # 프로젝트 의존성 및 스크립트
├── roadmapData.ts # 로드맵 데이터
├── services # 외부 서비스 연동
│ ├── firebase.ts # Firebase 설정
│ └── geminiService.ts # Gemini API 서비스
├── tsconfig.json # TypeScript 설정
├── types.ts # 전역 타입 정의
├── utils # 유틸리티 함수
│ ├── timeConflict.ts # 시간 충돌 확인 유틸리티
│ └── timetableParser.ts # 시간표 파싱 유틸리티
└── vite.config.ts # Vite 설정
```
