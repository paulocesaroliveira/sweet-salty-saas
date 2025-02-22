
import { useState } from "react";
import { Link } from "react-router-dom";
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
  Sun,
  Moon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Produtos da Loja", path: "/products" },
    { icon: Cookie, label: "Ingredientes", path: "/ingredients" },
    { icon: UtensilsCrossed, label: "Receitas", path: "/recipes" },
    { icon: Users, label: "Clientes", path: "/customers" },
    { icon: Box, label: "Embalagens", path: "/packages" },
    { icon: DollarSign, label: "Custos", path: "/costs" },
    { icon: Calculator, label: "Precificação", path: "/pricing" },
    { icon: ShoppingCart, label: "Pedidos", path: "/orders" },
    { icon: Calendar, label: "Agenda", path: "/calendar" },
    { icon: Settings, label: "Configurações", path: "/settings" },
    { 
      icon: StoreIcon, 
      label: "Ver Minha Loja", 
      path: `/store/${user?.id}`,
      external: true 
    },
  ];

  return (
    <div
      className={`relative h-screen bg-card border-r border-border transition-all duration-300 
                  ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-6 bg-card border border-border rounded-full p-2 
                   hover:bg-accent transition-colors duration-200 shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <ChevronLeft size={16} />
        )}
      </button>

      <div className="p-4">
        <div className={`flex items-center justify-between mb-8 transition-opacity duration-200 
                      ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
          <h1 className="font-display text-xl">SweetSaas</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg text-foreground 
                         hover:bg-accent transition-colors duration-200"
              >
                <item.icon size={20} />
                <span className={`transition-opacity duration-200 
                              ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                  {item.label}
                </span>
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 p-3 rounded-lg text-foreground 
                         hover:bg-accent transition-colors duration-200"
              >
                <item.icon size={20} />
                <span className={`transition-opacity duration-200 
                              ${isCollapsed ? "opacity-0 hidden" : "opacity-100"}`}>
                  {item.label}
                </span>
              </Link>
            )
          ))}
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              variant="outline"
              className="w-full justify-start space-x-2"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <>
                  <Moon size={16} />
                  <span>Modo Escuro</span>
                </>
              ) : (
                <>
                  <Sun size={16} />
                  <span>Modo Claro</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
