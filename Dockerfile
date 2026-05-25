FROM node:22-alpine

WORKDIR /app

COPY src ./src
COPY data ./data
COPY images ./images

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/javascript/server.js"]
