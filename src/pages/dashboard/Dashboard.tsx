
import { Package, ShoppingCart, TrendingUp } from "lucide-react";

const StatCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-neutral-600 mb-1">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
      <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
        <Icon className="text-primary" size={24} />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display mb-1">Dashboard</h1>
        <p className="text-neutral-600">Acompanhe seus resultados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={ShoppingCart}
          label="Pedidos Hoje"
          value="12"
        />
        <StatCard 
          icon={Package}
          label="Produtos Ativos"
          value="45"
        />
        <StatCard 
          icon={TrendingUp}
          label="Vendas do Mês"
          value="R$ 3.450"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display text-lg mb-4">Últimos Pedidos</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium">Pedido #{i}</p>
                  <p className="text-sm text-neutral-600">2 items • R$ 45,00</p>
                </div>
                <span className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full">
                  Em preparo
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-display text-lg mb-4">Produtos Populares</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-neutral-200 rounded-lg"></div>
                  <div>
                    <p className="font-medium">Produto {i}</p>
                    <p className="text-sm text-neutral-600">Vendidos: 24</p>
                  </div>
                </div>
                <p className="font-medium">R$ 25,00</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
