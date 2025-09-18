import { Sidebar } from "@/components/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}