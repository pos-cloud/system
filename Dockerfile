FROM node:16.10 as build-step
RUN mkdir -p /app
WORKDIR /app
COPY . /app
RUN npm install
RUN npm install -g @angular/cli
RUN ng build --configuration production