export type RoomId = 'neighborhood' | 'reading' | 'wellness' | 'about';

export type RoomDef = {
  id: RoomId;
  label: string;
  placeholderTitle: string;
  placeholderBody: string;
};

const ALL_ROOMS: RoomDef[] = [
  {
    id: 'neighborhood',
    label: 'The Mahogany Pages',
    placeholderTitle: 'The Mahogany Pages',
    placeholderBody:
      'Weekend guides, vibes, and itineraries — coming next. This room will hold the event guides you know and love.',
  },
  {
    id: 'reading',
    label: 'Soft Letters',
    placeholderTitle: 'Soft Letters',
    placeholderBody:
      'Issues, exhibitions, and Softies of the Month — coming soon. The Soft Letter is where we tell our stories.',
  },
  {
    id: 'wellness',
    label: 'Sexual Wellness',
    placeholderTitle: 'Sexual Wellness',
    placeholderBody:
      'Black queer sapphic education, pleasure and care, shared by the people who know.',
  },
];

export const SOFT_LETTERS_ENABLED = import.meta.env.VITE_ENABLE_SOFT_LETTERS === 'true';

export const ROOMS: RoomDef[] = ALL_ROOMS.filter(
  (room) => room.id !== 'reading' || SOFT_LETTERS_ENABLED,
);

export function roomById(id: RoomId): RoomDef {
  const room = ALL_ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`Unknown room: ${id}`);
  return room;
}
