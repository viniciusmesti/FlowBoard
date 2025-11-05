# 🔴 Troubleshooting: Erro 500 ao Criar Requisito

## ❌ **Problema**
Ao tentar criar um requisito em produção, está ocorrendo erro 500 (Internal Server Error).

```
POST https://flowboard-backend-24fk.onrender.com/requirements 500 (Internal Server Error)
```

## 🔍 **Possíveis Causas**

### 1. **Tabela `requirements` não existe no banco de produção**
- **Sintoma**: Erro ao salvar no banco
- **Solução**: Executar migrações no banco de produção

### 2. **Problema de conexão com o banco**
- **Sintoma**: Erro de conexão ou timeout
- **Solução**: Verificar `DATABASE_URL` no Render

### 3. **Campo obrigatório faltando**
- **Sintoma**: Erro de constraint violada
- **Solução**: Verificar logs detalhados

### 4. **Problema com relação `owner`**
- **Sintoma**: Erro ao salvar relação com usuário
- **Solução**: Verificar se o `ownerId` é válido

## ✅ **Soluções Aplicadas**

### 1. ✅ Logs detalhados adicionados
- Adicionados logs em `RequirementsController` e `RequirementsService`
- Logs mostram cada etapa do processo de criação
- Logs mostram erros detalhados do banco

### 2. ✅ Garantia de campo `progress`
- Campo `progress` agora é sempre definido como 0

## 🔧 **Próximos Passos**

### 1. **Fazer Deploy e Verificar Logs**
Após fazer o deploy, verifique os logs do Render:

1. Acesse o Render → `flowboard-backend`
2. Vá em **Logs**
3. Tente criar um requisito novamente
4. Procure por logs que começam com:
   - `📥 RequirementsController.create`
   - `📝 RequirementsService.create`
   - `❌ Erro ao criar requisito`

### 2. **Verificar Erro Específico**
Os logs agora mostrarão:
- **Código do erro** (ex: `42P01` = tabela não existe)
- **Detalhes do erro** (mensagem do PostgreSQL)
- **Tabela relacionada** (se houver)
- **Stack trace completo**

### 3. **Executar Migrações (se necessário)**
Se o erro for "tabela não existe" (`42P01`), execute as migrações:

**Opção 1: Via Script Local**
```powershell
.\run-migrations-render.ps1
```

**Opção 2: Via Render Shell**
1. Acesse Render → `flowboard-backend`
2. Vá em **Shell**
3. Execute:
```bash
npm run migration:run
```

### 4. **Verificar Tabelas no Banco**
Se tiver acesso ao banco, verifique se a tabela existe:

```sql
SELECT * FROM information_schema.tables WHERE table_name = 'requirements';
```

Se não existir, execute as migrações.

## 📋 **Checklist de Diagnóstico**

Após o deploy, verifique:

- [ ] Logs mostram `📥 RequirementsController.create - Recebido:`
- [ ] Logs mostram `📝 RequirementsService.create - Dados recebidos:`
- [ ] Logs mostram `💾 Salvando requisito no banco...`
- [ ] Se houver erro, qual é o código do erro?
- [ ] Qual é a mensagem de erro detalhada?
- [ ] A tabela `requirements` existe no banco?

## 🎯 **Códigos de Erro Comuns**

- `42P01`: **Tabela não existe** → Execute migrações
- `42P07`: **Tabela já existe** → Não é problema
- `23503`: **Foreign key violada** → Verificar `ownerId`
- `23505`: **Chave única violada** → Dados duplicados
- `23502`: **Campo obrigatório faltando** → Verificar DTO

## 📝 **Notas**

- Os logs agora são muito mais detalhados
- Eles mostrarão exatamente onde o erro está ocorrendo
- Use os logs para identificar o problema específico

