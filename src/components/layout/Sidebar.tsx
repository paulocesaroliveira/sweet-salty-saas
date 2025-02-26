
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Calendar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Cookie,
  UtensilsCrossed,
  Users,
  Store as StoreIcon,
  Box,
  DollarSign,
  Calculator,
  LineChart,
  Sun,
  Moon,
  LayoutDashboard,
  Receipt,
  Coins
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const menuItems = [
    // Principais
    {
      group: "Principais",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Receipt, label: "Vendas", path: "/reports" },
        { icon: ShoppingCart, label: "Pedidos", path: "/orders" },
      ]
    },
    // Catálogo
    {
      group: "Catálogo",
      items: [
        { icon: Package, label: "Produtos", path: "/products" },
        { icon: Cookie, label: "Ingredientes", path: "/ingredients" },
        { icon: UtensilsCrossed, label: "Receitas", path: "/recipes" },
        { icon: Box, label: "Embalagens", path: "/packages" },
      ]
    },
    // Gestão
    {
      group: "Gestão",
      items: [
        { icon: Users, label: "Clientes", path: "/customers" },
        { icon: DollarSign, label: "Custos", path: "/costs" },
        { icon: Calculator, label: "Precificação", path: "/pricing" },
        { icon: LineChart, label: "Relatórios", path: "/reports" },
        { icon: Calendar, label: "Agenda", path: "/calendar" },
      ]
    },
    // Configurações e Loja
    {
      group: "Configurações e Loja",
      items: [
        { icon: Settings, label: "Configurações", path: "/settings" },
        { 
          icon: StoreIcon, 
          label: "Ver Minha Loja", 
          path: `/store/${user?.id}`,
        },
      ]
    }
  ];

  return (
    <div
      className={`relative h-screen bg-card border-r border-border transition-all duration-300 
                  ${isCollapsed ? "w-20" : "w-64"} z-40`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-6 bg-card border border-border rounded-full p-2 
                   hover:bg-accent transition-colors duration-200 shadow-sm z-50"
      >
        {isCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>

      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className={`flex items-center justify-between mb-6 transition-opacity duration-200 
                        ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
            <h1 className="font-display text-xl">SweetSaas</h1>
          </div>

          <nav className="space-y-6">
            {menuItems.map((group, idx) => (
              <div key={idx} className="space-y-2">
                {!isCollapsed && (
                  <h2 className="text-xs uppercase text-muted-foreground font-semibold px-3">
                    {group.group}
                  </h2>
                )}
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground/70 hover:text-foreground",
                        "transition-colors duration-200 relative group",
                        isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-accent",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon size={20} />
                      {!isCollapsed && <span>{item.label}</span>}
                      {isCollapsed && (
                        <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover
                                      text-popover-foreground text-sm invisible opacity-0 -translate-x-3
                                      group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                                      transition-all">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start space-x-2",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <>
                <Moon size={16} />
                {!isCollapsed && <span>Modo Escuro</span>}
              </>
            ) : (
              <>
                <Sun size={16} />
                {!isCollapsed && <span>Modo Claro</span>}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
