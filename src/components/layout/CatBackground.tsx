// A decorative tiled backdrop of real (non-AI) cat photos from the free
// cataas.com API. Purely visual — aria-hidden, no pointer events — kept
// behind actual UI, which all has its own opaque card/header backgrounds
// so this never hurts readability even at a fairly visible opacity.
import { useCatBackgroundEnabled } from '@/lib/catBackgroundPreference'

const TILE_COUNT = 60

export function CatBackground() {
  const enabled = useCatBackgroundEnabled()
  if (!enabled) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 grid grid-cols-[repeat(auto-fill,140px)] grid-rows-[repeat(auto-fill,140px)] gap-1 overflow-hidden opacity-25 dark:opacity-30"
    >
      {Array.from({ length: TILE_COUNT }, (_, i) => (
        <img
          key={i}
          src={`https://cataas.com/cat?width=140&height=140&r=${i}`}
          alt=""
          loading="lazy"
          className="h-[140px] w-[140px] object-cover"
        />
      ))}
    </div>
  )
}
