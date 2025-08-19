# 🚀 Guia de Deploy - FlowBoard

## 📋 Pré-requisitos

- Conta no GitHub com o repositório FlowBoard
- Conta no [Render.com](https://render.com) (gratuita)
- Conta no [Vercel.com](https://vercel.com) (gratuita)

## 🔧 Passo 1: Preparar o Repositório

1. **Commit e Push das mudanças**
   ```bash
   git add .
   git commit -m "Configuração para deploy em produção"
   git push origin main
   ```

## 🌐 Passo 2: Deploy do Backend (Render)

### 2.1 Criar conta no Render
- Acesse [render.com](https://render.com)
- Clique em "Get Started"
- Faça login com GitHub

### 2.2 Criar Web Service
1. Clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub
3. Selecione o repositório **FlowBoard**
4. Clique em **"Connect"**

### 2.3 Configurar o Serviço
- **Name**: `flowboard-backend`
- **Environment**: `Node`
- **Region**: Escolha a mais próxima (ex: São Paulo)
- **Branch**: `main`
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && npm run start:prod`
- **Plan**: `Free`

### 2.4 Configurar Variáveis de Ambiente
Clique em **"Environment"** e adicione:

| Key | Value | Descrição |
|-----|-------|-----------|
| `NODE_ENV` | `production` | Ambiente de produção |
| `DATABASE_URL` | `postgresql://...` | URL do banco PostgreSQL |
| `JWT_SECRET` | `sua-chave-secreta-123` | Chave para JWT (use uma forte) |
| `SEED_SAMPLE_DATA` | `false` | Não criar dados de exemplo |
| `FRONTEND_URL` | `https://seu-projeto.vercel.app` | URL do frontend (será configurada depois) |

### 2.5 Criar Banco PostgreSQL (Opcional)
1. No Render, vá em **"New +"** → **"PostgreSQL"**
2. **Name**: `flowboard-db`
3. **Database**: `flowboard`
4. **User**: `flowboard_user`
5. **Plan**: `Free`
6. Copie a **Internal Database URL** para `DATABASE_URL`

### 2.6 Deploy
1. Clique em **"Create Web Service"**
2. Aguarde o build (pode demorar 5-10 minutos)
3. Anote a URL: `https://flowboard-backend.onrender.com`

## 🎨 Passo 3: Deploy do Frontend (Vercel)

### 3.1 Criar conta no Vercel
- Acesse [vercel.com](https://vercel.com)
- Clique em **"Continue with GitHub"**
- Autorize o Vercel

### 3.2 Importar Projeto
1. Clique em **"New Project"**
2. Selecione o repositório **FlowBoard**
3. Framework: **Next.js** (deve ser detectado automaticamente)
4. Clique em **"Deploy"**

### 3.3 Configurar Variáveis de Ambiente
1. No projeto criado, vá em **"Settings"** → **"Environment Variables"**
2. Adicione:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://flowboard-backend.onrender.com`
   - **Environment**: `Production` (selecionado)
3. Clique em **"Save"**

### 3.4 Redeploy
1. Vá em **"Deployments"**
2. Clique nos **3 pontos** do último deploy
3. **"Redeploy"**
4. Aguarde o novo deploy

## 🔗 Passo 4: Conectar Frontend e Backend

### 4.1 Atualizar FRONTEND_URL no Backend
1. No Render, vá no seu serviço backend
2. **"Environment"**
3. Atualize `FRONTEND_URL` com a URL do Vercel
4. Clique em **"Save Changes"**
5. O serviço será reiniciado automaticamente

### 4.2 Testar Conexão
1. Acesse seu frontend no Vercel
2. Tente fazer login
3. Verifique se está conectando com o backend

## ✅ Passo 5: Verificar Funcionamento

### 5.1 Testes Básicos
- [ ] Frontend carrega sem erros
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Criação de tasks funciona
- [ ] Upload de arquivos funciona

### 5.2 Verificar Logs
- **Backend**: Render → Seu serviço → "Logs"
- **Frontend**: Vercel → Seu projeto → "Functions" → Logs

## 🚨 Troubleshooting

### Backend não inicia
```
Erro: Cannot connect to database
```
**Solução**: Verifique se `DATABASE_URL` está correto

### Frontend não conecta
```
ERR_CONNECTION_REFUSED
```
**Solução**: Confirme se `NEXT_PUBLIC_API_URL` está correto

### Erro de CORS
```
Access to fetch at '...' from origin '...' has been blocked
```
**Solução**: Verifique se `FRONTEND_URL` está configurado no backend

### Build falha
```
Build failed
```
**Solução**: Verifique os logs no Render/Vercel para detalhes

## 🔄 Atualizações Futuras

Para atualizar o sistema:
1. Faça alterações no código
2. Commit e push para GitHub
3. Render e Vercel fazem deploy automático
4. Aguarde 2-5 minutos

## 📞 Suporte

- **Render**: [docs.render.com](https://docs.render.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub**: [github.com](https://github.com)

## 🎯 URLs Finais

- **Frontend**: `https://seu-projeto.vercel.app`
- **Backend**: `https://flowboard-backend.onrender.com`
- **API Health**: `https://flowboard-backend.onrender.com/health`

---

**🎉 Parabéns! Seu FlowBoard está rodando em produção!**
