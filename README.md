# projekt_IS

TASKI: 

Instrukcja uruchomienia na teraz tj 15.05.2026
1. Pobranie kodu
git checkout main 
git pull origin main

2. nowy branch u ciebie
git checkout -b feature/data-endpoints  

2. .env.example -> .env takie dane jakie tam masz u siebie 
3. w folderze backend: npm install (bo wywalilem orma)
4. klucze 
npx prisma generate
5. serwer: npm run dev

- zobacz czy działają routy:
/api/prices, /api/cities
- dzialasz na dataRoutes.js 

/prices 
- ulepszyc go zeby przyjmowal w url daty od do 

/rates
- historia stop procentowych najlepiej tez z filtrowaniem od-do jakiejs daty rok lub rok i miesiac nawet jak sie da 

/calculator ???
- mozna zrobic endpoint jak starczy czasu ktory policzy kredyt na mieszkanie w danym okresie np.
cityId=1&year=2022&quarter=4&area=50&years=25
1. znalezc cene za metr kwadratowy w miescie 
2. cena/metr*metraz (cena mieszkania)
3. stopa procentowa z tego okresu
4. wyrzucic w jsonie np 
{
  "city": "Warszawa",
  "period": "2021 Q2",
  "totalPropertyPrice": 500000,
  "interestRateApplied": 2.10,
  "estimatedMonthlyInstallment": 2143.50 (rata miesieczna kredytu)
}
