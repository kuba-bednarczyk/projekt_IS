# System Integracji i Analizy Danych Rynku Nieruchomości

Aplikacja webowa typu Full-Stack służąca do analizy i wizualizacji danych z rynku nieruchomości w zestawieniu ze stopami procentowymi NBP. System realizuje pełne operacje CRUD na wielu powiązanych tabelach (m.in. Miasta, Ceny mieszkań, Stopy procentowe, Użytkownicy). 
Aplikacja została zaprojektowana w architekturze mikroserwisowej i skonteneryzowana za pomocą technologii Docker.

## 1. Główne funkcjonalności:
- **Zaawansowany pulpit analityczny:** Dynamiczne generowanie wykresów z wykorzystaniem filtracji po latach i kwartałach.
- **Zarządzanie Użytkownikami (Admin Panel):** Pełny CRUD (tworzenie, edycja z uploadem awatara, usuwanie, podgląd).
- **Import/Eksport Danych:** Importowanie raportów z plików XML do bazy oraz eksportowanie gotowych analiz do formatów JSON, YAML i XML.
- **Zabezpieczenia:** Autoryzacja bazująca na tokenach JWT (HttpOnly Cookies), szyfrowanie haseł (Bcrypt) i walidacja danych (Zod).

## 2. Użyte Technologie:

1. **Frontend (`/frontend`)**: React.js, Vite, Recharts (Wizualizacja danych), Tailwind CSS, shadcn/ui (Stylowanie).
2. **Backend (`/backend`)**: Node.js, Express.js, Prisma ORM, Zod (Walidacja), JWT & BCrypt (Autoryzacja).
3. **Baza danych**: PostgreSQL (tabele: `City`, `HousingPrice`, `InterestRate`, `User`).

## 3. Struktura projektu:

```bash
├── backend
│   ├── import.js
│   ├── package-lock.json
│   ├── package.json
│   ├── prisma
│   │   ├── README.md
│   │   └── schema.prisma
│   ├── prisma.config.js
│   ├── src
│   │   ├── config
│   │   │   └── db.js
│   │   ├── generated
│   │   │   └── prisma
│   │   ├── middleware
│   │   │   └── auth.js
│   │   ├── routes
│   │   │   ├── authRoutes.js
│   │   │   ├── dataRoutes.js
│   │   │   ├── exportRoutes.js
│   │   │   ├── importRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── server.js
│   │   ├── services
│   │   │   ├── importHousingPrices.js
│   │   │   ├── importInterestRates.js
│   │   │   └── reportService.js
│   │   └── validations
│   │       ├── dataSchemas.js
│   │       ├── exportSchemas.js
│   │       ├── importSchemas.js
│   │       └── userSchemas.js
│   └── usersSeed.js
├── frontend
│   ├── components.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── jsconfig.json
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── README.md
│   ├── src
│   │   ├── App.jsx
│   │   ├── assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components
│   │   │   ├── admin
│   │   │   ├── charts
│   │   │   ├── dashboard
│   │   │   ├── layout
│   │   │   └── ui
│   │   ├── hooks
│   │   │   ├── useCurrentUser.js
│   │   │   ├── useDashboardData.js
│   │   │   └── useDashboardMath.js
│   │   ├── index.css
│   │   ├── lib
│   │   │   └── utils.js
│   │   ├── main.jsx
│   │   └── pages
│   │       ├── Account.jsx
│   │       ├── AdminPanel.jsx
│   │       ├── Calculator.jsx
│   │       ├── Dashboard.jsx
│   │       ├── Login.jsx
│   │       └── Register.jsx
│   └── vite.config.js
└── README.md
```

## 4. Instrukcja uruchomienia (Docker)

System jest w pełni przystosowany do uruchomienia w odizolowanych kontenerach. Konfiguracja dzieli aplikację na 3 niezależne warstwy sieciowe: bazę danych, backend oraz frontend.

### Sposób 1: Opcja z wykorzystaniem docker-compose (Zalecane)
Najszybszy sposób na uruchomienie całego środowiska.
1. Upewnij się, że porty 3000, 5173 oraz 5432 są wolne w Twoim systemie.
2. W głównym katalogu projektu uruchom komendę:
   ```bash
   [MIEJSCE NA KOMENDE DOCKER COMPOSE: np. docker-compose up -d --build]
   ```
3. Aplikacja będzie dostępna pod adresem: `http://localhost:[PORT_FRONTENDU]`

### Sposób 2: Opcja z wykorzystaniem Docker CLI
Jeśli wolisz uruchomić poszczególne kontenery ręcznie, wykonaj poniższe kroki w terminalu:

**1. Konfiguracja sieci**

```bash
docker network create pern_network
```
**2. Uruchomienie Bazy danych**
```bash
docker run -d \
  --name db \
  --network pern_network \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=testPasswd123 \
  -e POSTGRES_DB=real_estate_db \
  -v pgdata:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine
```

**3. Zbudowanie obrazu dla Backendu:**
```bash
docker build -t backend ./backend
```
**4. Uruchomienie backendu:**
```bash
docker run -d \
  --name backend \
  --network pern_network \
  -e PORT=3000 \
  -e JWT_SECRET=TwojTajnyKluczJWT \
  -e DATABASE_URL="postgresql://admin:testPasswd123@db:5432/real_estate_db?schema=public" \
  -p 3000:3000 \
  backend
```

**5. Zbudowanie obrazu dla Frontendu:**
```bash
docker build -t frontend ./frontend
```

**6. Uruchomienie Frontendu:**
```bash
docker run -d \
  --name frontend \
  --network pern_network \
  -p 80:80 \
  frontend
```

** przy ponownym załadowaniu skryptu należy usunąć wolumen pgdata