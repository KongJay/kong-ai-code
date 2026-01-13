"use client";

import type { AppVO } from "@/types/api";
import { AppCard } from "./AppCard";

export function AppsGrid({ apps }: { apps: AppVO[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}


