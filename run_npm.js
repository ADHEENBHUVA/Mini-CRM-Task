const { spawnSync } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

console.log('Running npx create-vite...');
let result = spawnSync(npxCmd, ['create-vite@latest', 'client', '--template', 'react', '--yes'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: false
});

console.log('Frontend create-vite exited with:', result.status);

console.log('Running npm install for backend...');
result = spawnSync(npmCmd, ['install', 'express', 'mongoose', 'jsonwebtoken', 'bcrypt', 'multer', 'cors', 'dotenv'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    shell: false
});

console.log('Backend npm install exited with:', result.status);

