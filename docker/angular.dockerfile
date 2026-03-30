FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -g @angular/cli

RUN npm install @angular/cdk@20.2.14

RUN npm install tslib --save-dev

RUN npm install leaflet@1.9.4
RUN npm install --save-dev @types/leaflet

RUN npm install
