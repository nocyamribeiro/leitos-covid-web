# Imagem node e build da aplicação.
FROM node:12.0-slim as node
WORKDIR /app
COPY package.json /app/
RUN npm i npm@latest -g
RUN npm install
COPY ./ /app/
ARG env=prod
RUN npm run build

# Imagem nginx. 
# Copia a build para dentro do server.
# Faz configuração do proxy para acessar API.
FROM nginx:1.13
COPY --from=node /app/dist/eleicoesWeb /usr/share/nginx/html
COPY ./nginx-custom.conf /etc/nginx/conf.d/default.conf
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'

