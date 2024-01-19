#First stage: compiling
FROM node:latest as build
RUN mkdir -p /usr/src/app/src
WORKDIR /usr/src/app
COPY *.json .
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm install
COPY ./src ./src
RUN npx tsc

#Second stage
FROM node:latest
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json .
COPY ./public ./public
COPY ./video ./video
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci --only=production
COPY --from=build /usr/src/app/dist dist
EXPOSE 4000
CMD ["node", "dist/index.js"]