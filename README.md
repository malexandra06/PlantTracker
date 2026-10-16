# Plant Tracker

Laboratorul 1 la Programare pentru dispozitive mobile (Ionic).

O aplicație simplă în care îmi țin evidența plantelor din casă: unde stau, la câte zile trebuie udate și când le-am udat ultima dată. Din data ultimei udări se calculează când urmează următoarea, iar în listă se vede direct care plantă a rămas în urmă.

Proiectul are două părți separate:

- `backend/` - server Express cu REST API și WebSocket, datele sunt în MySQL
- `frontend/` - aplicația Ionic (React + TypeScript)

## Ce face

- listează plantele, fiecare cu un badge pentru udare ("Water today", "2 days late", "In 3 days" etc.)
- adăugare, editare și ștergere
- când o plantă e adăugată, modificată sau ștearsă de pe alt dispozitiv, lista se actualizează singură și apare o notificare sus
- dacă serverul se oprește, în dreapta sus apare "Offline"; când pornește din nou, aplicația se reconectează și reîncarcă lista
- dacă ai deschisă o plantă care între timp e ștearsă de pe alt dispozitiv, apare un mesaj și nu mai poți salva

## Ce trebuie instalat

- Node.js 22 sau mai nou
- MySQL 8 (eu am folosit și MySQL Workbench ca să mă uit în baza de date)

## Pornire

### Backend

În `backend/.env` trebuie pusă parola de la MySQL:

```
DB_PASSWORD=parola_ta
```

Restul setărilor (port, user, numele bazei de date) au deja valori care merg local.

```
cd backend
npm install
npm start
```

La prima pornire serverul creează singur baza de date `plant_tracker` și tabelul `plants`, apoi adaugă 4 plante de test. Nu trebuie rulat nimic manual în MySQL.

Mai sunt două comenzi utile:

- `npm run dev` - pornește serverul cu `--watch`, se restartează când modific codul
- `npm run db:reset` - golește tabelul și pune la loc plantele de test

### Frontend

```
cd frontend
npm install
npm run dev
```

Aplicația merge pe http://localhost:8100.

Partea de WebSocket se vede cel mai bine dacă deschizi aplicația în două ferestre una lângă alta și modifici ceva într-una din ele.

### Pe telefon

Telefonul și laptopul trebuie să fie în aceeași rețea Wi-Fi. Frontend-ul se pornește cu `npm run dev -- --host`, iar pe telefon se deschide `http://<ip-laptop>:8100`. Aplicația ia adresa serverului din adresa paginii, deci nu trebuie schimbat nimic în cod. Windows poate cere permisiune în firewall pentru Node.

## Structură

```
backend/src/
  server.js              pornește Express + WebSocket pe portul 3000
  plantRoutes.js         rutele CRUD și validarea
  websocket.js           trimite notificările la clienții conectați
  db/
    database.js          conexiunea la MySQL, creează baza de date
    schema.sql           tabelul plants
    plantRepository.js   toate query-urile SQL
    seed.js, reset.js    plantele de test

frontend/src/
  App.tsx                rutele: /plants, /plant (nou), /plant/:id (editare)
  plants/
    Plant.ts             interfața Plant
    plantApi.ts          apelurile REST + conexiunea WebSocket
    PlantProvider.tsx    starea aplicației (Context + useReducer)
    PlantList.tsx        pagina cu lista
    PlantEdit.tsx        pagina de adăugare / editare
    watering.ts          calculul pentru "Water today", "2 days late" etc.
```

## API

Serverul rulează pe http://localhost:3000.

```
GET    /api/plants        toate plantele
GET    /api/plants/:id    o plantă
POST   /api/plants        adaugă o plantă (201)
PUT    /api/plants/:id    modifică
DELETE /api/plants/:id    șterge (204)
```

Dacă datele nu sunt bune, serverul răspunde cu 400 și un mesaj, de ex. `{ "message": "Name is required" }`. Pentru un id care nu există răspunde cu 404.

O plantă arată așa:

```json
{
  "id": 1,
  "name": "Monstera",
  "species": "Monstera deliciosa",
  "location": "Living room",
  "wateringIntervalDays": 7,
  "lastWatered": "2026-10-05",
  "nextWatering": "2026-10-12",
  "isIndoor": true,
  "notes": "Likes bright, indirect light",
  "createdAt": "2026-10-10T17:41:26.445Z",
  "updatedAt": "2026-10-10T17:41:26.445Z",
  "version": 1
}
```

`nextWatering` nu e salvat în tabel, îl calculează MySQL la fiecare citire. `version` și `updatedAt` se schimbă la fiecare update (o să le folosesc mai târziu, la partea de offline).

## WebSocket

Merge pe același port, `ws://localhost:3000`. După fiecare POST, PUT sau DELETE reușit, serverul trimite la toți clienții un mesaj de forma:

```json
{ "type": "updated", "payload": { "id": 1, "name": "Monstera", "...": "..." }, "from": "k3j9x2ab" }
```

`type` poate fi `created`, `updated` sau `deleted`.

Fiecare instanță a aplicației își generează un id la pornire și îl trimite în header-ul `X-Client-Id` la fiecare request. Serverul îl pune în mesaj la `from`, așa că aplicația care a făcut modificarea nu își afișează singură notificarea. Celelalte actualizează lista și arată ceva de genul "Monstera was updated on another device".

## Note

- În development, în logul serverului apar câte două conexiuni WebSocket pentru fiecare tab. E din cauza `React.StrictMode`, care montează componentele de două ori; una dintre conexiuni se închide imediat.
- Request-urile `OPTIONS` din log sunt preflight-uri CORS, pentru că frontend-ul e pe 8100 și serverul pe 3000.
- Am rămas pe Ionic 8 cu React Router 5. Ionic 9 a schimbat partea de routing.

## De făcut

- autentificare (lab 2)
- mod offline, cu sincronizare când revine conexiunea
