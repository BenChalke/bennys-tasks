import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faBriefcase,
  faSeedling,
  faPersonRunning,
  faBullseye,
  faBook,
  faCartShopping,
  faPlane,
  faPalette,
  faHouse,
  faStar,
} from '@fortawesome/free-solid-svg-icons'

/** Curated icon choices for lists. */
export const CATEGORY_ICONS: { key: string; icon: IconDefinition }[] = [
  { key: 'briefcase', icon: faBriefcase },
  { key: 'seedling', icon: faSeedling },
  { key: 'running', icon: faPersonRunning },
  { key: 'target', icon: faBullseye },
  { key: 'book', icon: faBook },
  { key: 'cart', icon: faCartShopping },
  { key: 'plane', icon: faPlane },
  { key: 'palette', icon: faPalette },
  { key: 'house', icon: faHouse },
  { key: 'star', icon: faStar },
]

const ICON_BY_KEY: Record<string, IconDefinition> = Object.fromEntries(
  CATEGORY_ICONS.map(({ key, icon }) => [key, icon]),
)

/** Resolve a stored icon key to its definition, falling back to a default. */
export function categoryIcon(key: string): IconDefinition {
  return ICON_BY_KEY[key] ?? faBriefcase
}
