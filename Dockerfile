# Stage 0: install base dependencies

# Dockerfile for dockerizing the fragments api server
FROM node:22.13.1@sha256:5145c882f9e32f07dd7593962045d97f221d57a1b609f5bf7a807eb89deff9d6 AS dependencies

LABEL maintainer="Ali Omar <aomar46@myseneca.ca>"
LABEL description="Fragments node.js microservice"

WORKDIR /app

# Reduce npm spam when installing within Docker https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
# Disable colour when run inside Docker https://docs.npmjs.com/cli/v8/using-npm/config#color
# Set the default node environment to production for optimization
# We default to use port 8080 in our service
ENV NPM_CONFIG_LOGLEVEL=warn \ 
    NPM_CONFIG_COLOR=false \
    NODE_ENV=production \
    PORT=8080


# Option 1: explicit path - Copy the package.json and package-lock.json
# files into /app. NOTE: the trailing `/` on `/app/`, which tells Docker
# that `app` is a directory and not a file.
COPY package*.json /app/

# optimization step
RUN npm ci --omit=dev


#################################################################################

# Stage 1: create minimal runtime image
FROM node:22.13.1-alpine3.20@sha256:c52e20859a92b3eccbd3a36c5e1a90adc20617d8d421d65e8a622e87b5dac963 AS production

WORKDIR /app

## copy the generated dependencies (node_modules)
COPY --chown=node:node --from=dependencies /app/ /app/


# Copy src to /app/src/
COPY src/ ./src/

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

USER node

CMD ["node", "src/index.js"]

# We run our service on port 8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --spider -q http://localhost:8080 || exit 1
