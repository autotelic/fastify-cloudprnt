FROM autotelic/cputil:latest

WORKDIR /usr/src/app
COPY index.js .
COPY routes routes
COPY examples examples
COPY package.json .
COPY test.js .
RUN npm install

USER root

# RUN chown node:node /usr/local/bin/cputil
# RUN chown node:node /usr/src/app
# EXPOSE 3000
CMD ["/bin/sh", "-c", "npm test"]
