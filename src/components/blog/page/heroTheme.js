import { DEFAULT_ACCENT, getReadableTextColor, hexToRgb, toRgba } from '../../admin/themeUtils'

const DEFAULT_RGB = { r: 15, g: 23, b: 42 }

export function buildHeroTheme(themeColors = {}, accentBase = DEFAULT_ACCENT) {
  const overlayHex = themeColors?.heroOverlay || accentBase || DEFAULT_ACCENT
  const cardHex = themeColors?.heroCard || overlayHex
  const chipHex = themeColors?.heroChip || accentBase || '#f1f5f9'

  const overlayRgb = hexToRgb(overlayHex) || DEFAULT_RGB
  const cardRgb = hexToRgb(cardHex) || overlayRgb
  const chipRgb = hexToRgb(chipHex) || cardRgb

  const overlay = `linear-gradient(118deg, ${toRgba(overlayRgb, 0.92)} 0%, ${toRgba(overlayRgb, 0.55)} 45%, transparent 100%)`
  const cardBg = toRgba(cardRgb, 0.82)
  const cardBorder = toRgba(cardRgb, 0.28)
  const cardShadow = `0 40px 60px -35px ${toRgba(cardRgb, 0.65)}`
  const chipBg = toRgba(chipRgb, 0.35)
  const chipText = getReadableTextColor(chipHex)

  return {
    overlay,
    cardBg,
    cardBorder,
    cardShadow,
    chipBg,
    chipText,
  }
}
