# FlowBoard

This repository contains a NestJS backend and a Next.js frontend. Follow the steps below to set up the development environment.

## Install dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Start services

First, start the PostgreSQL database using Docker Compose:
```bash
docker-compose up -d
```

Next, run the Nest backend in development mode:
```bash
cd backend
npm run start:dev
```

## Run the frontend

Before starting the frontend, set the API URL so that the Next.js application knows where to send requests:
```bash
export NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Then run the development server:
```bash
cd frontend
npm run dev
```

If the backend is not running or the API URL is misconfigured, the frontend will show `ERR_CONNECTION_REFUSED` when it tries to call the API.