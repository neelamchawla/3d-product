# 3d-product
threejs + vite + react + ts


<!-- client side -->
npm create vite@latest -- client
    - React
    - javascript
cd client
npm install three @react-three/fiber @react-three/drei valtio react-color framer-motion
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install
npm run dev

<!-- server side -->
npm init -y

add these lines in package.json
"type": "module"
"start": "nodemon index"

add dependencies
npm install cloudinary cors express mongoose nodemon
npm i dotenv
npm i openai

<!-- sk-proj-azOzGDjB2FF15WYTX4MhvEDghKPAymEenmK2Akg3xFaU8riGHpzD7aUsA6PX
_h5EUeyDzrGxHMT3BlbkFJblHUCh1p6hRgSB5pBQmv9J-RBTho
_7fKnArmTmzjCEQe1sQxXPVKh8PAdh_xLG8TQEz--qShYA -->

<!-- upload server side working on render.com -->
<!-- 1. delete package-lock.json -->
<!-- 2. add .js behind index -->
"scripts": {
    "start": "nodemon index.js"
    }
https://dashboard.render.com/
https://dashboard.render.com/web/srv-cihbrh5ph6erq6hf1jh0/deploys/dep-cihc86d9aq012eshr800

<!-- got error regarding error mongoose@7.3.1: The engine "node" is incompatible with this module. Expected version ">=14.20.1". Got "14.17.0" -->
npm update


<!-- generate new key -->
https://platform.openai.com/account/api-keys
<!-- add inside env file -->
.env
OPENAI_API_KEY=

npm start -> server
npm run dev -> client


<!-- sk-WoxR2WcBSQEAjD1Q16FET38lbkFJLajWlVv9mXu26SA0Km6E -->

cd server
nvm use 14
npm install   # should work now
npm start


cd client
nvm use 14
npm install
npm run dev