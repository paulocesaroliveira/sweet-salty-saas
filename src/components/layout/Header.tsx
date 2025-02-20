
import { Bell, User } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 bg-white/50 backdrop-blur-sm border-b border-neutral-200/50 px-6 
                     flex items-center justify-between sticky top-0 z-10">
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
    </header>
  );
};

export default Header;
