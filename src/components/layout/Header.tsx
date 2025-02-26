
import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Sidebar from "./Sidebar";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-neutral-200/50 px-4 md:px-6 
                     flex items-center justify-between sticky top-0 z-30">
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu size={20} />
        </Button>
      </div>

      <div>
        <h2 className="text-neutral-700 font-medium">Bem-vindo de volta</h2>
        <p className="text-sm text-neutral-500">Doces da Maria</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-neutral-700 hover:bg-white rounded-xl transition-colors duration-200">
          <Bell size={20} />
        </button>
        <button className="p-2 text-neutral-700 hover:bg-white rounded-xl transition-colors duration-200">
          <User size={20} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
             onClick={() => setShowMobileMenu(false)}>
          <div className="fixed left-0 top-0 h-full w-72" 
               onClick={e => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
