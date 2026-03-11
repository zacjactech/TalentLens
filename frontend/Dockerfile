FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./

RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev"]

