import { Plant, PlantEvent } from './Plant';

// The backend runs on port 3000 of the same computer that serves this page.
const SERVER = `${window.location.hostname}:3000`;
const API_URL = `http://${SERVER}/api/plants`;
const WS_URL = `ws://${SERVER}`;

// A random id for this copy of the app (every browser tab / phone gets its own).
// It's sent with every request, and the server puts it in the WebSocket message
// as "from", so we can tell our own changes apart from other devices' changes.
export const CLIENT_ID = Math.random().toString(36).slice(2, 10);

// Sends a request and turns server errors into readable Error messages.
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Client-Id': CLIENT_ID },
    });
  } catch {
    throw new Error('Cannot reach the server. Start the backend with "npm start" in lab1/backend.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed with status ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

// ---- REST: the four CRUD operations ----

export const getPlants = () =>
    request<Plant[]>(API_URL);

export const createPlant = (plant: Plant) =>
    request<Plant>(API_URL, { method: 'POST', body: JSON.stringify(plant) });

export const updatePlant = (plant: Plant) =>
    request<Plant>(`${API_URL}/${plant.id}`, { method: 'PUT', body: JSON.stringify(plant) });

export const deletePlant = (id: number) =>
    request<void>(`${API_URL}/${id}`, { method: 'DELETE' });

// ---- WebSocket: live notifications ----

// Calls onEvent for every change the server announces, and onStatus when the
// connection opens or drops. Reconnects every 3 seconds if the server goes away.
// Returns a function that closes the connection for good.
export function listenToPlantEvents(
    onEvent: (event: PlantEvent) => void,
    onStatus: (connected: boolean) => void,
): () => void {
  let socket: WebSocket;
  let retryTimer: number | undefined;
  let stopped = false;

  const connect = () => {
    socket = new WebSocket(WS_URL);
    socket.onopen = () => onStatus(true);
    socket.onmessage = (message) => onEvent(JSON.parse(message.data));
    socket.onclose = () => {
      onStatus(false);
      if (!stopped) retryTimer = window.setTimeout(connect, 3000);
    };
  };
  connect();

  return () => {
    stopped = true;
    window.clearTimeout(retryTimer);
    socket.close();
  };
}