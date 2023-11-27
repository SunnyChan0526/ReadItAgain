# 使用官方 Python 基礎映像
FROM python:3.12

# 設置工作目錄
WORKDIR /app

# 設定python環境變數
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# 複製依賴文件到容器中
COPY requirements.txt .

# 安裝依賴
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 複製本地代碼到容器中
COPY . .