import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { explainDbError, initDatabase } from './db/database.js';
import { seed } from './db/seed.js';
import { plantRoutes } from './plantRoutes.js';
import { initWebSocket } from './websocket.js';

const PORT = Number(process.env.PORT ?? 3000);

const app = express();
// Log every request, e.g. "PUT /api/plants/1 -> 200"
app.use((req, res, next) => {
  res.on('finish', () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
  next();
});

app.use(cors());          // allow the Ionic app (different port) to call the API
app.use(express.json());  // parse JSON request bodies into req.body

app.get('/', (req, res) => res.json({ message: 'Plant Tracker API is running. Try GET /api/plants' }));
app.use('/api/plants', plantRoutes);


app.use((err, req, res, next) => {
  const badData = ['ER_CHECK_CONSTRAINT_VIOLATED', 'ER_TRUNCATED_WRONG_VALUE', 'ER_BAD_NULL_ERROR', 'ER_DATA_TOO_LONG'];
  if (badData.includes(err.code)) {
    return res.status(400).json({ message: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

try {
  await initDatabase();
  const inserted = await seed();
  if (inserted) console.log(`Empty database: inserted ${inserted} sample plants.`);
} catch (err) {
  console.error(`Could not connect to MySQL.\n${explainDbError(err)}`);
  process.exit(1);
}

const server = createServer(app);
initWebSocket(server);
server.listen(PORT, () => {
  console.log(`REST API:  http://localhost:${PORT}/api/plants`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});
