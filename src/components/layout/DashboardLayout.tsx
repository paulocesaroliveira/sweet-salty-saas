
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pastel-white to-pastel-pink/5">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
