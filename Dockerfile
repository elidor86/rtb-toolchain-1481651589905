# Use the base App Engine Docker image, based on debian jessie.
FROM gcr.io/google_appengine/base

# Install updates and dependencies
RUN apt-get update -y && apt-get install --no-install-recommends -y -q curl python build-essential git ca-certificates libkrb5-dev && \
    apt-get clean && rm /var/lib/apt/lists/*_*

# Install the latest LTS release of nodejs
RUN mkdir /nodejs && curl https://nodejs.org/dist/v6.1.0/node-v6.2.0-linux-x64.tar.gz | tar xvzf - -C /nodejs --strip-components=1
ENV PATH $PATH:/nodejs/bin




# Set common env vars
ENV NODE_ENV production

WORKDIR /app

COPY . /app/

# Install dependencies.
    RUN npm --unsafe-perm install

# start
CMD ["npm", "start"]