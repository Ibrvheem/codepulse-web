import type { BufferChannel } from "@/lib/types";

/** Up to three of the picked channels' avatars, overlapping. */
export function ChannelStack({
  channels,
  size,
  ring,
}: {
  channels: BufferChannel[];
  size: string;
  /** matches the button behind, so the overlaps read as cut-outs */
  ring: string;
}) {
  if (channels.length === 0) return null;
  const shown = channels.slice(0, 3);
  return (
    <span className="ml-1 flex -space-x-1.5">
      {shown.map((c) =>
        c.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={c.id}
            src={c.avatar}
            alt=""
            className={`${size} rounded-full bg-muted object-cover ring-2 ${ring}`}
          />
        ) : (
          <span
            key={c.id}
            className={`${size} rounded-full bg-muted ring-2 ${ring}`}
          />
        ),
      )}
      {channels.length > 3 && (
        <span
          className={`${size} flex items-center justify-center rounded-full bg-muted text-[9px] text-muted-foreground ring-2 ${ring}`}
        >
          +{channels.length - 3}
        </span>
      )}
    </span>
  );
}
