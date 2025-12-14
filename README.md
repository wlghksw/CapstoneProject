# Uni-Planner

백석대학교 학생을 위한 시간표 관리 및 AI 챗봇 서비스

## 주요 기능

- 📅 **시간표 관리**: 학기별 강의 추가/수정/삭제
- 🎓 **전공 추천**: 전공별 로드맵 및 권장 교과목 추천
- 🤖 **AI 챗봇**: 강의 정보 및 강의평 조회 (OpenAI API 기반)

## 프로젝트 구조

```
CapstoneProject-CJH/
├── components/          # React 컴포넌트
│   ├── CourseChatbot.tsx    # AI 챗봇 컴포넌트
│   ├── Timetable.tsx         # 시간표 컴포넌트
│   ├── MajorRecommender.tsx  # 전공 추천 컴포넌트
│   └── icons/                # 아이콘 컴포넌트
├── openai_api/         # 백엔드 API 서버
│   ├── app.py               # Flask API 서버
│   ├── requirements.txt     # Python 패키지 의존성
│   ├── start_server.sh      # 서버 실행 스크립트
│   └── *.csv                # 강의 데이터 파일
├── utils/              # 유틸리티 함수
│   ├── auth.ts              # 인증 관련
│   ├── csvParser.ts         # CSV 파싱
│   └── timeConflict.ts     # 시간 충돌 체크
├── App.tsx             # 메인 앱 컴포넌트
├── types.ts            # TypeScript 타입 정의
├── constants.ts        # 상수 정의
├── roadmapData.ts      # 전공 로드맵 데이터
└── package.json        # Node.js 의존성

```

## 설치 및 실행

### 1. 프론트엔드 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 2. 백엔드 API 서버 설정

```bash
cd openai_api

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org --no-cache-dir -r requirements.txt

# 서버 실행
python app.py
```

또는 실행 스크립트 사용:

```bash
cd openai_api
./start_server.sh
```

백엔드 서버는 `http://localhost:5000`에서 실행됩니다.

### 3. 환경 변수 설정 (선택사항)

OpenAI API 키를 사용하려면 `openai_api/.env` 파일을 생성하세요:

```
OPENAI_API_KEY=your_openai_api_key_here
```

API 키가 없어도 유사도 기반으로 기본 답변을 제공합니다.

## 사용 방법

1. **시간표 관리**: 홈 탭에서 강의를 추가하고 시간표를 관리합니다.
2. **전공 추천**: 전공 탭에서 전공별 로드맵을 확인하고 권장 교과목을 시간표에 추가합니다.
3. **AI 챗봇**: AI 채팅 탭에서 강의에 대한 질문을 하거나 왼쪽 목록에서 강의를 선택하여 정보를 조회합니다.

## 기술 스택

### 프론트엔드

- React 19.2.0
- TypeScript
- Vite
- Tailwind CSS (CDN)

### 백엔드

- Python 3.14
- Flask
- pandas
- scikit-learn
- OpenAI API (선택사항)

## 주요 파일 설명

- `App.tsx`: 메인 앱 컴포넌트, 라우팅 및 상태 관리
- `components/CourseChatbot.tsx`: AI 챗봇 인터페이스 및 API 통신
- `openai_api/app.py`: Flask API 서버, 챗봇 로직 및 데이터 처리
- `utils/timeConflict.ts`: 시간표 시간 충돌 검사 유틸리티
- `roadmapData.ts`: 전공별 로드맵 데이터

## 문제 해결

### 포트 충돌

- 포트 5000이 사용 중이면 macOS의 AirPlay Receiver를 비활성화하거나 다른 포트를 사용하세요.
- 포트 3000이 사용 중이면 `vite.config.ts`에서 포트를 변경하세요.

### API 연결 오류

- 백엔드 서버가 실행 중인지 확인하세요.
- 브라우저 콘솔에서 실제 요청 URL을 확인하세요.

## 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다.
