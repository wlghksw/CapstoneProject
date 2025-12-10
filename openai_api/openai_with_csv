import os
import sys
from dotenv import load_dotenv
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from openai import OpenAI
import textwrap

# ---------- 설정 ----------
CSV_PATH = os.path.join(os.path.dirname(__file__), "course_q_label_1000.csv")
TFIDF_THRESHOLD = 0.60   
TOP_K_CONTEXT = 3        # OpenAI에 보낼 유사 Q/A 개수
MODEL_NAME = "gpt-4o-mini" 
# --------------------------

def die(msg):
    print("ERROR:", msg)
    sys.exit(1)

# .env 불러오기
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")

# openai 클라이언트
try:
    client = OpenAI(api_key=API_KEY)
except Exception as e:
    die(f"OpenAI 클라이언트 초기화 실패: {e}")

# CSV 로드
if not os.path.exists(CSV_PATH):
    die(f"CSV 파일을 찾을 수 없습니다: {CSV_PATH}")

df = pd.read_csv(CSV_PATH)
if 'Q' not in df.columns or 'A' not in df.columns:
    die("CSV에 'Q'와 'A' 컬럼이 있어야 합니다.")

texts = df['Q'].astype(str).tolist()
answers = df['A'].astype(str).tolist()

vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(texts)

def find_similar(query, top_k=5):
    q_vec = vectorizer.transform([query])
    sims = cosine_similarity(q_vec, tfidf_matrix)[0]
   
    idxs = sims.argsort()[::-1][:top_k]
    return [(int(i), float(sims[i]), texts[i], answers[i]) for i in idxs]

def ask_openai_with_context(user_question, context_qas):
    """
    context_qas: list of tuples (Q, A, score)
    """
    system = (
        "너는 대학 수업 추천/설명 도우미야. 사용자가 물어보는 질문에 대해 "
        "친절하고 간결하게 답변해줘. 가능하면 실행 가능한 팁(예: 수업 유형, 팀 프로젝트 여부, 평가 방식 등)을 제공해라."
    )

    context_blocks = []
    for i, (q, a, score) in enumerate(context_qas, start=1):
        block = f"[{i}] Q: {q}\nA: {a}\n(sim={score:.3f})"
        context_blocks.append(block)
    context_text = "\n\n".join(context_blocks) if context_blocks else "관련 예시 없음."

    user_prompt = textwrap.dedent(f"""
    사용자의 질문:
    {user_question}

    아래는 데이터베이스에서 찾은 유사한 Q/A 목록입니다. (필요할 때만 참고하세요)
    {context_text}

    요구사항:
    1. 먼저 사용자의 질문을 가장 우선해서 정확히 이해한 뒤 답변하세요.
    2. 참조 자료(context)가 실제로 도움이 되면 활용하고, 부족하거나 무관하면 무시해도 됩니다.
    3. 참조가 부족하거나 질문에 직접 답하기 어려우면:
        - 부족한 이유를 짧게 설명하고
        - 사용자가 확인할 추가 정보 또는 선택지를 제안하세요.
    4. 친절하면서도 실용적이고 명확한 답변을 제공합니다.
    """).strip()


    try:
        resp = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.6,
            max_tokens=600
        )
        return resp.choices[0].message.content
    except Exception as e:
        return f"(OpenAI 호출 오류) {e}"

def interactive_loop():
    print("CSV 기반 Q/A + OpenAI 보조. 종료하려면 q 또는 quit 입력.")
    while True:
        try:
            q = input("\n질문> ").strip()
        except KeyboardInterrupt:
            print("\n종료 (Ctrl-C).")
            break
        if not q:
            continue
        if q.lower() in ('q', 'quit', 'exit'):
            print("종료합니다.")
            break

        sims = find_similar(q, top_k=TOP_K_CONTEXT)
        best_idx, best_score, best_q, best_a = sims[0]
        
        print(f"\n[로컬 검색] top {TOP_K_CONTEXT} 유사 항목:")
        for i, (idx, score, tq, ta) in enumerate(sims, start=1):
            print(f" {i}. (idx={idx}, sim={score:.3f}) Q: {tq}")

        
        if best_score >= TFIDF_THRESHOLD and best_a.strip():
            print(f"답변(A):\n{best_a}\n")

            # 여전히 추가 설명을 원하면 OpenAI에 물을 수 있게 묻기
            cont = input("더 자세한 설명이 필요하면 더 알려줘 라고 해줘: ").strip().lower()

            if ("알려" in cont) or ("더" in cont and "줘" in cont):
            # 상세 요청으로 처리
                context_for_openai = [(s[2], s[3], s[1]) for s in sims]
                print("\n[생각중입니다 잠시만 기다려주세용...]\n")
                print(ask_openai_with_context(q, context_for_openai))
                continue

        # 3) 로컬에 충분히 비슷한 게 없으면 OpenAI에 context와 함께 요청
        context_for_openai = [(s[2], s[3], s[1]) for s in sims]
        print("\n[OpenAI에게 질문 중 — 로컬에 충분한 답이 없음]\n")
        ai_ans = ask_openai_with_context(q, context_for_openai)
        print(ai_ans)

if __name__ == "__main__":
    print("초기화 완료. CSV 파일에서 TF-IDF 인덱스 생성됨.")
    interactive_loop()
