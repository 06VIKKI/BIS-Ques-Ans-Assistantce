# ---- Build the React client ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN npm install --ignore-scripts && npm --prefix frontend install
COPY . .
RUN npm run build

# ---- Runtime image ----
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --ignore-scripts
COPY backend ./backend
COPY main.js ./
COPY --from=build /app/frontend/dist ./frontend/dist
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8000/api/health || exit 1
CMD ["node", "main.js"]
