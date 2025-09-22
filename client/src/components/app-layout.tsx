import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="ml-52 mt-16 min-h-screen overflow-y-auto">
        <div className="max-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}