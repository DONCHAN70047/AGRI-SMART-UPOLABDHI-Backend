<<<<<<< HEAD
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .



EXPOSE 8080

CMD ["node", "server.js"]
=======
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .



EXPOSE 8080

CMD ["node", "server.js"]
>>>>>>> 53d2236968ac3e164dd02f7dcdc112ddf8291fcf
