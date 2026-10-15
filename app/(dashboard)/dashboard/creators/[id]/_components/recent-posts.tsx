import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Creator } from "@/lib/types";

dayjs.extend(relativeTime);

export function RecentPosts({ creator }: { creator: Creator }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium">Recent posts</h2>
        {creator.engagement && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {creator.engagement}
          </p>
        )}
      </div>
      {creator.recent_posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          None collected. Scores and drafts will be thin without them.
        </p>
      ) : (
        <ul className="border rounded-lg bg-card divide-y">
          {creator.recent_posts.map((post, index) => (
            <li key={post.url ?? index} className="p-4 space-y-1">
              {post.title &&
                (post.url ? (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium hover:underline break-words"
                  >
                    {post.title}
                  </a>
                ) : (
                  <p className="text-sm font-medium break-words">{post.title}</p>
                ))}
              {post.text && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {post.text}
                </p>
              )}
              <p className="text-xs text-muted-foreground tabular-nums">
                {[
                  post.posted_at && dayjs(post.posted_at).fromNow(),
                  post.reactions !== undefined && `${post.reactions} reactions`,
                  post.comments !== undefined && `${post.comments} comments`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
