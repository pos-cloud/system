FROM node:16

RUN mkdir -p /app
WORKDIR /app

COPY services/storage/package.json .
COPY services/storage/tsconfig.json .
COPY services/storage/tsconfig.build.json .

RUN npm install
RUN npm run build

COPY services/storage/ .

CMD [ "npm", "run", "start" ]