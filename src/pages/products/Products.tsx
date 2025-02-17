
import { Plus } from "lucide-react";

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display mb-1">Produtos</h1>
          <p className="text-neutral-600">Gerencie seu catálogo</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card group cursor-pointer">
            <div className="aspect-square bg-neutral-100 rounded-lg mb-4"></div>
            <div>
              <h3 className="font-medium group-hover:text-primary transition-colors">
                Produto {i}
              </h3>
              <p className="text-neutral-600 text-sm mb-2">
                Descrição curta do produto {i}
              </p>
              <p className="font-semibold">R$ 25,00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
