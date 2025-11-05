# Script para executar migrations no Render
Write-Host "=== Executando Migrations no Banco PostgreSQL ===" -ForegroundColor Cyan

# URL do banco (use a External Database URL)
$DATABASE_URL = "postgresql://flowboard_ftay_user:LKERD3cqLZOnTNorfdex2hLkKaKiRVt3@dpg-d3igg4pr0fns73csoke0-a.oregon-postgres.render.com/flowboard_ftay"

Write-Host "`nConectando ao banco PostgreSQL..." -ForegroundColor Yellow
Write-Host "Host: dpg-d3igg4pr0fns73csoke0-a.oregon-postgres.render.com" -ForegroundColor Gray
Write-Host "Database: flowboard_ftay" -ForegroundColor Gray
Write-Host "User: flowboard_ftay_user" -ForegroundColor Gray

try {
    # Verificar se o psql está disponível
    $psqlCheck = Get-Command psql -ErrorAction SilentlyContinue
    if (-not $psqlCheck) {
        Write-Host "`n❌ psql não encontrado. Instalando PostgreSQL client..." -ForegroundColor Red
        Write-Host "Por favor, instale o PostgreSQL client primeiro:" -ForegroundColor Yellow
        Write-Host "1. Baixe em: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
        Write-Host "2. Ou use chocolatey: choco install postgresql" -ForegroundColor Yellow
        Write-Host "3. Ou use winget: winget install PostgreSQL.PostgreSQL" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "`n✅ psql encontrado!" -ForegroundColor Green

    # Testar conexão
    Write-Host "`nTestando conexão..." -ForegroundColor Yellow
    $env:PGPASSWORD = "LKERD3cqLZOnTNorfdex2hLkKaKiRVt3"
    
    $testQuery = "SELECT version();"
    $result = psql -h dpg-d3igg4pr0fns73csoke0-a.oregon-postgres.render.com -U flowboard_ftay_user -d flowboard_ftay -c $testQuery
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexão bem-sucedida!" -ForegroundColor Green
        Write-Host "`nExecutando migrations..." -ForegroundColor Yellow
        
        # Executar migrations usando TypeORM
        cd backend
        npm run migration:run
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Migrations executadas com sucesso!" -ForegroundColor Green
            Write-Host "Tabelas criadas no banco PostgreSQL!" -ForegroundColor Green
        } else {
            Write-Host "`n❌ Erro ao executar migrations" -ForegroundColor Red
        }
    } else {
        Write-Host "`n❌ Falha na conexão com o banco" -ForegroundColor Red
        Write-Host "Verifique se:" -ForegroundColor Yellow
        Write-Host "1. O banco está ativo no Render" -ForegroundColor Yellow
        Write-Host "2. As credenciais estão corretas" -ForegroundColor Yellow
        Write-Host "3. A URL de conexão está correta" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "`n❌ Erro: $_" -ForegroundColor Red
} finally {
    # Limpar variável de ambiente
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n=== Script Concluído ===" -ForegroundColor Cyan

