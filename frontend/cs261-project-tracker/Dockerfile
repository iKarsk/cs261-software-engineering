FROM node:18-alpine AS dependencies

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
RUN npm rebuild bcrypt 
RUN apk update && apk add bash

FROM node:18-alpine AS build

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS deploy

WORKDIR /app

ENV NODE_ENV production

COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/migrate-and-start.sh .

EXPOSE 3000

ENV PORT 3000

CMD ["/bin/sh", "-c", "npx prisma db push;node server.js"]
