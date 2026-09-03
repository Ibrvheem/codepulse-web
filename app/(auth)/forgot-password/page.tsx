import type { Metadata } from "next";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password — WriteLogs" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
