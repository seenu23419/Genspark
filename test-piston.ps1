# Test Piston API Integration (Windows PowerShell)

Write-Host "🚀 Testing Piston API Integration" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

$PISTON_URL = "https://emkc.org/api/v2/piston/execute"

# Test 1: Python
Write-Host "`n✅ Test 1: Python (Hello World)" -ForegroundColor Green

$pythonCode = @{
    language = "python3"
    version = "*"
    files = @(@{ content = "print('Hello from Piston!')" })
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $PISTON_URL `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $pythonCode

$result = $response.Content | ConvertFrom-Json
Write-Host "Output: $($result.run.stdout)"
Write-Host "Status: $($result.run.code)" -ForegroundColor Yellow

# Test 2: C
Write-Host "`n✅ Test 2: C Program" -ForegroundColor Green

$cCode = @{
    language = "c"
    version = "*"
    files = @(@{ content = "#include <stdio.h>`nint main() { printf(`"Hello from C!`"); return 0; }" })
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $PISTON_URL `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $cCode

$result = $response.Content | ConvertFrom-Json
Write-Host "Output: $($result.run.stdout)"
Write-Host "Status: $($result.run.code)" -ForegroundColor Yellow

# Test 3: JavaScript
Write-Host "`n✅ Test 3: JavaScript" -ForegroundColor Green

$jsCode = @{
    language = "javascript"
    version = "*"
    files = @(@{ content = "console.log('Hello from JavaScript!')" })
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $PISTON_URL `
    -Method POST `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $jsCode

$result = $response.Content | ConvertFrom-Json
Write-Host "Output: $($result.run.stdout)"
Write-Host "Status: $($result.run.code)" -ForegroundColor Yellow

Write-Host "`n✅ All Piston tests completed!" -ForegroundColor Cyan
