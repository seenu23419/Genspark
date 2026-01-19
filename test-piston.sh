#!/bin/bash
# Test Piston API Integration

echo "🚀 Testing Piston API Integration"
echo "=================================="

# Test 1: Simple Python
echo -e "\n✅ Test 1: Python (Hello World)"
curl -X POST https://emkc.org/api/v2/piston/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python3",
    "version": "*",
    "files": [{"content": "print(\"Hello from Piston!\")"}]
  }' | jq '.run'

# Test 2: C
echo -e "\n✅ Test 2: C Program"
curl -X POST https://emkc.org/api/v2/piston/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "c",
    "version": "*",
    "files": [{"content": "#include <stdio.h>\nint main() { printf(\"Hello from C!\"); return 0; }"}]
  }' | jq '.run'

# Test 3: JavaScript
echo -e "\n✅ Test 3: JavaScript"
curl -X POST https://emkc.org/api/v2/piston/execute \
  -H "Content-Type: application/json" \
  -d '{
    "language": "javascript",
    "version": "*",
    "files": [{"content": "console.log(\"Hello from JavaScript!\")"}]
  }' | jq '.run'

echo -e "\n✅ All Piston tests completed!"
