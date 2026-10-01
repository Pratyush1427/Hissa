import { DISH_PHOTOS, type DishKey } from "@/lib/dish-photos";

// Shows a representative dish photo when we have one, else a warm gradient with the emoji.
export default function StallPhoto({
  stall,
  className = "",
  size = "text-5xl",
  credit = false,
}: {
  stall: { emoji: string; hue?: number; dish?: DishKey };
  className?: string;
  size?: string;
  credit?: boolean;
}) {
  const photo = stall.dish ? DISH_PHOTOS[stall.dish] : undefined;

  if (photo) {
    return (
      <div className={`relative overflow-hidden bg-line ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Commons serves sized thumbnails already */}
        <img src={photo.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        {credit && (
          <a
            href={photo.page}
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 right-2 max-w-[80%] truncate rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white"
          >
            Representative photo · {photo.author} · {photo.license}
          </a>
        )}
      </div>
    );
  }

  const hue = stall.hue ?? 30;
  return (
    <div
      className={`grid place-items-center ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 85% 72%), hsl(${hue + 25} 75% 52%))` }}
    >
      <span className={`${size} drop-shadow`}>{stall.emoji}</span>
    </div>
  );
}
