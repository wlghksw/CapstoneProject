# -*- coding: utf-8 -*-
  
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()  # .env 파일
client = OpenAI()  # OPENAI_API_KEY 자동 인식
  
messages = [
    {
        "role": "system",
        "content": """
        너는 대학 수업 추천 도우미야.
        사용자의 성격, 관심사, 공부 스타일을 보고 어울리는 수업을 추천해 줘.
        """
    },
    {
        "role": "user",
        "content": "복학하는데 친구가 없어 무슨 수업 듣지?",
    },
]
  
completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
)

print(completion.choices[0].message.content)
