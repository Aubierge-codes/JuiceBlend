import { Search, Bell } from "lucide-react";
import { AdminSidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-admin-bg flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 px-6 bg-white border-b border-hairline flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-ghost" />
            <input
              type="search"
              placeholder="Search records..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-hairline bg-white focus:outline-none focus:border-kale-500 focus:ring-2 focus:ring-kale-100"
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative h-9 w-9 rounded-lg hover:bg-cream grid place-items-center">
              <Bell className="h-4 w-4 text-ink-soft" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-hairline">
              <div className="text-right">
                <div className="text-sm font-semibold">Admin User</div>
                <div className="text-xs text-ink-muted">Manager</div>
              </div>
              <div className="h-9 w-9 rounded-full overflow-hidden relative bg-gradient-to-br from-kale-100 to-mango-100 grid place-items-center text-sm font-bold">
                A
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-kale-500 ring-2 ring-white" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">{children}</main>

        <footer className="h-12 px-6 bg-white border-t border-hairline flex items-center justify-between text-xs text-ink-muted">
          <span>© 2026 KcBlendz Admin. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-ink">Privacy Policy</a>
            <a href="#" className="hover:text-ink">Support</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
