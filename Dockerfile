FROM node:18.12.0

WORKDIR /backend

COPY ./ ./

RUN npm install && npm run build

RUN npx prisma generate

CMD npm run start:prod