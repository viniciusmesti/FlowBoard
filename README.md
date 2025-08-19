# FlowBoard - Sistema de Gerenciamento de Projetos

Sistema completo de gerenciamento de projetos com backend NestJS e frontend Next.js.

## 🚀 Deploy em Produção

### Backend (Render)

1. **Criar conta no Render**
   - Acesse [render.com](https://render.com)
   - Faça login ou crie uma conta

2. **Criar novo Web Service**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub
   - Selecione o repositório FlowBoard

3. **Configurar o serviço**
   - **Name**: `flowboard-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Plan**: Free

4. **Configurar variáveis de ambiente**
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: Sua URL do PostgreSQL (pode usar o Render PostgreSQL)
   - `JWT_SECRET`: Uma chave secreta forte para JWT
   - `SEED_SAMPLE_DATA`: `false`

5. **Criar banco PostgreSQL (opcional)**
   - No Render, vá em "New +" → "PostgreSQL"
   - Configure e copie a URL para `DATABASE_URL`

6. **Deploy**
   - Clique em "Create Web Service"
   - Aguarde o build e deploy

### Frontend (Vercel)

1. **Criar conta no Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com GitHub

2. **Importar projeto**
   - Clique em "New Project"
   - Importe o repositório FlowBoard
   - Framework: Next.js

3. **Configurar variáveis de ambiente**
   - `NEXT_PUBLIC_API_URL`: URL do seu backend no Render
   - Exemplo: `https://flowboard-backend.onrender.com`

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build e deploy

## 🔧 Configuração Local

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis no .env
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure NEXT_PUBLIC_API_URL no .env.local
npm run dev
```

## 📁 Estrutura do Projeto

```
FlowBoard/
├── backend/                 # API NestJS
│   ├── src/
│   ├── package.json
│   └── render.yaml         # Configuração Render
├── frontend/               # App Next.js
│   ├── src/
│   ├── package.json
│   └── vercel.json         # Configuração Vercel
└── README.md
```

## 🌐 URLs de Produção

- **Frontend**: `https://seu-projeto.vercel.app`
- **Backend**: `https://flowboard-backend.onrender.com`

## 🔒 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=sua-chave-secreta
NODE_ENV=production
SEED_SAMPLE_DATA=false
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://flowboard-backend.onrender.com
```

## 📝 Notas Importantes

1. **Banco de dados**: Use PostgreSQL em produção (Render oferece gratuitamente)
2. **JWT Secret**: Use uma chave forte e única em produção
3. **CORS**: O backend já está configurado para aceitar requisições do frontend
4. **Uploads**: Os arquivos são salvos localmente no backend (considere usar S3 para produção)

## 🚨 Troubleshooting

### Backend não inicia
- Verifique se `DATABASE_URL` está correto
- Confirme se o banco está acessível
- Verifique os logs no Render

### Frontend não conecta com backend
- Confirme se `NEXT_PUBLIC_API_URL` está correto
- Verifique se o backend está rodando
- Teste a URL do backend diretamente no navegador

### Erro de CORS
- O backend já está configurado para aceitar requisições do Vercel
- Se persistir, verifique se a URL do frontend está na whitelist

## 🔄 Atualizações

Para atualizar o sistema:
1. Faça push para o GitHub
2. Render e Vercel fazem deploy automático
3. Aguarde alguns minutos para as mudanças aparecerem