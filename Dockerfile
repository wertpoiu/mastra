FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Fix for read-only process.versions in generated output by commenting out the lines
RUN sed -i 's/process\.versions = process\.versions || {};/\/\/ process.versions = process.versions || {};/g' .mastra/output/netlify-*.mjs && \
    sed -i "s/process\.versions\.node = '[0-9.]*';/\/\/ process.versions.node = 'commented';/g" .mastra/output/netlify-*.mjs

EXPOSE 4111

CMD ["npm", "start"]
