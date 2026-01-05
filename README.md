# Uni-Planner

백석대학교 학생을 위한 종합 학사 관리 시스템

![ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/d027ced5-3326-4577-bec2-da41dc3d6ffb)

## 프로젝트 개요

Uni-Planner는 백석대학교 학생들을 위한 웹 기반 학사 관리 플랫폼입니다. 시간표 관리, 수강신청, 전공 추천, AI 챗봇, 스터디 그룹 등 다양한 기능을 제공합니다.

## 주요 기능

### 1. 시간표 관리

- 학기별 시간표 생성 및 관리
- 강의 추가, 수정, 삭제
- 시간 충돌 자동 검사
- 사이버 강의 지원
- 시각적 시간표 표시 (월~금, 09:00~19:00)

### 2. 수강신청 시스템

- 강의 검색 및 조회
- 장바구니 기능
- 수강신청 완료 처리
- 실시간 시간표 반영
- 학점 자동 계산

### 3. 전공 추천 및 로드맵

- 전공별 권장 교과목 로드맵 제공
- 학년/학기별 과목 추천
- 로드맵 기반 일괄 과목 추가
- 전공별 커리큘럼 가이드

### 4. AI 챗봇

- 강의 정보 질의응답
- 강의평 조회
- OpenAI API 기반 자연어 처리
- 유사도 기반 답변 제공
- 카테고리별 강의 목록 제공

### 5. 스터디 그룹

- 과목별 스터디 방 생성
- 수강신청 완료된 과목만 스터디 방 생성 가능
- 같은 과목 수강생 간 실시간 채팅
- 참여자 목록 및 이름 표시
- 방장 권한 (방 삭제)
- 정원 설정 및 참여 관리

### 6. 학점 관리

- 현재 이수 학점 추적
- 졸업 필수 학점 대비 진행률 표시
- 학점 리포트 모달
- 시각적 진행률 표시

### 7. 프로필 관리

- 사용자 정보 수정
- 학번, 학과, 전공, 학년 등 관리
- 초기 학점 설정

### 8. 인증 시스템

- Firebase Authentication 기반 로그인/회원가입
- 사용자별 데이터 분리
- 세션 관리

## 프로젝트 구조

```
CapstoneProject/
├── components/              # React 컴포넌트
│   ├── Auth.tsx                    # 로그인/회원가입
│   ├── Timetable.tsx               # 시간표 관리
│   ├── CourseRegistration.tsx      # 수강신청
│   ├── MajorRecommender.tsx        # 전공 추천
│   ├── RoadmapGenerator.tsx        # 로드맵 생성기
│   ├── CourseChatbot.tsx           # AI 챗봇
│   ├── StudyBoard.tsx              # 스터디 방 목록
│   ├── StudyRoomModal.tsx          # 스터디 방 채팅
│   ├── CreditTracker.tsx           # 학점 추적
│   ├── ProfileEdit.tsx             # 프로필 편집
│   ├── CourseModal.tsx             # 강의 추가/수정 모달
│   ├── CourseSelectionModal.tsx    # 강의 선택 모달
│   ├── CreditReportModal.tsx       # 학점 리포트 모달
│   ├── SemesterListModal.tsx       # 학기 목록 모달
│   ├── SplashScreen.tsx            # 스플래시 화면
│   ├── Navbar.tsx                  # 하단 네비게이션
│   └── icons/                      # 아이콘 컴포넌트
├── services/                 # 서비스 레이어
│   ├── firebase.ts                 # Firebase 설정 및 초기화
│   ├── courseService.ts            # 강의 관련 서비스
│   └── geminiService.ts            # Gemini API 서비스
├── utils/                    # 유틸리티 함수
│   ├── auth.ts                     # 인증 유틸리티
│   ├── csvParser.ts                # CSV 파싱
│   ├── timeConflict.ts             # 시간 충돌 검사
│   └── timetableParser.ts          # 시간표 파싱
├── openai_api/              # 백엔드 API 서버
│   ├── app.py                      # Flask API 서버
│   ├── requirements.txt            # Python 패키지 의존성
│   ├── start_server.sh             # 서버 실행 스크립트
│   ├── course_q_label_1000.csv     # 강의 Q&A 데이터
│   └── 강의평 리뷰.csv             # 강의평 데이터
├── App.tsx                   # 메인 앱 컴포넌트
├── types.ts                  # TypeScript 타입 정의
├── constants.ts              # 상수 정의
├── roadmapData.ts            # 전공 로드맵 데이터
├── lecture_data.json         # 강의 데이터
├── package.json              # Node.js 의존성
└── vite.config.ts            # Vite 설정
```

## 데이터베이스 구조 (Firebase Firestore)

### 컬렉션 구조

```
users (컬렉션)
├── {userId} (문서)
│   ├── username: string
│   ├── studentId: string
│   ├── name: string
│   ├── department: string
│   ├── major: string
│   ├── grade: number
│   ├── initialCredits: number
│   └── ...

semesters (컬렉션)
├── {semesterId} (문서)
│   ├── userId: string
│   ├── name: string
│   └── createdAt: Timestamp

courses (컬렉션)
├── {courseId} (문서)
│   ├── userId: string
│   ├── semesterId: string
│   ├── name: string
│   ├── professor: string
│   ├── location: string
│   ├── day: string
│   ├── startTime: string
│   ├── endTime: string
│   ├── credits: number
│   ├── color: string
│   ├── lectureId: string (optional)
│   ├── registrationStatus: 'basket' | 'registered'
│   └── ...

lectures (컬렉션)
├── {lectureId} (문서)
│   ├── name: string
│   ├── professor: string
│   ├── room: string
│   ├── dept: string
│   ├── major: string
│   ├── type: string
│   ├── credit: number
│   ├── schedule: Array
│   └── ...

studyRooms (컬렉션)
├── {roomId} (문서)
│   ├── courseId: string
│   ├── courseName: string
│   ├── professor: string
│   ├── lectureId: string (optional)
│   ├── semesterId: string
│   ├── creatorId: string
│   ├── participants: Array<string>
│   ├── description: string
│   ├── capacity: number (optional)
│   ├── createdAt: Timestamp
│   └── messages (서브컬렉션)
│       └── {messageId} (문서)
│           ├── userId: string
│           ├── userName: string
│           ├── text: string
│           └── createdAt: Timestamp
```

