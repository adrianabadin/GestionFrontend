FROM node:20
RUN mkdir /home/app
WORKDIR /home/app/
COPY package*.* .
RUN npm i 
COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "npm","start" ]