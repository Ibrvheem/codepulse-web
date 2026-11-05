import type { Metadata } from "next";
import { Suspense } from "react";
import { BufferView } from "./_components/buffer-view";
import Loading from "./loading";

export const metadata: Metadata = { title: "Post with Buffer" };

export default function BufferPage() {
  // The view reads ?buffer=connected and ?error= from the OAuth round trip.
  return (
    <Suspense fallback={<Loading />}>
      <BufferView />
    </Suspense>
  );
}
