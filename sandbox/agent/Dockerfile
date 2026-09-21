FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

RUN mkdir /workspace

CMD [ "npm", "run", "dev" ]  