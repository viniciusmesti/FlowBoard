# Script para corrigir avatares no banco de dados
Write-Host "=== Corrigindo Avatares no Banco de Dados ===" -ForegroundColor Cyan

# URL da API (backend roda na porta 3001)
$API_URL = "http://localhost:3001"

# Obter todos os usuarios
Write-Host "`nBuscando todos os usuarios..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/users" -Method GET
    Write-Host "Encontrados $($response.Count) usuarios" -ForegroundColor Green
    
    foreach ($user in $response) {
        $originalAvatar = $user.avatar
        
        # Verificar se o avatar precisa de correcao
        if ($originalAvatar -match '/' -or $originalAvatar -match '\.png') {
            Write-Host "`n[CORRIGINDO] Usuario: $($user.name) (ID: $($user.id))" -ForegroundColor Yellow
            Write-Host "  Avatar atual: '$originalAvatar'" -ForegroundColor Red
            
            # Limpar o avatar
            $cleanAvatar = $originalAvatar `
                -replace '^/avatars/', '' `
                -replace '^avatars/', '' `
                -replace '\.png$', ''
            
            # Se ficou vazio, usar 'user' como padrao
            if ([string]::IsNullOrWhiteSpace($cleanAvatar)) {
                $cleanAvatar = 'user'
            }
            
            Write-Host "  Novo avatar: '$cleanAvatar'" -ForegroundColor Green
            
            # Atualizar o usuario
            $updateBody = @{
                avatar = $cleanAvatar
            } | ConvertTo-Json
            
            try {
                $null = Invoke-RestMethod -Uri "$API_URL/users/$($user.id)" -Method PATCH -Body $updateBody -ContentType "application/json"
                Write-Host "  OK Usuario atualizado com sucesso!" -ForegroundColor Green
            }
            catch {
                Write-Host "  ERRO ao atualizar usuario: $_" -ForegroundColor Red
            }
        }
        else {
            Write-Host "`n[OK] Usuario: $($user.name) - Avatar: '$originalAvatar'" -ForegroundColor Green
        }
    }
    
    Write-Host "`n=== Correcao Concluida ===" -ForegroundColor Cyan
    Write-Host "Reinicie o frontend para ver as alteracoes." -ForegroundColor Yellow
    
}
catch {
    Write-Host "Erro ao buscar usuarios: $_" -ForegroundColor Red
    Write-Host "Certifique-se de que o backend esta rodando em $API_URL" -ForegroundColor Yellow
}
