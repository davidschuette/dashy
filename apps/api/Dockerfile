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

# Bundle app source
COPY ./apps/api/. ./apps/api
COPY ./libs/. ./libs

# Run build
RUN npm run build -- api --prod

##########################
# Run Stage

FROM node:18

# RUN apk --no-cache add --virtual builds-deps build-base python curl

WORKDIR /usr/src

# Copy compiled files
COPY --from=0 /usr/src/package*.json ./
COPY --from=0 /usr/src/decorate-angular-cli.js ./

# Install packages needed for production
RUN npm ci --only=production --no-progress --no-audit --prefer-offline

COPY --from=0 /usr/src/dist/apps/api ./

# Checking the health route of the service itself
# HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
#   CMD curl http://localhost:3060/api/health/

# Start process
CMD node --unhandled-rejections=strict main.js
