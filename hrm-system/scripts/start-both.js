#!/usr/bin/env node
// scripts/start-both.js — Starts both backend and frontend concurrently
const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('====================================================');
console.log('🚀 Starting HRM Demo System (Backend + Frontend)');
console.log('====================================================');

// Spawn backend
const backend = spawn('npm', ['start'], {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || '5001' }
});

// Spawn frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  shell: true,
  stdio: 'inherit',
  env: { ...process.env }
});

const cleanup = () => {
  console.log('\n🛑 Shutting down HRM System servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
