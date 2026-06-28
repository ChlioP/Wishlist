import { Outlet } from "react-router-dom";

import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNavigation } from "@/components/layout/TopNavigation";

export function AppShell() {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <TopNavigation />
      <div className="mx-auto flex w-full max-w-[90rem] gap-6 px-4 py-5 sm:px-6">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-24 lg:pb-6">
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
