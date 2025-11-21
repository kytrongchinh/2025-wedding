FROM dockerhub-fpt.zsl.zalo.services/za/node:20

WORKDIR /srv

COPY package*.json .npmrc* ./
RUN npm install
RUN npm install soap --force
COPY ./ ./
RUN rm -f .npmrc

USER ${APP_USER}

EXPOSE 3000
ENTRYPOINT ["sh", "-c", "pm2 start pm2.config.json --no-daemon --env $APP_PROF"]