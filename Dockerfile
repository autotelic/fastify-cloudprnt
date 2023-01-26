FROM autotelic/cputil:latest

WORKDIR /usr/src/app
COPY index.js .
COPY routes/ routes/
COPY examples/ examples/
COPY package.json .
COPY __fixtures__/ __fixtures__/
COPY test.js .
RUN npm install

USER root
