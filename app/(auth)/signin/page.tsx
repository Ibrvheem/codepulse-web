import React from "react";
import { SignInForm } from "./_components/sign-in-form";

export default async function SignInPage() {
  return (
    <div className="h-screen w-screen bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-800 flex flex-col items-center justify-center">
      <SignInForm />
    </div>
  );
}
