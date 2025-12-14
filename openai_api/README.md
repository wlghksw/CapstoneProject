# OpenAI API 챗봇 서버

백석대학교 과목 정보/추천 챗봇을 위한 Flask API 서버입니다.

## 설치 방법

1. Python 가상환경 생성 (권장):

```bash
cd openai_api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. 필요한 패키지 설치:

```bash
pip install -r requirements.txt
```

3. 환경 변수 설정:
   - `openai_api` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가하세요:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
   - OpenAI API 키가 없어도 기본 답변은 제공됩니다 (유사도가 높은 경우).

## 실행 방법

1. 서버 시작:

```bash
python app.py
```

서버가 `http://localhost:5000`에서 실행됩니다.

2. 프론트엔드 실행:

   - 다른 터미널에서 프로젝트 루트로 이동:

   ```bash
   cd ..
   npm install
   npm run dev
   ```

3. 브라우저에서 `http://localhost:3000` 접속 후 챗봇 탭을 클릭하세요.

## API 엔드포인트

### POST /chat

챗봇에 질문을 보냅니다.

**Request:**

```json
{
  "question": "천문학과 우주의 이해 중간고사 있어?"
}
```

**Response:**

```json
{
  "answer": "중간고사는 따로 없고 기말시험만 한 번 봐요..."
}
```

### GET /health

서버 상태 확인용 엔드포인트입니다.

## 데이터 파일

- `course_q_label_1000.csv`: 강의 Q&A 데이터
- `강의평 리뷰.csv`: 강의평 데이터 (선택사항)

## 주의사항

- OpenAI API 키가 설정되지 않으면 유사도가 높은 경우(0.8 이상)에만 직접 답변을 제공합니다.
- OpenAI API 키가 설정되면 유사도가 낮은 경우에도 AI가 답변을 생성합니다.
