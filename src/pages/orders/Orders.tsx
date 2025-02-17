
import { ShoppingCart } from "lucide-react";

const Orders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display mb-1">Pedidos</h1>
        <p className="text-neutral-600">Gerencie seus pedidos</p>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
                <ShoppingCart className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="font-medium">Pedido #{i}</h3>
                <p className="text-sm text-neutral-600">2 items • R$ 45,00</p>
              </div>
            </div>
            <div>
              <span className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full">
                Em preparo
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
