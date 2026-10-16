# Plant Tracker

Lab 1 for Mobile Device Programming (Ionic).

A small app I use to keep track of my house plants: where they are, how often they need water and when I last watered them. The next watering date is calculated from the last one, so the list shows right away which plants are behind.

The project has two separate parts:

- `backend/` - Express server with a REST API and WebSocket, data is stored in MySQL
- `frontend/` - the Ionic app (React + TypeScript)

## What it does

- lists the plants, each with a watering badge ("Water today", "2 days late", "In 3 days" etc.)
- add, edit and delete plants
- when a plant is added, changed or deleted on another device, the list updates by itself and a notification shows up at the top
- if the server goes down, "Offline" appears in the top right corner; when it comes back, the app reconnects and reloads the list
- if you have a plant open and someone deletes it on another device, you get a message and can't save it anymore

## Requirements

- Node.js 22 or newer
- MySQL 8 (I also used MySQL Workbench to look at the data)

## Running it

### Backend

Put your MySQL password in `backend/.env`:

```
DB_PASSWORD=your_password
```

The other settings (port, user, database name) already have values that work locally.

```
cd backend
npm install
npm start
```

On the first start the server creates the `plant_tracker` database and the `plants` table, then adds 4 test plants. You don't need to run anything in MySQL by hand.

Two other useful commands:

- `npm run dev` - starts the server with `--watch`, so it restarts when I change the code
- `npm run db:reset` - empties the table and puts the test plants back

### Frontend

```
cd frontend
npm install
npm run dev
```

The app runs on http://localhost:8100.

The easiest way to see the WebSocket part is to open the app in two windows side by side and change something in one of them.

### On a phone

The phone and the laptop need to be on the same Wi-Fi. Start the frontend with `npm run dev -- --host` and open `http://<laptop-ip>:8100` on the phone. The app takes the server address from the page address, so nothing needs to change in the code. Windows may ask for a firewall permission for Node.

## Structure

```
backend/src/
  server.js              starts Express + WebSocket on port 3000
  plantRoutes.js         CRUD routes and validation
  websocket.js           sends notifications to connected clients
  db/
    database.js          MySQL connection, creates the database
    schema.sql           the plants table
    plantRepository.js   all the SQL queries
    seed.js, reset.js    test plants

frontend/src/
  App.tsx                routes: /plants, /plant (new), /plant/:id (edit)
  plants/
    Plant.ts             the Plant interface
    plantApi.ts          REST calls + WebSocket connection
    PlantProvider.tsx    app state (Context + useReducer)
    PlantList.tsx        list page
    PlantEdit.tsx        add / edit page
    watering.ts          logic for "Water today", "2 days late" etc.
```

## API

The server runs on http://localhost:3000.

```
GET    /api/plants        all plants
GET    /api/plants/:id    one plant
POST   /api/plants        add a plant (201)
PUT    /api/plants/:id    update
DELETE /api/plants/:id    delete (204)
```

If the data is not valid, the server answers with 400 and a message, e.g. `{ "message": "Name is required" }`. For an id that doesn't exist it answers with 404.

A plant looks like this:

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

`nextWatering` is not stored in the table, MySQL calculates it on every read. `version` and `updatedAt` change on every update (I'll use them later for the offline part).

## WebSocket

Same port, `ws://localhost:3000`. After every successful POST, PUT or DELETE the server sends this to all clients:

```json
{ "type": "updated", "payload": { "id": 1, "name": "Monstera", "...": "..." }, "from": "k3j9x2ab" }
```

`type` can be `created`, `updated` or `deleted`.

Every instance of the app generates an id when it starts and sends it in the `X-Client-Id` header with every request. The server puts it in the message as `from`, so the app that made the change doesn't show a notification to itself. The others update their list and show something like "Monstera was updated on another device".

## Notes

- In development the server log shows two WebSocket connections per tab. That's because of `React.StrictMode`, which mounts components twice; one of the connections closes right away.
- The `OPTIONS` requests in the log are CORS preflights, since the frontend is on 8100 and the server on 3000.
- I stayed on Ionic 8 with React Router 5. Ionic 9 changed the routing.

## To do

- authentication (lab 2)
- offline mode, with sync when the connection comes back
