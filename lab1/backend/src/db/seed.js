import { pool } from './database.js';
import { plantRepository } from './plantRepository.js';

const samplePlants = [
  { name: 'Monstera', species: 'Monstera deliciosa', location: 'Living room',
    wateringIntervalDays: 7, lastWatered: '2026-10-05', isIndoor: true,
    notes: 'Likes bright, indirect light' },
  { name: 'Basil', species: 'Ocimum basilicum', location: 'Balcony',
    wateringIntervalDays: 2, lastWatered: '2026-10-09', isIndoor: false },
  { name: 'Snake plant', species: 'Dracaena trifasciata', location: 'Bedroom',
    wateringIntervalDays: 14, lastWatered: '2026-09-28', isIndoor: true,
    notes: 'Very forgiving, do not overwater' },
  { name: 'Lavender', species: 'Lavandula angustifolia', location: 'Garden',
    wateringIntervalDays: 5, lastWatered: null, isIndoor: false },
];


export async function seed({ reset = false } = {}) {
  const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM plants');
  if (count > 0 && !reset) return 0;

  await pool.query('TRUNCATE TABLE plants');
  for (const plant of samplePlants) {
    await plantRepository.create(plant);
  }
  return samplePlants.length;
}
