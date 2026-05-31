# Dashboard UI redesign and features
_Exported on 29.05.2026 at 15:36:55 CEST from Cursor (3.5.33)_

---

**User**

cześć, musze przebudować ten dashboard, narazie pomoz w zaprogramowaniu nowego ui, musze dodać filtracje po datach od - do po latach i kwartalach zarowno z bazy jak i do samych wykresow, do tych samych wykresow tez musze dodac filtracje dat oraz poprawic wykres stop procentowych z cenami mieszkan za metr kwadratowy, zeby ceny nie startowaly od 0 tylko od najnizszej ceny. mozesz zachowac tą integracje z backendem ale musisz przebudowac to ui i dodac filtry, a pozatym:
- dodac przycisk import z xml - ktroy ma sie pojawiac jesli nie ma danych w bazie i byc "disabled" jesli są te dane, pozatym dodac gdzies przycisk eksportu (i tutaj wybor: do xml, do yaml, do jsona) - to ma byc przycisk do generowania takiego "raportu" w postaci wlasnie xml, yaml lub json - do wyboru
- na samym dole trzeba dodac przyciski eksportu tych wykresow do pdf/png 

---

**Cursor**

Zaczynam od przejrzenia obecnego Dashboardu i integracji z backendem.


Dodaję endpoint importu w backendzie oraz przebudowuję UI dashboardu z filtrami i eksportem.
