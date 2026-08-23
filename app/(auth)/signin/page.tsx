import type { Metadata } from "next";
import { SigninForm } from "./_components/signin-form";

export const metadata: Metadata = { title: "Sign in — WriteLogs" };

export default function SigninPage() {
  return <SigninForm />;
}
