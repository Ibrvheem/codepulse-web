import type { FeedbackAuthor } from "@/lib/types";

/** Initials disc, same recipe as the topbar's account button. */
export function AuthorAvatar({
  author,
  size = "sm",
}: {
  author: FeedbackAuthor;
  size?: "sm" | "md";
}) {
  const initials =
    author.full_name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return (
    <span
      aria-hidden
      className={`shrink-0 rounded-full bg-secondary text-secondary-foreground font-medium flex items-center justify-center ${
        size === "md" ? "size-7 text-xs" : "size-5 text-[10px]"
      }`}
    >
      {initials}
    </span>
  );
}
