"use client";

import { RedirectToTasks } from "@clerk/nextjs";

export default function TasksPage() {
  return <RedirectToTasks redirectUrl="/workspace" />;
}
