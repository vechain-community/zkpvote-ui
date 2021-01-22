FROM node:10 as builder

RUN mkdir -p /app
WORKDIR /app

COPY package.json yarn.lock /app/
RUN yarn --pure-lockfile

COPY . /app

RUN yarn run build

FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf
ADD docker/nginx/ /etc/nginx/conf.d
ADD docker/config/ /config/
ADD docker/scripts/entrypoint.sh /

RUN sed -i 's/\r//' /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY --from=builder /app/dist /usr/share/nginx/html

ARG git_revision_id
ENV GIT_REVISION_ID ${git_revision_id}

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]
