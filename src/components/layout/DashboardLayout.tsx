
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pastel-white to-pastel-pink/5">
      <div className="fixed top-0 left-0 h-full md:relative">
        <Sidebar />
      </div>
      <div className="flex-1 w-full md:w-auto">
        <Header />
        <main className="p-4 md:p-6 pt-20 md:pt-6">
          <div className="animate-fade-in max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
