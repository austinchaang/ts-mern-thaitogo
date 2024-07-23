#!/bin/sh
# Replace environment variables in nginx.conf.template and create nginx.conf
envsubst '$PORT $BACKEND_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf

# Start Nginx
nginx -g 'daemon off;'
