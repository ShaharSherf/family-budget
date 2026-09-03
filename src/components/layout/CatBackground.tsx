// A faint, decorative tiled backdrop of real (non-AI) cat photos from the
// free cataas.com API. Purely visual — aria-hidden, no pointer events — and
// low-opacity/grayscale so it never competes with the actual UI on top.
const TILE_COUNT = 60

export function CatBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 grid grid-cols-[repeat(auto-fill,140px)] grid-rows-[repeat(auto-fill,140px)] gap-1 overflow-hidden opacity-[0.07] dark:opacity-[0.12]"
    >
      {Array.from({ length: TILE_COUNT }, (_, i) => (
        <img
          key={i}
          src={`https://cataas.com/cat?width=140&height=140&r=${i}`}
          alt=""
          loading="lazy"
          className="h-[140px] w-[140px] object-cover grayscale"
        />
      ))}
    </div>
  )
}
