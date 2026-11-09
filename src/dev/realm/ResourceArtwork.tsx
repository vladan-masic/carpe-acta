import wood from '../../../docs/design/realm-stage6a/assets/wood.webp';
import stone from '../../../docs/design/realm-stage6a/assets/stone.webp';
import food from '../../../docs/design/realm-stage6a/assets/food.webp';
import coins from '../../../docs/design/realm-stage6a/assets/coins.webp';
import iron from '../../../docs/design/realm-stage6a/assets/iron.webp';
import wayfinder from '../../../docs/design/realm-stage6a/assets/wayfinder.webp';
import type { Stock } from './model';

export const resourceArtwork = { wood, stone, food, coins, iron };
// Adjacent localized text carries the name and quantity; artwork is decorative.
export function ResourceIcon({ resource }: { resource: keyof Stock }) {
  return <img className="realm-resource-icon" src={resourceArtwork[resource]} alt="" aria-hidden="true" width="24" height="24"/>;
}
export function HeroPortrait() {
  return <img className="realm-hero-portrait" src={wayfinder} alt="" aria-hidden="true" width="60" height="60"/>;
}
