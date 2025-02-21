
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Bolo de Chocolate",
      price: 45.90,
      image: "/placeholder.svg",
      category: "Bolos",
      status: "active"
    },
    {
      id: 2,
      name: "Cupcake Red Velvet",
      price: 12.90,
      image: "/placeholder.svg",
      category: "Cupcakes",
      status: "active"
    },
    {
      id: 3,
      name: "Brigadeiros Gourmet",
      price: 3.50,
      image: "/placeholder.svg",
      category: "Doces",
      status: "active"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos disponíveis na sua loja
          </p>
        </div>
        
        <Button className="bg-primary hover:bg-primary-hover">
          <Plus className="mr-2" size={20} />
          Novo Produto
        </Button>
      </div>

      <div className="flex gap-4 flex-wrap">
        {["Todos", "Bolos", "Cupcakes", "Doces", "Salgados"].map((category) => (
          <Button
            key={category}
            variant="outline"
            className="hover:bg-accent"
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div 
            key={product.id}
            className="card group hover:scale-105 transition-transform duration-200"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4 bg-pastel-pink/10">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>

            <div>
              <h3 className="font-medium mb-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-lg">
                  R$ {product.price.toFixed(2)}
                </p>
                <span className="px-2 py-1 bg-pastel-blue/20 text-blue-700 text-xs rounded-full">
                  Ativo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
