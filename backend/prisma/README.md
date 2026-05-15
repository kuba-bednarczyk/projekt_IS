instalacja bazy

1. npm install
2. w folderze backend jezeli plik .env nie istnieje utworz go, uzupelnij zgodnie z instrukcja w env.example
3. npx prisma migrate dev --name "nazwa_migracji"
4. npx prism generate
5. node import.js z folderu backend
