// Fails the build if a Tailwind class hardcodes a physical direction
// (ml-/mr-/pl-/pr-/left-/right-/text-left/text-right/rounded-l-/rounded-r-)
// instead of a logical one (ms-/me-/ps-/pe-/start-/end-/text-start/text-end/
// rounded-s-/rounded-e-). This is a full-RTL app — physical-direction
// classes silently break in RTL instead of erroring, so they're worth
// catching at build time rather than by eyeballing every PR.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const PHYSICAL_CLASS_PATTERN =
  /\b(?:ml|mr|pl|pr|rounded-l|rounded-r)-|(?<!\w)(?:left|right)-\d|text-left\b|text-right\b/

const SRC_DIR = join(import.meta.dirname, '..', 'src')
let violations = []

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      const lines = readFileSync(full, 'utf8').split('\n')
      lines.forEach((line, i) => {
        if (PHYSICAL_CLASS_PATTERN.test(line)) {
          violations.push(`${full}:${i + 1}: ${line.trim()}`)
        }
      })
    }
  }
}

walk(SRC_DIR)

if (violations.length > 0) {
  console.error('Physical-direction Tailwind classes found (use logical ms-/me-/ps-/pe-/start-/end- instead):')
  for (const v of violations) console.error(`  ${v}`)
  process.exit(1)
} else {
  console.log('No physical-direction Tailwind classes found.')
}
