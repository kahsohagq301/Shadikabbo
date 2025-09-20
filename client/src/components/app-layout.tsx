import { Sidebar } from "@/components/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-52 min-h-screen overflow-y-auto">
        <div className="max-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}