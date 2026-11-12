import type { DestinationId } from './catalog';
import woods400 from '../../../docs/design/realm-stage6b/assets/woods-400.webp';
import woods800 from '../../../docs/design/realm-stage6b/assets/woods-800.webp';
import meadow400 from '../../../docs/design/realm-stage6b/assets/meadow-400.webp';
import meadow800 from '../../../docs/design/realm-stage6b/assets/meadow-800.webp';
import river400 from '../../../docs/design/realm-stage6b/assets/river-400.webp';
import river800 from '../../../docs/design/realm-stage6b/assets/river-800.webp';
import ridge400 from '../../../docs/design/realm-stage6b/assets/ridge-400.webp';
import ridge800 from '../../../docs/design/realm-stage6b/assets/ridge-800.webp';
import orchard400 from '../../../docs/design/realm-stage6b/assets/orchard-400.webp';
import orchard800 from '../../../docs/design/realm-stage6b/assets/orchard-800.webp';
import pass400 from '../../../docs/design/realm-stage6b/assets/pass-400.webp';
import pass800 from '../../../docs/design/realm-stage6b/assets/pass-800.webp';

export type ExplorationScene = DestinationId | 'woods';
const scenes = {
  woods: [woods400, woods800],
  meadow: [meadow400, meadow800],
  river: [river400, river800],
  ridge: [ridge400, ridge800],
  orchard: [orchard400, orchard800],
  pass: [pass400, pass800],
};
export function ExplorationArtwork({ scene, description }: { scene: ExplorationScene; description: string }) {
  const [small, large] = scenes[scene];
  return <img className="realm-exploration-art" src={small} srcSet={`${small} 400w, ${large} 800w`}
    sizes={scene === 'woods' ? '(max-width: 580px) calc(100vw - 64px), (max-width: 1100px) 45vw, 480px' : '(max-width: 580px) calc(100vw - 64px), 320px'}
    width="800" height="500" loading="lazy" decoding="async" alt={description}/>;
}
