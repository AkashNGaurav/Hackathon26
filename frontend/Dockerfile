FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . ./
EXPOSE 5173
ENV VITE_API_BASE=http://backend:8000/api
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
