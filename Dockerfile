# we need armv7 to run cputil
FROM arm32v7/node:latest
ENV DEBIAN_FRONTEND noninteractive
RUN apt -y update
RUN apt install -y curl

RUN curl https://www.star-m.jp/products/s_print/CloudPRNTSDK/cputil/cputil-linux-arm_v111.tar.gz  -L -o cputil-linux-arm_v111.tar.gz
RUN tar -xf cputil-linux-arm_v111.tar.gz -C /opt
RUN ln -s /opt/cputil-linux-arm/cputil /usr/local/bin/cputil

# need this to avoid a .Net error
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

WORKDIR /usr/src/app
COPY index.js .
COPY package.json .
RUN npm install

USER node

RUN chown node:node /usr/local/bin/cputil
EXPOSE 3000
CMD ["/bin/sh", "-c", "npm run dev"]
