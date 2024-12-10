import Navbar from "@/components/admin-panel/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <Navbar title={title} />
      <div className="flex-1 pt-8 pb-8 px-4 sm:px-8 overflow-auto">
        {children}
      </div>
    </div>
  );
}
