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

<!-- generate new key -->
https://platform.openai.com/account/api-keys
<!-- add inside env file -->
.env
OPENAI_API_KEY=

npm start -> server
npm run dev -> client


<!-- sk-WoxR2WcBSQEAjD1Q16FET38lbkFJLajWlVv9mXu26SA0Km6E -->