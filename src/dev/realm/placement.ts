import type { Building } from './model';
/** Normalized ground-contact anchors on a future 2400 × 1500 terrain master.
 * Sprite art and hit bounds must be approved together; these are plot reservations.
 * The river corridor runs (82,0) → (70,24) → (75,46) → (60,67) → (64,100).
 */
export type Placement = { building: Building; x: number; y: number; width: number; height: number; z: number };
export const placements: Placement[] = [
  { building: 'guild', x: 16, y: 22, width: 16, height: 17, z: 1 },
  { building: 'academy', x: 42, y: 17, width: 18, height: 17, z: 2 },
  { building: 'mine', x: 88, y: 22, width: 16, height: 17, z: 3 },
  { building: 'hall', x: 51, y: 38, width: 20, height: 18, z: 4 },
  { building: 'sawmill', x: 17, y: 46, width: 16, height: 17, z: 5 },
  { building: 'farm', x: 87, y: 49, width: 18, height: 20, z: 6 },
  { building: 'marketplace', x: 39, y: 61, width: 18, height: 17, z: 7 },
  { building: 'workshop', x: 73, y: 73, width: 16, height: 17, z: 8 },
  { building: 'quarry', x: 15, y: 79, width: 18, height: 19, z: 9 },
  { building: 'tavern', x: 47, y: 86, width: 18, height: 17, z: 10 },
];
export const sceneArtwork: { terrain?: string; buildings: Partial<Record<Building, Partial<Record<1 | 2 | 3 | 4 | 5, string>>>> } = { buildings: {} };

/** Art-direction geometry only: no placeholder terrain is painted from this data. */
export const terrainManifest = {
  width: 2400, height: 1500,
  river: [[82, 0], [70, 24], [75, 46], [60, 67], [64, 100]],
  bridge: [62, 80],
  paths: [
    ['guild', 'sawmill', 'marketplace'],
    ['academy', 'hall', 'marketplace', 'tavern'],
    ['quarry', 'marketplace'],
    ['tavern', 'bridge', 'workshop', 'farm', 'mine'],
  ],
  // Plots stay accessible; built artwork is introduced only after construction.
  expansion: [
    { hall: 1, district: 'hamlet', buildings: ['hall', 'farm', 'sawmill', 'quarry'] },
    { hall: 2, district: 'crossroads', buildings: ['mine', 'workshop', 'marketplace'] },
    { hall: 3, district: 'upper-terrace', buildings: ['academy', 'guild'] },
    { hall: 4, district: 'village-entrance', buildings: ['tavern'] },
  ],
} as const;
