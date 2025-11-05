# 🔍 Comparação: Banco de Dados - Desenvolvimento vs Produção

## 📊 Configurações Comparativas

### 🛠️ **DESENVOLVIMENTO (Docker Local)**

**Configuração:**
- **Host**: `localhost`
- **Porta**: `5432`
- **Usuário**: `postgres`
- **Senha**: `postgres`
- **Database**: `flowboard`
- **SSL**: Desabilitado
- **Conexão**: Via Docker Compose

**Arquivo**: `docker-compose.yml`
```yaml
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
POSTGRES_DB: flowboard
```

**Status**: ✅ **FUNCIONANDO CORRETAMENTE**

---

### 🚀 **PRODUÇÃO (Render)**

**Configuração:**
- **Hostname**: `dpg-d3igg4pr0fns73csoke0-a.oregon-postgres.render.com`
- **Porta**: `5432`
- **Usuário**: `flowboard_ftay_user`
- **Senha**: `LKERD3cqLZ0nTNorfdex2hLkKaKiRVt3`
- **Database**: `flowboard_ftay`
- **SSL**: **OBRIGATÓRIO** (Render requer SSL)
- **Conexão**: Via `DATABASE_URL`

**DATABASE_URL (Internal - USAR ESTA no Render):**
```
postgresql://flowboard_ftay_user:LKERD3cqLZOnTNorfdex2hLkKaKiRVt3@dpg-d3igg4pr0fns73csoke0-a/flowboard_ftay
```
⚠️ **IMPORTANTE**: Use a **Internal Database URL** porque o backend está rodando no Render. É mais rápida e não passa pela internet pública.

**DATABASE_URL (External - para uso externo/local):**
```
postgresql://flowboard_ftay_user:LKERD3cqLZOnTNorfdex2hLkKaKiRVt3@dpg-d3igg4pr0fns73csoke0-a.oregon-postgres.render.com/flowboard_ftay
```
⚠️ **NOTA**: Use a **External Database URL** apenas se estiver conectando de fora do Render (ex: scripts locais, migrações locais).

**Status**: ❌ **NÃO ESTÁ FUNCIONANDO**

---

## 🔴 **PROBLEMAS IDENTIFICADOS**

### 1. **data-source.ts não aceita DATABASE_URL**
O arquivo `backend/src/data-source.ts` está configurado apenas para variáveis individuais (`DB_HOST`, `DB_PORT`, etc.), mas o Render usa `DATABASE_URL`.

**Impacto**: Migrações não funcionam em produção.

### 2. **Possível problema de SSL**
O Render requer SSL para conexões, mas o `data-source.ts` não tem configuração SSL.

**Impacto**: Conexão pode falhar durante migrações.

### 3. **Tabelas podem não existir**
Se as migrações não foram executadas, as tabelas não existem no banco de produção.

**Impacto**: Aplicação não consegue salvar dados porque não há tabelas.

---

## ✅ **SOLUÇÕES APLICADAS**

### ✅ 1. Corrigido `data-source.ts` para aceitar `DATABASE_URL`
- Agora aceita `DATABASE_URL` (usado pelo Render)
- Fallback para variáveis individuais (desenvolvimento local)

### ✅ 2. Adicionado suporte SSL no `data-source.ts`
- SSL habilitado quando `NODE_ENV=production` ou quando `DATABASE_URL` está presente
- Configuração: `{ rejectUnauthorized: false }` (necessário para Render)

### ⚠️ 3. Verificar se `DATABASE_URL` está configurado corretamente no Render
- No Render, **DEVE** usar a **Internal Database URL**:
  ```
  postgresql://flowboard_ftay_user:LKERD3cqLZOnTNorfdex2hLkKaKiRVt3@dpg-d3igg4pr0fns73csoke0-a/flowboard_ftay
  ```
- **NÃO** use a External Database URL no Render (é mais lenta e desnecessária)
- A Internal URL é mais rápida porque não passa pela internet pública
- Verifique no painel do Render → Environment Variables → `DATABASE_URL`

### ⚠️ 4. Executar migrações no banco de produção
- Após o deploy, execute: `npm run migration:run`
- Ou use o script: `run-migrations-render.ps1`

---

## 📝 **Variáveis de Ambiente no Render**

Atualmente configuradas no Render:
- ✅ `DATABASE_URL` - Configurada (mas pode estar usando Internal URL)
- ✅ `NODE_ENV` - `production`
- ✅ `FRONTEND_URL` - `https://flow-board-peach.vercel.app`
- ✅ `JWT_SECRET` - Configurada
- ✅ `SEED_SAMPLE_DATA` - `false`

---

## 🔧 **PRÓXIMOS PASSOS**

### ✅ 1. Código corrigido
- `data-source.ts` agora aceita `DATABASE_URL` com SSL
- `app.module.ts` já estava configurado corretamente

### ⚠️ 2. Verificar `DATABASE_URL` no Render
**IMPORTANTE**: No painel do Render, verifique se a variável `DATABASE_URL` está configurada com a **Internal Database URL**:

```
postgresql://flowboard_ftay_user:LKERD3cqLZOnTNorfdex2hLkKaKiRVt3@dpg-d3igg4pr0fns73csoke0-a/flowboard_ftay
```

**Como verificar:**
1. Acesse o painel do Render
2. Vá em **flowboard-backend** → **Environment**
3. Procure por `DATABASE_URL`
4. Se estiver usando a External URL (com `.oregon-postgres.render.com`), **altere para a Internal URL** (sem o domínio)

### ⚠️ 3. Executar migrações no banco de produção
Após verificar/atualizar a `DATABASE_URL`, execute as migrações:
- Opção 1: Via script local (use External URL):
  ```powershell
  .\run-migrations-render.ps1
  ```
- Opção 2: Via Render (SSH/Render Shell):
  ```bash
  npm run migration:run
  ```

### ⚠️ 4. Verificar logs do backend no Render
Após o deploy, verifique os logs:
- Se houver erro de conexão: `DATABASE_URL` pode estar incorreta
- Se houver erro de tabelas não encontradas: migrações não foram executadas
- Se `synchronize: true` estiver ativo, pode criar tabelas automaticamente (mas não é recomendado em produção)

---

## 📋 **CHECKLIST DE VERIFICAÇÃO**

- [ ] `DATABASE_URL` no Render está usando a **Internal Database URL**?
- [ ] `DATABASE_URL` termina com `/flowboard_ftay`?
- [ ] Migrações foram executadas no banco de produção?
- [ ] Logs do backend não mostram erros de conexão?
- [ ] Tabelas foram criadas no banco de produção?
- [ ] Aplicação está salvando dados corretamente?

