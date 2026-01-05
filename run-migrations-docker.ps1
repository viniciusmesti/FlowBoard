# Executar migrations via Docker
Write-Host "=== Executando Migrations via Docker ===" -ForegroundColor Cyan

Write-Host "`nUsando Docker para conectar no banco PostgreSQL..." -ForegroundColor Yellow

# URL do banco - ATUALIZE COM SUA DATABASE_URL
# Exemplo Supabase: postgresql://user:pass@host.supabase.com:port/database
$DATABASE_URL = $env:DATABASE_URL
if (-not $DATABASE_URL) {
    Write-Host "❌ DATABASE_URL não configurada!" -ForegroundColor Red
    Write-Host "Configure a variável de ambiente DATABASE_URL ou edite este script." -ForegroundColor Yellow
    exit 1
}

try {
    # Verificar se Docker está rodando
    docker --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker não está rodando ou não está instalado" -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Docker encontrado!" -ForegroundColor Green

    # Executar migrations usando container Node.js
    Write-Host "`nExecutando migrations..." -ForegroundColor Yellow
    
    # Criar arquivo .env temporário
    $envContent = @"
DATABASE_URL=$DATABASE_URL
NODE_ENV=production
"@
    
    $envContent | Out-File -FilePath "backend\.env.temp" -Encoding UTF8
    
    # Executar migrations
    docker run --rm -v "${PWD}/backend:/app" -w /app --env-file backend/.env.temp node:18-alpine sh -c "
        npm install && 
        npm run migration:run
    "
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Migrations executadas com sucesso!" -ForegroundColor Green
        Write-Host "Tabelas criadas no banco PostgreSQL!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Erro ao executar migrations" -ForegroundColor Red
    }
    
    # Limpar arquivo temporário
    Remove-Item "backend\.env.temp" -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "`n❌ Erro: $_" -ForegroundColor Red
}

Write-Host "`n=== Script Concluído ===" -ForegroundColor Cyan


