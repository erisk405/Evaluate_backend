FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma

RUN npx prisma generate

COPY . .

# Install bcrypt inside Docker container
RUN npm rebuild bcrypt --build-from-source

EXPOSE 4000

CMD ["node", "index.js"]