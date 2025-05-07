import Link from "next/link";
import { Package2 } from "lucide-react"; // Icon for logo placeholder

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // Placeholder for authentication check - assume user is logged in for now
  const isAuthenticated = true; 
  const userRole = "Admin"; // Placeholder, can be 'Manager' or 'Admin'

  if (!isAuthenticated) {
    // In a real app, you might redirect to /login or return a different layout
    // For now, we'll just show the children, but this logic will be expanded
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 border-b shrink-0 md:px-6 bg-background">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="w-6 h-6 text-blue-600" />
          <span className="sr-only">Agency CRM</span> {/* For accessibility */}
          <span className="hidden sm:inline-block">Agency CRM</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          <Link href="/dashboard" className="font-medium text-muted-foreground transition-colors hover:text-primary-foreground">
            Dashboard
          </Link>
          <Link href="/clients" className="font-medium text-muted-foreground transition-colors hover:text-primary-foreground">
            Clients
          </Link>
          <Link href="/campaigns" className="font-medium text-muted-foreground transition-colors hover:text-primary-foreground">
            Campaigns
          </Link>
          <Link href="/tasks" className="font-medium text-muted-foreground transition-colors hover:text-primary-foreground">
            Tasks
          </Link>
          {userRole === "Admin" && (
            <Link href="/admin" className="font-medium text-muted-foreground transition-colors hover:text-primary-foreground">
              Admin
            </Link>
          )}
          {/* Add User Profile/Logout Dropdown here later */}
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        © {new Date().getFullYear()} Marketing Agency CRM
      </footer>
    </div>
  );
} 