## 설치 및 실행

### 필수 요구사항

- Node.js 18 이상
- Python 3.8 이상
- Firebase 프로젝트 설정

### 1. 프론트엔드 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드는 기본적으로 `http://localhost:5173`에서 실행됩니다.

### 2. 백엔드 API 서버 설정

```bash
cd openai_api

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# 서버 실행
python app.py
```

또는 실행 스크립트 사용:

```bash
cd openai_api
./start_server.sh
```

백엔드 서버는 `http://localhost:5000`에서 실행됩니다.

### 3. Firebase 설정

1. Firebase Console에서 프로젝트 생성
2. Firestore Database 생성 (테스트 모드 또는 보안 규칙 설정)
3. Authentication 활성화 (이메일/비밀번호)
4. `services/firebase.ts`에 Firebase 설정 정보 입력

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

### 4. 환경 변수 설정 (선택사항)

OpenAI API 키를 사용하려면 `openai_api/.env` 파일을 생성하세요:

```
OPENAI_API_KEY=your_openai_api_key_here
```

API 키가 없어도 유사도 기반으로 기본 답변을 제공합니다.

## 사용 방법

### 시간표 관리

1. 홈 탭에서 현재 학기 시간표 확인
2. 강의 추가 버튼으로 수동 강의 추가
3. 시간표에서 강의 클릭하여 수정/삭제
4. 학기 전환으로 다른 학기 시간표 확인

### 수강신청

1. 홈 탭에서 수강신청 버튼 클릭
2. 강의 검색 및 조회
3. 장바구니에 담기 또는 바로 신청
4. 수강신청 내역에서 확인 및 취소

### 전공 추천

1. 전공 탭에서 전공 선택
2. 로드맵 확인 및 권장 과목 선택
3. 일괄 추가로 시간표에 반영

### AI 챗봇

1. AI 채팅 탭 접속
2. 강의명 입력 또는 왼쪽 목록에서 선택
3. 질문 입력하여 강의 정보 및 강의평 조회

### 스터디 그룹

1. 스터디 탭 접속
2. 수강신청 완료된 과목으로 스터디 방 생성
3. 기존 스터디 방 참여 또는 채팅하기
4. 실시간 채팅으로 소통
5. 방장은 방 삭제 가능

### 학점 관리

1. 홈 탭 상단에서 현재 학점 확인
2. 학점 리포트 보기로 상세 정보 확인
3. 프로필에서 초기 학점 설정

## 기술 스택

### 프론트엔드

- React 19.2.0
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS (CDN)
- Firebase SDK 12.6.0

### 백엔드

- Python 3.8+
- Flask 3.0.0
- pandas 2.3.3
- scikit-learn 1.4.0
- OpenAI API (선택사항)

### 데이터베이스

- Firebase Firestore (실시간 데이터베이스)
- Firebase Authentication (인증)

## 주요 기능 상세

### 스터디 그룹 시스템

- 수강신청 완료된 과목만 스터디 방 생성 가능
- 같은 과목 수강생들만 참여 가능
- 실시간 채팅 기능 (Firestore 실시간 동기화)
- 참여자 이름 표시 (users 컬렉션에서 조회)
- 방장 권한 관리
- 정원 설정 및 모집 마감 처리

### 시간표 충돌 검사

- 강의 시간 자동 검증
- 중복 시간 강의 추가 방지
- 사이버 강의 별도 관리

### 학점 계산

- 수강신청 완료된 과목만 학점 반영
- 초기 학점 + 이수 학점 자동 합산
- 졸업 필수 학점 대비 진행률 표시

## 문제 해결

### 포트 충돌

- 포트 5000이 사용 중이면 macOS의 AirPlay Receiver를 비활성화하거나 다른 포트를 사용하세요.
- 포트 5173이 사용 중이면 `vite.config.ts`에서 포트를 변경하세요.

### API 연결 오류

- 백엔드 서버가 실행 중인지 확인하세요.
- 브라우저 콘솔에서 실제 요청 URL을 확인하세요.
- CORS 설정을 확인하세요.

### Firebase 연결 오류

- Firebase 설정 정보가 올바른지 확인하세요.
- Firestore 보안 규칙을 확인하세요.
- Authentication이 활성화되어 있는지 확인하세요.

### 스터디 방이 보이지 않음

- 수강신청이 완료된 과목인지 확인하세요.
- 다른 사용자가 만든 방은 같은 과목을 수강해야 보입니다.
- 브라우저 콘솔에서 에러 메시지를 확인하세요.

## 개발 참고사항

### 컴포넌트 구조

- 각 기능별로 독립적인 컴포넌트로 구성
- Service 레이어를 통한 데이터 접근
- Firebase 실시간 업데이트 활용

### 상태 관리

- React Hooks (useState, useEffect, useMemo, useCallback)
- Firebase 실시간 리스너 (onSnapshot)
- 로컬 상태와 서버 상태 분리

### 데이터 흐름

1. 사용자 액션
2. 컴포넌트에서 Service 호출
3. Service에서 Firebase/Firestore 접근
4. 실시간 업데이트로 UI 자동 반영
