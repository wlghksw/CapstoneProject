#!/bin/bash

cd "$(dirname "$0")"

# 가상환경이 없으면 생성
if [ ! -d "venv" ]; then
    echo "가상환경 생성 중..."
    python3 -m venv venv
fi

# 가상환경 활성화
source venv/bin/activate

# 패키지 설치 (SSL 문제가 있으면 --trusted-host 사용)
echo "패키지 설치 중..."
pip install --trusted-host pypi.org --trusted-host pypi.python.org --trusted-host files.pythonhosted.org -r requirements.txt

# 서버 실행
echo "서버 시작 중..."
python app.py
