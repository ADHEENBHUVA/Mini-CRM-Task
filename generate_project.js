const fs = require('fs');
const path = require('path');

// Helper to write files
const writeFile = (filePath, content) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content.trim() + '\n');
    console.log('Created:', filePath);
};

// --- BACKEND SETUP ---
writeFile('server/package.json', JSON.stringify({
    "name": "crm-server",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": { "start": "node index.js", "dev": "nodemon index.js" },
    "dependencies": {
        "bcrypt": "^5.1.1",
        "cors": "^2.8.5",
        "dotenv": "^16.3.1",
        "express": "^4.18.2",
        "jsonwebtoken": "^9.0.2",
        "mongoose": "^8.0.3",
        "multer": "^1.4.5-lts.1"
    }
}, null, 2));

writeFile('server/index.js', `
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/minicrm')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('CRM API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`);

writeFile('server/.env', 'PORT=5000\nMONGO_URI=mongodb://localhost:27017/minicrm\nJWT_SECRET=supersecret123');


// --- FRONTEND SETUP ---
writeFile('client/package.json', JSON.stringify({
    "name": "crm-client",
    "private": true,
    "version": "0.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "preview": "vite preview"
    },
    "dependencies": {
        "@reduxjs/toolkit": "^2.0.1",
        "axios": "^1.6.2",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-hook-form": "^7.49.2",
        "react-redux": "^9.0.4",
        "react-router-dom": "^6.21.1"
    },
    "devDependencies": {
        "@types/react": "^18.2.43",
        "@types/react-dom": "^18.2.17",
        "@vitejs/plugin-react": "^4.2.1",
        "tailwindcss": "3.4.1",
        "postcss": "^8.4.32",
        "autoprefixer": "^10.4.16",
        "vite": "^5.0.8"
    }
}, null, 2));

writeFile('client/vite.config.js', `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`);

writeFile('client/tailwind.config.js', `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`);

writeFile('client/postcss.config.js', `
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);

writeFile('client/index.html', `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mini CRM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);

writeFile('client/src/index.css', \`
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  background-color: #f8fafc;
}
\`);

writeFile('client/src/main.jsx', `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
    `);

writeFile('client/src/App.jsx', `
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-blue-600 mb-4">Mini CRM system</h1>
                <p className="text-gray-600">Frontend and Backend boilerplates initialized!</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;
`);
