FROM node:18.16.0-alpine

ENV NODE_ENV production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .

ENV PORT 5000

EXPOSE 5000

CMD ["node", "server.js"]