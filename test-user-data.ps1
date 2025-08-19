# Teste de dados dos usuários
Write-Host "=== TESTE DE DADOS DOS USUARIOS ===" -ForegroundColor Green

# Teste 1: Verificar se o usuário tem avatar
Write-Host "`n1. Testando dados do usuário..." -ForegroundColor Yellow
try {
    $user = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/users" -Method GET
    Write-Host "✅ Usuários: $($user.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta: $($user.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Usuários falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 2: Verificar se requirements retorna owner com avatar
Write-Host "`n2. Testando requirements com owner..." -ForegroundColor Yellow
try {
    $requirements = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/requirements" -Method GET
    Write-Host "✅ Requirements: $($requirements.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta: $($requirements.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Requirements falhou: $($_.Exception.Message)" -ForegroundColor Red
}

# Teste 3: Verificar se tasks retorna assignee com avatar
Write-Host "`n3. Testando tasks com assignee..." -ForegroundColor Yellow
try {
    $tasks = Invoke-WebRequest -Uri "https://flowboard-backend-24fk.onrender.com/tasks" -Method GET
    Write-Host "✅ Tasks: $($tasks.StatusCode)" -ForegroundColor Green
    Write-Host "Resposta: $($tasks.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Tasks falhou: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== DIAGNOSTICO ===" -ForegroundColor Green
Write-Host "Se os dados retornam mas sem avatar:" -ForegroundColor Yellow
Write-Host "→ Problema é no backend não carregar relacionamentos" -ForegroundColor Red
Write-Host "`nSe os dados não retornam:" -ForegroundColor Yellow
Write-Host "→ Problema é nas tabelas não criadas" -ForegroundColor Red
