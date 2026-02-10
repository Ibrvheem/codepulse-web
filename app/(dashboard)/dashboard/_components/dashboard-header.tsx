"use client";

import { CreateProjectDialog } from "./create-project-dialog";

export function DashboardHeader() {
  return (
    <div className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
      </div>
      <CreateProjectDialog />
    </div>
  );
}
