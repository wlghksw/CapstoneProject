import os
import textwrap
import pandas as pd

from dotenv import load_dotenv
from openai import OpenAI
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------- 설정 ----------
BASE_DIR = os.path.dirname(__file__)
COURSE_QA_PATH = os.path.join(BASE_DIR, "course_q_label_1000.csv")
REVIEW_PATH = os.path.join(BASE_DIR, "강의평 리뷰.csv")

TOP_K_CONTEXT = 3
MODEL_NAME = "gpt-4o-mini"
# --------------------------

def load_course_qa(path):
    df = pd.read_csv(path)
    df["Q"] = df["Q"].fillna("").astype(str)
    df["A"] = df["A"].fillna("").astype(str)
    df["label"] = df["label"].fillna("").astype(str)
    return df

def load_reviews_as_qa(path, max_reviews_per_course=12):
    rdf = pd.read_csv(path)

    rdf["리뷰내용"] = rdf["리뷰내용"].fillna("").astype(str)
    rdf["과목명"] = rdf["과목명"].fillna("").astype(str)
    rdf["교수명"] = rdf["교수명"].fillna("").astype(str)
    rdf["과목코드"] = rdf["과목코드"].fillna("").astype(str)

    key_cols = ["과목코드", "과목명", "교수명"]
    grouped = rdf.groupby(key_cols, dropna=False)

    rows = []
    for (code, cname, prof), g in grouped:
        reviews = [t.strip() for t in g["리뷰내용"].tolist() if t.strip()]
        reviews = reviews[:max_reviews_per_course]
        if not reviews:
            continue

        meta = f"과목: {cname} / 교수: {prof} / 과목코드: {code}"
        bullets = "\n".join([f"- {r}" for r in reviews])
        a = f"{meta}\n[후기]\n{bullets}"

        q_variants = [
            f"{cname} 강의 어때?",
            f"{cname} {prof} 강의평 알려줘",
            f"{cname} 과제 많아?",
            f"{cname} 시험 어려워?",
            f"{cname} 꿀강이야?",
        ]

        for q in q_variants:
            rows.append({"Q": q, "A": a, "label": "강의평"})

    return pd.DataFrame(rows)

def build_tfidf(df):
    vect = TfidfVectorizer()
    mat = vect.fit_transform(df["Q"].fillna("").astype(str).tolist())
    return vect, mat

def find_top_k(df, vect, mat, q, k=3):
    vec = vect.transform([q])
    sims = cosine_similarity(vec, mat)[0]
    ranked = sorted(enumerate(sims), key=lambda x: x[1], reverse=True)
    return ranked[:k]

def init_openai():
    load_dotenv()
    # 키가 있으면 OpenAI 클라이언트 생성
    if os.getenv("OPENAI_API_KEY"):
        return OpenAI()
    return None

def ask_openai(client, question, top_rows):
    context_parts = []
    for i, (q, a, label, sim) in enumerate(top_rows, start=1):
        # label이 NaN이면 빈 문자열로
        if pd.isna(label):
            label = ""
        context_parts.append(
            f"[{i}] (유사도 {sim:.3f}, label={label})\nQ: {q}\nA: {a}\n"
        )
    context_text = "\n".join(context_parts)

    system_prompt = """
너는 백석대학교 과목 정보/추천 챗봇이야.
아래 제공된 Q/A는 참고 자료야.
사용자 질문에 맞게 핵심만 뽑아 자연스럽게 요약해서 답해.
특히 강의평(후기)은 '과제/시험/난이도/수업방식/교수 스타일' 위주로 정리해줘.
""".strip()

    user_prompt = textwrap.dedent(f"""
사용자의 질문:
{question}

아래는 CSV에서 찾은 유사 Q/A 목록(참고용):
{context_text}

위 정보를 참고해서 가장 자연스럽고 정확한 답변을 완성해줘.
""").strip()

    resp = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=600,
    )
    return resp.choices[0].message.content.strip()

def main():
    print("=== 백석대학교 시간표/강의평 챗봇 ===\n")

    df_course = load_course_qa(COURSE_QA_PATH)
    df_review = load_reviews_as_qa(REVIEW_PATH)

    df = pd.concat([df_course, df_review], ignore_index=True)

    vect, mat = build_tfidf(df)
    client = init_openai()

    while True:
        try:
            question = input("\n질문> ").strip()
        except KeyboardInterrupt:
            print("\n종료")
            break

        if not question:
            break

        top_indexes = find_top_k(df, vect, mat, question, TOP_K_CONTEXT)

        top_rows = []
        for idx, sim in top_indexes:
            row = df.iloc[idx]
            top_rows.append((row["Q"], row["A"], row.get("label", ""), sim))

        best_sim = top_rows[0][3]  # top1 유사도

        if client is None:
            print("\n[답변]:\n")
            print(top_rows[0][1])

        elif best_sim >= 0.80:
            print("\n[답변]:\n")
            print(top_rows[0][1])

        else:
            answer = ask_openai(client, question, top_rows)
            print("\n[답변]:\n")
            print(answer)

if __name__ == "__main__":
    main()
