# Stage 1: Build Vite static bundle
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve production dist on port 8080
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 8080
ENV PORT=8080

CMD ["serve", "-s", "dist", "-l", "8080"]