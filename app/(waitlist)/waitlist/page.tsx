import React from "react";
import { WaitListForm } from "./waitlist-form";
import { Command } from "lucide-react";

export default function Page() {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex flex-col items-center justify-center">
      <div className="flex items-center gap-2 my-4 text-base">
        <Command className="h-10 w-10 bg-indigo-600 text-white p-2 rounded-md" />{" "}
        <p className="font-medium">CodePulse Inc.</p>
      </div>
      <WaitListForm />
    </div>
  );
}
