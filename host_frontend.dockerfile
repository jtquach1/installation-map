# First stage of build. Copy source code and run build command.
FROM node:14.6.0 AS builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn install
RUN yarn global add react-scripts@3.4.1
COPY . .
RUN yarn run build

# Already exists waypoints.json in src/ so copy over to build/static/ 
RUN cp /app/src/waypoints.json /app/build/static

# Second stage of build. Copy HTML, JS artifacts to the container for smaller image size. 
FROM node:14.6.0
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "80", "-s", "."]
