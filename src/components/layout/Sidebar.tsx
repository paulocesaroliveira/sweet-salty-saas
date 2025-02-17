
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Calendar, 
  Settings,
  Menu,
  X
} from "lucide-react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Package, label: "Produtos", path: "/products" },
    { icon: ShoppingCart, label: "Pedidos", path: "/orders" },
    { icon: Calendar, label: "Agenda", path: "/calendar" },
    { icon: Settings, label: "Configurações", path: "/settings" },
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
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
