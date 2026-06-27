import { SidebarContent } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { AuthGuard } from "@/components/auth/auth-guard";

/**
 * Login sonrası sabit uygulama kabuğu:
 *   [ Sol Menü ] [ Header + Content ]
 * Doküman gereği bu yapı uygulama genelinde sabittir.
 * AuthGuard ile korunur: oturum yoksa /login'e yönlendirilir.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-full">
        {/* Masaüstü sabit sol menü */}
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <SidebarContent />
        </aside>

        {/* Header + içerik alanı */}
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
