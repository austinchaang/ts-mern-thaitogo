#!/bin/sh

if [ -f /etc/nginx/templates/nginx.conf.template ]; then
    echo "Using envsubst to replace variables in nginx.conf"
    envsubst '${PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf
fi

exec nginx -g 'daemon off;'
