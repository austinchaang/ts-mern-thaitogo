#!/bin/sh
set -e

# Perform any pre-start initialization tasks here

# Start Nginx
exec nginx -g "daemon off;"
