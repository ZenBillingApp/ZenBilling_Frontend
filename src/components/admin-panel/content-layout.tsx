import Navbar from "@/components/admin-panel/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar title={title} />
      <main className="flex-1 min-h-0">
        <div className="h-full pt-8 pb-8 px-4 sm:px-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
