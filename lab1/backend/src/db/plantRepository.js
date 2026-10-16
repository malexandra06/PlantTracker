import { pool } from './database.js';

const COLUMNS = `
  id, name, species, location, watering_interval_days, last_watered,
  is_indoor, notes, created_at, updated_at, version,
  DATE_ADD(last_watered, INTERVAL watering_interval_days DAY) AS next_watering
`;


const toIsoUtc = (value) => (value ? `${value.replace(' ', 'T')}Z` : null);

function toPlant(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    species: row.species,
    location: row.location,
    wateringIntervalDays: row.watering_interval_days,
    lastWatered: row.last_watered,
    nextWatering: row.next_watering,
    isIndoor: row.is_indoor === 1,
    notes: row.notes,
    createdAt: toIsoUtc(row.created_at),
    updatedAt: toIsoUtc(row.updated_at),
    version: row.version,
  };
}


function toParams(plant) {
  return {
    name: plant.name ?? null,
    species: plant.species ?? null,
    location: plant.location ?? null,
    wateringIntervalDays: plant.wateringIntervalDays ?? 7,
    // Ionic date pickers may send '2026-10-10T08:00:00'; a DATE column only needs '2026-10-10'
    lastWatered: plant.lastWatered ? String(plant.lastWatered).slice(0, 10) : null,
    isIndoor: (plant.isIndoor ?? true) ? 1 : 0,
    notes: plant.notes ?? null,
  };
}

export const plantRepository = {
  async findAll() {
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM plants ORDER BY name`);
    return rows.map(toPlant);
  },

  async findById(id) {
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM plants WHERE id = :id`, { id });
    return toPlant(rows[0]);
  },

  async create(plant) {
    const [result] = await pool.execute(
      `INSERT INTO plants (name, species, location, watering_interval_days, last_watered, is_indoor, notes)
       VALUES (:name, :species, :location, :wateringIntervalDays, :lastWatered, :isIndoor, :notes)`,
      toParams(plant),
    );
    return this.findById(result.insertId);
  },

  async update(id, changes) {
    const existing = await this.findById(id);
    if (!existing) return null;
    await pool.execute(
      `UPDATE plants SET
         name = :name,
         species = :species,
         location = :location,
         watering_interval_days = :wateringIntervalDays,
         last_watered = :lastWatered,
         is_indoor = :isIndoor,
         notes = :notes,
         updated_at = UTC_TIMESTAMP(3),
         version = version + 1
       WHERE id = :id`,
      { ...toParams({ ...existing, ...changes }), id },
    );
    return this.findById(id);
  },

  async remove(id) {
    const existing = await this.findById(id);
    if (!existing) return null;
    await pool.execute('DELETE FROM plants WHERE id = :id', { id });
    return existing;
  },
};
