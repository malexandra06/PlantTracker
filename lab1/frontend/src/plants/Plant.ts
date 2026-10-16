// The shape of a plant, exactly as the backend sends it.
export interface Plant {
  id?: number;                   // missing for a plant that isn't saved yet
  name: string;
  species?: string | null;
  location?: string | null;
  wateringIntervalDays: number;
  lastWatered?: string | null;   // 'YYYY-MM-DD'
  nextWatering?: string | null;  // calculated by the server
  isIndoor: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

// A message the server pushes over the WebSocket when any client changes a plant.
export interface PlantEvent {
  type: 'created' | 'updated' | 'deleted';
  payload: Plant;
  from?: string; // id of the app instance that made the change
}