@echo off
echo 🧹 Clearing build cache...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo ✅ Cache cleared!
echo 🚀 Starting dev server...
npm run dev
