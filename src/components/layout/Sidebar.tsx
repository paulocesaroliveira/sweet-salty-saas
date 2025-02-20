
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Calendar, 
  Settings,
  Menu,
  X,
  Cookie,
  UtensilsCrossed,
  Users,
  Store as StoreIcon
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Produtos da Loja", path: "/products" },
    { icon: Cookie, label: "Ingredientes", path: "/ingredients" },
    { icon: UtensilsCrossed, label: "Receitas", path: "/recipes" },
    { icon: Users, label: "Clientes", path: "/customers" },
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
      className={`relative h-screen bg-white border-r border-neutral-200 transition-all duration-300 
                  ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 bg-white border border-neutral-200 rounded-full p-1.5 
                   hover:bg-neutral-50 transition-colors duration-200"
      >
        {isCollapsed ? (
          <Menu size={16} />
        ) : (
          <X size={16} />
        )}
      </button>

      <div className="p-4">
        <h1 className={`font-display text-xl mb-8 transition-opacity duration-200 
                        ${isCollapsed ? "opacity-0" : "opacity-100"}`}>
          SweetSaas
        </h1>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 rounded-lg text-neutral-700 
                         hover:bg-neutral-50 transition-colors duration-200"
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
                className="flex items-center space-x-3 p-3 rounded-lg text-neutral-700 
                         hover:bg-neutral-50 transition-colors duration-200"
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
      </div>
    </div>
  );
};

export default Sidebar;
