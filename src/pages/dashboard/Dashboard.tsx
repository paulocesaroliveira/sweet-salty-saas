
import { Package, ShoppingCart, TrendingUp } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }: { 
  icon: any, 
  label: string, 
  value: string,
  color: string
}) => (
  <div className="stats-card">
    <div className={`stats-icon ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
    <div>
      <p className="text-neutral-600 mb-1">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display mb-2">Dashboard</h1>
        <p className="text-neutral-600">Acompanhe seus resultados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={ShoppingCart}
          label="Pedidos Hoje"
          value="12"
          color="bg-pastel-pink"
        />
        <StatCard 
          icon={Package}
          label="Produtos Ativos"
          value="45"
          color="bg-pastel-blue"
        />
        <StatCard 
          icon={TrendingUp}
          label="Vendas do Mês"
          value="R$ 3.450"
          color="bg-pastel-yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-display text-lg mb-4">Últimos Pedidos</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 bg-neutral-50/50 
                         rounded-xl transition-colors hover:bg-neutral-50"
              >
                <div>
                  <p className="font-medium">Pedido #{i}</p>
                  <p className="text-sm text-neutral-600">2 items • R$ 45,00</p>
                </div>
                <span className="px-3 py-1 bg-pastel-yellow/20 text-yellow-700 text-sm rounded-full">
                  Em preparo
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-display text-lg mb-4">Produtos Populares</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 bg-neutral-50/50 
                         rounded-xl transition-colors hover:bg-neutral-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-pastel-pink/20 rounded-xl"></div>
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
