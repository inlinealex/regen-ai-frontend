#!/bin/bash

echo "🚀 ReGenAI Frontend Deployment Script"
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit for Render deployment"
    git branch -M main
    echo "✅ Git repository initialized"
else
    echo "📁 Git repository already exists"
    git add .
    git commit -m "Update for Render deployment"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Create a GitHub repository at: https://github.com/new"
echo "2. Copy the repository URL"
echo "3. Run: git remote add origin YOUR_REPOSITORY_URL"
echo "4. Run: git push -u origin main"
echo "5. Go to https://render.com and create a new Static Site"
echo "6. Connect your GitHub repository"
echo "7. Set Build Command: npm install && npm run build"
echo "8. Set Publish Directory: build"
echo ""
echo "🎯 Your demo will be available at: https://your-app-name.onrender.com"
echo ""
echo "📖 See deploy-to-render.md for detailed instructions" 