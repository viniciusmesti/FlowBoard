# Teste específico de conexão com banco
Write-Host "=== TESTE DE CONEXAO COM BANCO ===" -ForegroundColor Green

# Teste 1: Health Check (deve funcionar)
Write-Host "`n1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/health" -Method GET
    Write-Host "✅ Health Check: $($health.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Endpoint que não usa banco (deve funcionar)
Write-Host "`n2. Testando endpoint sem banco..." -ForegroundColor Yellow
try {
    $cors = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/" -Method GET
    Write-Host "✅ Endpoint raiz: $($cors.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint raiz falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Registro (usa banco - pode falhar)
Write-Host "`n3. Testando registro (usa banco)..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test$(Get-Random)@test.com"
    password = "123456"
    role = "user"
    avatar = "user"
} | ConvertTo-Json

try {
    $startTime = Get-Date
    $register = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    
    Write-Host "✅ Registro: $($register.StatusCode) (${duration}s)" -ForegroundColor Green
    Write-Host "Resposta: $($register.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Registro falhou: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Mensagem: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

Write-Host "`n=== DIAGNOSTICO ===" -ForegroundColor Green
Write-Host "Se Health Check funciona mas registro falha:" -ForegroundColor Yellow
Write-Host "→ Problema é com o banco de dados" -ForegroundColor Red
Write-Host "`nVerifique:" -ForegroundColor Yellow
Write-Host "1. Logs do backend no Render" -ForegroundColor White
Write-Host "2. Status do banco PostgreSQL no Render" -ForegroundColor White
Write-Host "3. Se o banco está dormindo (free tier)" -ForegroundColor White
