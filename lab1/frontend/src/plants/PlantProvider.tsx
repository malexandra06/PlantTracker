import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import { useIonToast } from '@ionic/react';
import { addCircleOutline, createOutline, trashOutline } from 'ionicons/icons';
import { Plant, PlantEvent } from './Plant';
import * as api from './plantApi';

// Keeps the list of plants for the whole app and keeps it in sync with the
// server: loads it over REST, then applies changes pushed over the WebSocket.

interface PlantState {
  plants: Plant[];
  loading: boolean;
  loadError?: string;
  connected: boolean; // is the WebSocket open (live updates on)?
}

type Action =
    | { type: 'LOAD_STARTED' }
    | { type: 'LOAD_SUCCEEDED'; plants: Plant[] }
    | { type: 'LOAD_FAILED'; error: string }
    | { type: 'PLANT_SAVED'; plant: Plant }
    | { type: 'PLANT_DELETED'; id: number }
    | { type: 'CONNECTION_CHANGED'; connected: boolean };

const byName = (a: Plant, b: Plant) => a.name.localeCompare(b.name);

function reducer(state: PlantState, action: Action): PlantState {
  switch (action.type) {
    case 'LOAD_STARTED':
      return { ...state, loading: true, loadError: undefined };
    case 'LOAD_SUCCEEDED':
      return { ...state, loading: false, plants: [...action.plants].sort(byName) };
    case 'LOAD_FAILED':
      return { ...state, loading: false, loadError: action.error };
    case 'PLANT_SAVED': {
      // Replace the plant if we have it, otherwise add it. The same change can
      // arrive twice (HTTP response + WebSocket), and that's fine.
      const others = state.plants.filter((p) => p.id !== action.plant.id);
      return { ...state, plants: [...others, action.plant].sort(byName) };
    }
    case 'PLANT_DELETED':
      return { ...state, plants: state.plants.filter((p) => p.id !== action.id) };
    case 'CONNECTION_CHANGED':
      return { ...state, connected: action.connected };
  }
}

// What the notification says and shows for each kind of change.
const notices = {
  created: { verb: 'added', icon: addCircleOutline },
  updated: { verb: 'updated', icon: createOutline },
  deleted: { verb: 'deleted', icon: trashOutline },
};

interface PlantContextValue extends PlantState {
  savePlant: (plant: Plant) => Promise<Plant>;
  deletePlant: (id: number) => Promise<void>;
}

const PlantContext = createContext<PlantContextValue | null>(null);

export const PlantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { plants: [], loading: true, connected: false });
  const needsReload = useRef(false); // true after a failed load or a dropped connection

  // Shows a pop-up when ANOTHER device changed a plant (kept in a ref so the
  // WebSocket effect below doesn't have to reconnect when it changes).
  const [presentToast] = useIonToast();
  const notify = useRef<(event: PlantEvent) => void>(() => {});
  notify.current = (event: PlantEvent) => {
    if (event.from === api.CLIENT_ID) return; // our own change: no pop-up
    const { verb, icon } = notices[event.type];
    presentToast({
      message: `${event.payload.name} was ${verb} on another device`,
      icon,
      duration: 3000,
      position: 'top',
      swipeGesture: 'vertical',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
  };

  const loadPlants = useCallback(async () => {
    dispatch({ type: 'LOAD_STARTED' });
    try {
      dispatch({ type: 'LOAD_SUCCEEDED', plants: await api.getPlants() });
      needsReload.current = false;
    } catch (err) {
      dispatch({ type: 'LOAD_FAILED', error: (err as Error).message });
      needsReload.current = true;
    }
  }, []);

  useEffect(() => {
    loadPlants();
    const stopListening = api.listenToPlantEvents(
        (event) => {
          // 1. update the list
          if (event.type === 'deleted') dispatch({ type: 'PLANT_DELETED', id: event.payload.id! });
          else dispatch({ type: 'PLANT_SAVED', plant: event.payload });
          // 2. tell the user, if the change came from another device
          notify.current(event);
        },
        (connected) => {
          dispatch({ type: 'CONNECTION_CHANGED', connected });
          if (!connected) needsReload.current = true;
          // Back online: reload, in case we missed changes while disconnected.
          else if (needsReload.current) loadPlants();
        },
    );
    return stopListening;
  }, [loadPlants]);

  const savePlant = useCallback(async (plant: Plant) => {
    const saved = plant.id ? await api.updatePlant(plant) : await api.createPlant(plant);
    dispatch({ type: 'PLANT_SAVED', plant: saved });
    return saved;
  }, []);

  const deletePlant = useCallback(async (id: number) => {
    await api.deletePlant(id);
    dispatch({ type: 'PLANT_DELETED', id });
  }, []);

  return (
      <PlantContext.Provider value={{ ...state, savePlant, deletePlant }}>
        {children}
      </PlantContext.Provider>
  );
};

export function usePlants(): PlantContextValue {
  const context = useContext(PlantContext);
  if (!context) throw new Error('usePlants must be used inside <PlantProvider>');
  return context;
}