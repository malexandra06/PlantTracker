import { Router } from 'express';
import { plantRepository } from './db/plantRepository.js';
import { broadcast } from './websocket.js';

export const plantRoutes = Router();

// Returns an error message, or null if the plant data is valid.
function validate(plant) {
  if (typeof plant.name !== 'string' || plant.name.trim() === '') {
    return 'Name is required';
  }
  if (plant.wateringIntervalDays !== undefined) {
    const days = Number(plant.wateringIntervalDays);
    if (!Number.isInteger(days) || days < 1) return 'Watering interval must be a whole number of days, at least 1';
  }
  if (plant.lastWatered && Number.isNaN(Date.parse(plant.lastWatered))) {
    return 'Last watered must be a valid date';
  }
  return null;
}

// GET /api/plants -> all plants
plantRoutes.get('/', async (req, res) => {
  res.json(await plantRepository.findAll());
});

// GET /api/plants/3 -> one plant
plantRoutes.get('/:id', async (req, res) => {
  const plant = await plantRepository.findById(req.params.id);
  if (!plant) return res.status(404).json({ message: 'Plant not found' });
  res.json(plant);
});

// POST /api/plants -> create a plant
plantRoutes.post('/', async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  const plant = await plantRepository.create(req.body);
  broadcast('created', plant, req.get('X-Client-Id'));
  res.status(201).json(plant);
});

// PUT /api/plants/3 -> update a plant
plantRoutes.put('/:id', async (req, res) => {
  const error = validate(req.body);
  if (error) return res.status(400).json({ message: error });

  const plant = await plantRepository.update(req.params.id, req.body);
  if (!plant) return res.status(404).json({ message: 'Plant not found' });
  broadcast('updated', plant, req.get('X-Client-Id'));
  res.json(plant);
});

// DELETE /api/plants/3 -> delete a plant
plantRoutes.delete('/:id', async (req, res) => {
  const plant = await plantRepository.remove(req.params.id);
  if (!plant) return res.status(404).json({ message: 'Plant not found' });
  broadcast('deleted', plant, req.get('X-Client-Id'));
  res.status(204).end();
});