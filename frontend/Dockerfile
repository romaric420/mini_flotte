# ---------- Étape 1 : build Angular avec Node ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# npm ci si un package-lock.json existe (build reproductible), sinon npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ---------- Étape 2 : servir les fichiers avec nginx ----------
FROM nginx:1.30.0-alpine
RUN apk upgrade --no-cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/flotte-web/browser /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1
