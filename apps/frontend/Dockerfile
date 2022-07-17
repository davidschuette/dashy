##########################
# Build Stage

FROM node:18

# RUN apk --no-cache add --virtual builds-deps build-base python

# Create app directory
WORKDIR /usr/src

# Install app dependencies

COPY ./package*.json ./
COPY ./decorate-angular-cli.js ./

RUN npm ci --no-progress --no-audit --prefer-offline

COPY ./nx.json ./
COPY ./angular.json ./
COPY ./tsconfig*.json ./
COPY ./.eslintrc.json ./

RUN npm run postinstall


# Bundle app source
COPY ./apps/frontend/. ./apps/frontend
COPY ./libs/. ./libs

# Run build
RUN npm run build -- frontend --prod

##########################
# Run Stage

FROM nginx:1.21.4-alpine

WORKDIR /usr/src

# Copy compiled files
COPY --from=0 /usr/src/dist/apps/frontend /usr/share/nginx/html
COPY /config/frontend/default.conf /etc/nginx/conf.d/default.conf
# COPY ssl/. /etc/nginx/ssl

# Test nginx configuration
RUN nginx -t

# Start process
CMD nginx -g 'daemon off;'
