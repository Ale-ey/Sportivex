# PowerShell script to test authentication endpoints
# Run with: .\test-auth.ps1

$baseUrl = "http://localhost:3000/api/auth"

Write-Host "=== Testing Register Endpoint ===" -ForegroundColor Green

$registerBody = @{
    name = "John Doe"
    cmsId = 123456
    role = "student"
    email = "john.doe@nust.edu.pk"
    password = "securePassword123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody
    
    Write-Host "✅ Registration Successful!" -ForegroundColor Green
    Write-Host ($registerResponse | ConvertTo-Json -Depth 5)
    
    # Save token for later use
    if ($registerResponse.data.token) {
        $script:authToken = $registerResponse.data.token
        Write-Host "`n🔑 Token saved: $authToken" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Registration Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host "`n=== Testing Login Endpoint ===" -ForegroundColor Green

$loginBody = @{
    email = "john.doe@nust.edu.pk"
    password = "securePassword123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody
    
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host ($loginResponse | ConvertTo-Json -Depth 5)
    
    # Save token for later use
    if ($loginResponse.data.token) {
        $script:authToken = $loginResponse.data.token
        Write-Host "`n🔑 Token saved: $authToken" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Login Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message
    }
}

# If we have a token, test protected endpoint
if ($authToken) {
    Write-Host "`n=== Testing Get Profile (Protected Endpoint) ===" -ForegroundColor Green
    
    $headers = @{
        Authorization = "Bearer $authToken"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/profile" `
            -Method GET `
            -Headers $headers
        
        Write-Host "✅ Profile Retrieved!" -ForegroundColor Green
        Write-Host ($profileResponse | ConvertTo-Json -Depth 5)
    } catch {
        Write-Host "❌ Get Profile Failed!" -ForegroundColor Red
        Write-Host $_.Exception.Message
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message
        }
    }
}

