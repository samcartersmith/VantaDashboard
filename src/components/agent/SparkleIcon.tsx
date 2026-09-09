let gradSeq = 0;

// Classic AI sparkle: one large 4-point star + a small accent, purple→pink.
export function SparkleIcon({
  size = 18,
  accent = true,
  light = false,
}: {
  size?: number;
  accent?: boolean;
  light?: boolean;
}) {
  const id = `sparkle-grad-${gradSeq++}`;
  const from = light ? "#EBD6FF" : "#7C3AED";
  const to = light ? "#F4C0D1" : "#D4537E";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <path
        d="M12 2 L14 9 L21 11 L14 13 L12 20 L10 13 L3 11 L10 9 Z"
        fill={`url(#${id})`}
      />
      {accent && (
        <path
          d="M19.5 3 L20.3 5.7 L23 6.5 L20.3 7.3 L19.5 10 L18.7 7.3 L16 6.5 L18.7 5.7 Z"
          fill={`url(#${id})`}
        />
      )}
    </svg>
  );
}
