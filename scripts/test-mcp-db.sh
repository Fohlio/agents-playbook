#!/bin/bash

# Test script for MCP endpoint
# Usage: ./scripts/test-mcp-db.sh

BASE_URL="http://localhost:3012/api/v1/mcp"
HEADERS='-H "Content-Type: application/json" -H "Accept: application/json, text/event-stream"'

echo "🧪 Testing MCP Endpoint"
echo "========================================"
echo ""

# Test 1: List tools
echo "1️⃣  Testing tools/list..."
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  grep -o '"name":"[^"]*"' | head -5
echo ""
echo ""

# Test 2: Search workflows (bug fix)
echo "2️⃣  Testing semantic search: 'fix critical bug'..."
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_available_workflows","arguments":{"task_description":"fix critical bug"}}}' | \
  grep -oE '\[SYSTEM\] \*\*[^*]+\*\*' | head -3
echo ""
echo ""

# Test 3: Search workflows (new feature)
echo "3️⃣  Testing semantic search: 'create new feature'..."
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_available_workflows","arguments":{"task_description":"create new feature"}}}' | \
  grep -oE '\[SYSTEM\] \*\*[^*]+\*\*' | head -3
echo ""
echo ""

# Test 4: Get workflow details
echo "4️⃣  Testing select_workflow (Quick Fix)..."
curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"select_workflow","arguments":{"workflow_id":"06c7cdac-a765-4c29-a3c5-bceec77cef5a"}}}' | \
  grep -o "name: \"[^\"]*\"" | head -1
echo ""
echo ""

echo "✅ All tests completed!"
echo ""
echo "💡 To test manually, use:"
echo "   curl -X POST $BASE_URL \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -H 'Accept: application/json, text/event-stream' \\"
echo "     -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'"
