import type { Building } from './model';
import metrics from '../../../docs/design/realm-stage4b3/asset-validation.json';
import terrain from '../../../docs/design/realm-stage4a/clean-v1/clean-terrain.png';
import guild from '../../../docs/design/realm-stage4b3/assets/guild.png';
import academy from '../../../docs/design/realm-stage4b3/assets/academy.png';
import mine from '../../../docs/design/realm-stage4b3/assets/mine.png';
import hall from '../../../docs/design/realm-stage4b3/assets/hall.png';
import sawmill from '../../../docs/design/realm-stage4b3/assets/sawmill.png';
import farm from '../../../docs/design/realm-stage4b3/assets/farm.png';
import marketplace from '../../../docs/design/realm-stage4b3/assets/marketplace.png';
import workshop from '../../../docs/design/realm-stage4b3/assets/workshop.png';
import quarry from '../../../docs/design/realm-stage4b3/assets/quarry.png';
import tavern from '../../../docs/design/realm-stage4b3/assets/tavern.png';
import hallEarly from '../../../docs/design/realm-stage5a/assets/hall-early.png';
import hallDeveloped from '../../../docs/design/realm-stage5a/assets/hall-developed.png';
import tierMetrics from '../../../docs/design/realm-stage5a/asset-validation.json';
const sprites: Record<Building, string> = { guild, academy, mine, hall, sawmill, farm, marketplace, workshop, quarry, tavern };
export const sceneArtwork = { terrain, buildings: sprites };
/** Only the Town Hall has approved review tiers; all other artwork remains unchanged. */
export function buildingArtwork(building: Building, level: number) {
  const tier = building === 'hall' ? level >= 5 ? 'developed' : level >= 3 ? null : 'early' : null;
  if (tier) return { src: tier === 'early' ? hallEarly : hallDeveloped, size: tierMetrics[tier].size, bounds: tierMetrics[tier].viewBounds };
  return { src: sprites[building], size: metrics[building].size, bounds: metrics[building].visibleBounds };
}
/** Shared aspect and bottom-center framing keeps the entrance anchored across tiers. */
export function BuildingArtwork({ building, level }: { building: Building; level: number }) {
  const { src, size, bounds: [left, top, right, bottom] } = buildingArtwork(building, level);
  return <svg className="realm-building-art" viewBox={`${left} ${top} ${right - left} ${bottom - top}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
    <image href={src} width={size[0]} height={size[1]}/>
  </svg>;
}
