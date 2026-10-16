# Lab 1 – Plant Tracker

Two separate projects:

- `backend/` – Express REST API + WebSocket notifications, data in MySQL
- `frontend/` – Ionic React app (list of plants, add / edit / delete, live updates)

## Run it

You need Node.js 22+ and MySQL running on your computer.

1. Open `backend/.env` and set `DB_PASSWORD` to your MySQL root password.
2. Backend (first terminal):
   ```
   cd backend
   npm install
   npm start
   ```
   On the first start it creates the `plant_tracker` database, the `plants` table and 4 sample plants.
3. Frontend (second terminal):
   ```
   cd frontend
   npm install
   npm run dev
   ```
4. Open http://localhost:8100

To see the live updates, open the app in two browser windows side by side and change a plant in one of them.

## REST API (http://localhost:3000)

| Method | URL               | What it does                  |
|--------|-------------------|-------------------------------|
| GET    | /api/plants       | list all plants               |
| GET    | /api/plants/:id   | get one plant                 |
| POST   | /api/plants       | create a plant (JSON body)    |
| PUT    | /api/plants/:id   | update a plant (JSON body)    |
| DELETE | /api/plants/:id   | delete a plant                |

## WebSocket (ws://localhost:3000)

After every create, update or delete the server sends this to all connected apps:

```json
{ "type": "created" | "updated" | "deleted", "payload": { "id": 1, "name": "Monstera", ... } }
```

## Useful commands

- `npm run dev` in `backend/` – restarts the server automatically when you change code
- `npm run db:reset` in `backend/` – deletes all plants and puts the 4 sample plants back
