# Python 3.11 + Node.js環境
FROM python:3.11-slim

# Node.jsをインストール
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを設定
WORKDIR /app

# Pythonの依存関係をコピーしてインストール
COPY batch/requirements.txt /app/batch/requirements.txt
RUN pip install --no-cache-dir -r /app/batch/requirements.txt

# Node.jsの依存関係をコピーしてインストール
COPY railway-cron/package.json /app/railway-cron/package.json
WORKDIR /app/railway-cron
RUN npm install

# アプリケーションのコードをコピー
COPY batch /app/batch
COPY railway-cron /app/railway-cron

# Cronサービスを起動
CMD ["node", "index.js"]
