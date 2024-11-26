# 使用 Node.js 官方基礎映像
FROM node:21

# 設置工作目錄。這是您在容器內部的應用根目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（如果可用）
COPY package*.json ./

# 安裝依賴
# 如果您的 package.json 文件中有大量依賴，可以使用 npm ci 來加速構建
RUN npm install

# 複製前端應用的源代碼到工作目錄
COPY . .

# 暴露容器在 3000 端口運行的 React 應用
EXPOSE 3000

# 配置環境變量，以支持熱重載功能
ENV CHOKIDAR_USEPOLLING=true

# 運行應用。這裡使用的是 React 項目中的 start 指令
CMD ["npm","run","dev"]
