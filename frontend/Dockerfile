FROM node:18-alpine

WORKDIR /app

COPY package.json ./

# Install packages
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
