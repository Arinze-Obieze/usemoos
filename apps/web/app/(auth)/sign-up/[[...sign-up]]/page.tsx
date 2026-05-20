import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SignUpFormFlow from "@/components/auth/SignUpFormFlow";

export const metadata = {
  title: "Create workspace · usemoos",
};

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) redirect("/workspace");

  return <SignUpFormFlow />;
}
