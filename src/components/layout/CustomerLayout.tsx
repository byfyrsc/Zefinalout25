import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, Trophy, Calendar, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  { id: "home", label: "Início", icon: Home, path: "/" },
  { id: "gamification", label: "Gamificação", icon: Trophy, path: "/customer/gamification" },
  { id: "events", label: "Eventos", icon: Calendar, path: "/customer/events" },
  { id: "rewards", label: "Recompensas", icon: ShoppingBag, path: "/customer/rewards" },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Mobile Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="flex flex-col space-y-4 py-6">
                <h2 className="px-4 text-lg font-semibold tracking-tight">Menu</h2>
                <div className="px-2">
                  <div className="space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path}
                        className={cn(
                          "flex items-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          location.pathname === item.path
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <span className="hidden font-bold sm:inline-block">Customer Portal</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location.pathname === item.path
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <footer className="sticky bottom-0 z-50 w-full border-t bg-background md:hidden">
        <div className="grid grid-cols-4 gap-1">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors",
                location.pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}