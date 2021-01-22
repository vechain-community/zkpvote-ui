#!/bin/sh

set -o errexit

envsubst < /config/config.json.template > /usr/share/nginx/html/config.json

exec "$@"
