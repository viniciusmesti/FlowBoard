# Correção de Erro de Avatares

## Problema Identificado
O sistema estava gerando o erro: `GET /avatars/avatars/user.png.png 404`

Isso acontecia porque alguns avatares no banco de dados estavam salvos com o caminho completo (`/avatars/user.png`) ao invés de apenas o ID (`user`). Quando a função `getAvatarUrl()` processava esses dados, acabava duplicando o caminho e a extensão.

## Soluções Implementadas

### 1. Frontend - Função `getAvatarUrl()` Robusta
**Arquivo:** `frontend/src/lib/avatars.ts`

A função agora:
- Detecta se o avatar já é uma URL completa (começa com `/`)
- Remove extensões `.png` duplicadas
- Remove prefixos `avatars/` duplicados
- Sempre retorna uma URL válida

```typescript
export function getAvatarUrl(avatarId: string) {
  // Se já for uma URL completa, retornar como está
  if (!avatarId || avatarId.startsWith('/')) {
    return avatarId || '/avatars/user.png'
  }
  
  // Se já tiver .png, remover para evitar duplicação
  const cleanId = avatarId.replace(/\.png$/, '')
  
  // Se ainda tiver 'avatars/' no caminho, remover
  const finalId = cleanId.replace(/^avatars\//, '')
  
  return `/avatars/${finalId}.png`
}
```

### 2. Backend - Sanitização de Avatares
**Arquivos:** 
- `backend/src/users/users.service.ts`
- `backend/src/users/dto/create-user.dto.ts`

Agora o backend sanitiza os avatares em:
- **Criação de usuário:** Remove caminhos e extensões antes de salvar
- **Atualização de usuário:** Aplica a mesma sanitização

Isso garante que apenas IDs válidos são salvos: `user`, `user1`, `user2`, etc.

### 3. Script de Limpeza do Banco de Dados
**Arquivo:** `fix-avatars.ps1`

Um script PowerShell que:
- Busca todos os usuários
- Identifica avatares com caminhos incorretos
- Corrige automaticamente para apenas IDs
- Mostra o progresso da correção

## Como Usar

### Passo 1: Iniciar o Backend
```powershell
cd backend
npm run start:dev
```

**Nota:** O backend roda na porta **3001** (não 5000)

### Passo 2: Executar o Script de Correção
Em outro terminal:
```powershell
.\fix-avatars.ps1
```

### Passo 3: Reiniciar o Frontend
```powershell
cd frontend
npm run dev
```

## Formato Correto de Avatares

✅ **CORRETO** (apenas ID):
- `user`
- `user1`
- `user2`
- `user3`
- `user4`

❌ **INCORRETO** (caminhos/extensões):
- `/avatars/user.png`
- `avatars/user.png`
- `user.png`
- `/avatars/avatars/user.png.png`

## Prevenção de Futuros Problemas

Com as correções implementadas:

1. **Novos usuários:** Avatares serão sempre sanitizados antes de salvar
2. **Atualizações:** Qualquer atualização de avatar será sanitizada
3. **Frontend:** A função `getAvatarUrl()` lida com qualquer formato incorreto existente

## Verificação

Após executar o script, verifique:

1. **Console do Backend:** Não deve mais haver erros 404 para avatares
2. **Interface:** Todos os avatares devem carregar corretamente
3. **Network Tab:** URLs devem estar no formato `/avatars/user.png` (sem duplicações)

## Estrutura de Avatares Disponíveis

```
public/avatars/
├── user.png      (Avatar Padrão)
├── user1.png     (Avatar 1)
├── user2.png     (Avatar 2)
├── user3.png     (Avatar 3)
└── user4.png     (Avatar 4)
```

Todos os avatares devem ser referenciados apenas pelo ID sem extensão ou caminho.

