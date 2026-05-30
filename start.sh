#!/bin/bash
read -sp "Wpisz bezpieczne hasło dla bazy PostgreSQL: " HASLO
echo ""
read -sp "Wpisz tajny klucz dla autoryzacji (JWT_SECRET): " JWT
echo ""

echo "Czyszczenie kontenerow"
docker stop frontend backend db 2>/dev/null
docker rm frontend backend db 2>/dev/null

echo "Konfiguracja sieci dockera"
docker network create network 2>/dev/null || true

echo "Uruchamianie bazy danych PostgreSQL"
docker run -d \
  --name db \
  --network network \
  --label com.docker.compose.project=app \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD="$HASLO" \
  -e POSTGRES_DB=real_estate_db \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

echo "Oczekiwanie na inicjalizację bazy danych - 5s"
sleep 5

echo "Budowanie i uruchamianie Backendu"
docker build -t backend ./backend
docker run -d \
  --name backend \
  --network network \
  --label com.docker.compose.project=app \
  -e PORT=3000 \
  -e JWT_SECRET="$JWT" \
  -e DATABASE_URL="postgresql://admin:$HASLO@db:5432/real_estate_db?schema=public" \
  -p 3000:3000 \
  backend

echo "Oczekiwanie na uruchomienie aplikacji Node.js - 2s"
sleep 2

echo "Migracja bazy danych"
docker exec backend npx prisma migrate deploy
echo "Seedowanie bazy danych"
docker exec backend node usersSeed.js

echo "Budowanie i uruchamianie Frontendu"
docker build -t frontend ./frontend
docker run -d \
  --name frontend \
  --network network \
  --label com.docker.compose.project=app \
  -p 80:80 \
  frontend

echo "DONE"
echo "NGINX: http://localhost"
echo "BACKEND: http://localhost:3000"
echo "DB PORT: 5432"