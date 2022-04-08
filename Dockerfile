FROM amd64/node:latest
ENV DEBIAN_FRONTEND noninteractive
RUN apt -y update
RUN apt install -y curl

RUN curl https://www.star-m.jp/products/s_print/CloudPRNTSDK/cputil/cputil-linux-x64_v111.tar.gz  -L -o cputil-linux-x64_v111.tar.gz
RUN tar -xf cputil-linux-x64_v111.tar.gz -C /opt
RUN ln -s /opt/cputil-linux-x64/cputil /usr/local/bin/cputil

# need this to avoid a .Net error
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

WORKDIR /usr/src/app
COPY index.js .
COPY routes routes
COPY templates templates
COPY package.json .
RUN npm install

USER node

RUN chown node:node /usr/local/bin/cputil
EXPOSE 3000
CMD ["/bin/sh", "-c", "npm run dev"]
