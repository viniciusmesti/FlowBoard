# Teste do Backend FlowBoard
Write-Host "=== TESTE DO BACKEND FLOWBOARD ===" -ForegroundColor Green

# Teste 1: Health Check
Write-Host "`n1. Testando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/health" -Method GET
    Write-Host "✅ Health Check: $($health.StatusCode) - $($health.StatusDescription)" -ForegroundColor Green
    Write-Host "Resposta: $($health.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health Check falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Registro
Write-Host "`n2. Testando Registro..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test@test.com"
    password = "123456"
    role = "user"
    avatar = "user"
} | ConvertTo-Json

try {
    $register = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
    Write-Host "✅ Registro: $($register.StatusCode) - $($register.StatusDescription)" -ForegroundColor Green
    Write-Host "Resposta: $($register.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Registro falhou: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Mensagem: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

# Teste 3: Login
Write-Host "`n3. Testando Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@test.com"
    password = "123456"
} | ConvertTo-Json

try {
    $login = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "✅ Login: $($login.StatusCode) - $($login.StatusDescription)" -ForegroundColor Green
    Write-Host "Resposta: $($login.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login falhou: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Mensagem: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

Write-Host "`n=== FIM DOS TESTES ===" -ForegroundColor Green
