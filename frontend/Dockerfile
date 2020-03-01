from node:12

# Create app directory
WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package.json .
COPY yarn.lock .

RUN npm i -g pm2

RUN yarn

COPY dist dist
COPY public public

EXPOSE 8999
CMD ["pm2-runtime", "dist/server/index.js"]
