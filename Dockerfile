FROM autotelic/cputil:latest

WORKDIR /usr/src/app
COPY index.js .
COPY routes routes
COPY helpers helpers
COPY examples examples
COPY package.json .
COPY index.test.js .
RUN npm install

USER root
