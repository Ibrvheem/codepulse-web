import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyOtpForm } from "./_components/verify-otp-form";

export const metadata: Metadata = { title: "Verify your email — WriteLogs" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; resend?: string }>;
}) {
  const { email, resend } = await searchParams;
  if (!email) redirect("/signup");

  return <VerifyOtpForm email={email} autoResend={resend === "1"} />;
}
