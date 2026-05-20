import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignInFormFlow from "@/components/auth/SignInFormFlow";

export const metadata = {
  title: "Sign in · usemoos",
};

export default async function SignInPage() {
  const { userId } = await auth();
  if (userId) redirect("/workspace");

  return <SignInFormFlow />;
}
