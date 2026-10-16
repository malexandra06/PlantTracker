import { Plant } from './Plant';

// Today's date as 'YYYY-MM-DD' in the phone's own timezone.
export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Turns the next watering date into a short status and a color for the badge.
export function wateringStatus(plant: Plant): { text: string; color: string } {
  if (!plant.nextWatering) return { text: 'Not watered yet', color: 'medium' };

  const days = Math.round((Date.parse(plant.nextWatering) - Date.parse(today())) / 86_400_000);
  if (days < 0) return { text: days === -1 ? '1 day late' : `${-days} days late`, color: 'danger' };
  if (days === 0) return { text: 'Water today', color: 'warning' };
  if (days === 1) return { text: 'Tomorrow', color: 'primary' };
  return { text: `In ${days} days`, color: 'primary' };
}
