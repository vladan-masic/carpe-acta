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
const sprites: Record<Building, string> = { guild, academy, mine, hall, sawmill, farm, marketplace, workshop, quarry, tavern };
export const sceneArtwork = { terrain, buildings: sprites };
/** Same alpha-bound framing as the approved review; no raster alteration. */
export function BuildingArtwork({ building }: { building: Building }) {
  const { size, visibleBounds: [left, top, right, bottom] } = metrics[building];
  return <svg className="realm-building-art" viewBox={`${left} ${top} ${right - left} ${bottom - top}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
    <image href={sprites[building]} width={size[0]} height={size[1]}/>
  </svg>;
}
