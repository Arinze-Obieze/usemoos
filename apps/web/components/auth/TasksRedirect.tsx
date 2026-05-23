"use client";

import { RedirectToTasks } from "@clerk/nextjs";

export default function TasksRedirect() {
  return <RedirectToTasks redirectUrl="/workspace" />;
}
