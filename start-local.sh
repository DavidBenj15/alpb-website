#!/bin/bash

# SLUGGER Platform Simple Local Startup Script
# This script helps you start the containerized SLUGGER platform locally
# (Database + Website only, Lambda functions run on AWS)

echo "🚀 Starting SLUGGER Platform Local Development Environment"
echo "=================================================="
echo "📋 Architecture: Database + Website (local), Lambda functions (AWS)"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your actual values."
    echo "   You can use the default values for local development."
    echo ""
    echo "⚠️  Important: Make sure to set your AWS credentials and Lambda API URL!"
fi

# Check if required directories exist
if [ ! -d "slugger-website" ]; then
    echo "❌ Required directory not found."
    echo "   Please ensure you have the 'slugger-website' directory."
    echo "   If you haven't cloned the repository yet, please do so first."
    exit 1
fi

echo "🔧 Building and starting containers..."
echo "   This will start:"
echo "   - PostgreSQL database (port 5432)"
echo "   - Website frontend + backend (ports 3000, 3001)"
echo ""

docker-compose up --build

echo ""
echo "✅ SLUGGER Platform is now running!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Database:    localhost:5432"
echo ""
echo "🔗 Lambda Functions:"
echo "   Make sure your Lambda functions are deployed on AWS"
echo "   and accessible via the LAMBDA_API_BASE_URL in your .env file"
echo ""
echo "📚 For more information, see README-Docker.md"
