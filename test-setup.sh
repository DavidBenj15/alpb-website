#!/bin/bash

# SLUGGER Platform Simple Test Script
# This script tests if the local services are running correctly

echo "🧪 Testing SLUGGER Platform Setup"
echo "================================="
echo "📋 Testing: Database + Website (Lambda functions run on AWS)"
echo ""

# Test database connection
echo "📊 Testing database connection..."
if docker-compose exec -T database pg_isready -U slugger_user -d slugger_db > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database connection failed"
fi

# Test Backend API
echo "🌐 Testing Backend API..."
if curl -s http://localhost:3001/ > /dev/null; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
fi

# Test Frontend
echo "🎨 Testing Frontend..."
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "📋 Service Status:"
docker-compose ps

echo ""
echo "🔍 To view logs, run:"
echo "   docker-compose logs [service-name]"
echo ""
echo "🛑 To stop all services, run:"
echo "   docker-compose down"
echo ""
echo "⚠️  Note: Lambda functions run on AWS, not locally"
echo "   Make sure your AWS credentials and Lambda API URL are configured correctly"
