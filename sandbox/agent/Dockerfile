FROM node:20-bullseye

# Install build dependencies for node-pty
# 'make', 'python3', and 'g++' are required for node-gyp to compile c++ code
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

RUN mkdir /workspace

CMD [ "npm", "run", "dev" ]  