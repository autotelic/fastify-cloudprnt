FROM autotelic/cputil:latest

WORKDIR /usr/src/app
COPY index.js .
COPY routes routes
COPY examples examples
COPY package.json .
RUN npm install

USER node

RUN chown node:node /usr/local/bin/cputil
EXPOSE 3000
CMD ["/bin/sh", "-c", "npm run dev"]
