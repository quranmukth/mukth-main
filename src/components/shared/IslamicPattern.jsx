// Reusable Islamic geometric pattern (8-pointed star arabesque tile)
export default function IslamicPattern({ opacity = 0.07, color = '#d4af37' }) {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        opacity, pointerEvents: 'none', zIndex: 0,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="islamicTile" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon
            points="40,4 46,28 68,20 56,40 72,58 48,52 46,76 40,58 34,76 32,52 8,58 24,40 12,20 34,28"
            fill="none" stroke={color} strokeWidth="0.8" opacity="0.9"
          />
          <rect x="22" y="22" width="36" height="36"
            fill="none" stroke={color} strokeWidth="0.45" opacity="0.5"
            transform="rotate(45 40 40)"
          />
          <circle cx="40" cy="40" r="2.5" fill={color} opacity="0.3" />
          <circle cx="0"  cy="0"  r="1.5" fill={color} opacity="0.18" />
          <circle cx="80" cy="0"  r="1.5" fill={color} opacity="0.18" />
          <circle cx="0"  cy="80" r="1.5" fill={color} opacity="0.18" />
          <circle cx="80" cy="80" r="1.5" fill={color} opacity="0.18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamicTile)" />
    </svg>
  );
}
