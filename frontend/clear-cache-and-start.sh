#!/bin/bash

echo "🧹 Clearing build cache..."
rm -rf dist
rm -rf node_modules/.vite

echo "✅ Cache cleared!"
echo "🚀 Starting dev server..."
npm run dev
