FROM node:latest as base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

FROM base as production
COPY local/DigiCertGlobalRootCA.crt.pem /usr/local/share/ca-certificates/DigiCertGlobalRootCA.crt.pem
RUN chmod 644 /usr/local/share/ca-certificates/DigiCertGlobalRootCA.crt.pem && update-ca-certificates
RUN npm run build
RUN npm install --production --silent