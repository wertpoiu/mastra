FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Fix for read-only process.versions in generated output
RUN sed -i 's/process.versions = process.versions || {};/try { process.versions = process.versions || {};/g' .mastra/output/netlify-*.mjs && \
    sed -i "s/process.versions.node = '23.10.0';/process.versions.node = '23.10.0'; } catch (e) {}/g" .mastra/output/netlify-*.mjs

EXPOSE 4111

CMD ["npm", "start"]
