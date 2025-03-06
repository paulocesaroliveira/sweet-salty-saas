
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ProductList } from "./components/ProductList";
import { ProductDialog } from "./components/ProductDialog";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
  category: string | null;
  visible_in_store: boolean;
  cost: number;
  profit_margin: number;
  created_at: string;
  updated_at: string;
};

const Products = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: products, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["product-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("category")
        .not("category", "is", null);

      if (error) throw error;
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
      return uniqueCategories;
    },
  });

  const handleNewProduct = () => {
    setEditingProductId(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProductId(null);
  };

  const filteredProducts = products?.filter(product => {
    // Filter by search term
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    // Filter by category
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    // Filter by active status
    const matchesActiveStatus = !showActiveOnly || product.visible_in_store;
    
    return matchesSearch && matchesCategory && matchesActiveStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie os produtos disponíveis na sua loja
          </p>
        </div>
        
        <Button onClick={handleNewProduct} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2" size={20} />
          Novo Produto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Filter size={16} className="text-muted-foreground" />
          {categories && categories.length > 0 ? (
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas categorias</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Sem categorias
            </Button>
          )}
        </div>

        <Button 
          variant={showActiveOnly ? "default" : "outline"} 
          size="sm"
          onClick={() => setShowActiveOnly(!showActiveOnly)}
          className="whitespace-nowrap"
        >
          {showActiveOnly ? "Mostrar todos" : "Mostrar ativos"}
        </Button>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Visualização em Cards</TabsTrigger>
          <TabsTrigger value="table">Visualização em Tabela</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="w-full">
          <ProductList 
            products={filteredProducts || []} 
            view="grid"
            onEdit={handleEditProduct}
            onRefresh={refetch}
          />
        </TabsContent>
        
        <TabsContent value="table" className="w-full">
          <ProductList 
            products={filteredProducts || []} 
            view="table"
            onEdit={handleEditProduct}
            onRefresh={refetch}
          />
        </TabsContent>
      </Tabs>

      <ProductDialog 
        open={isDialogOpen} 
        productId={editingProductId}
        onClose={handleCloseDialog}
        onSaved={refetch}
      />
    </div>
  );
};

export default Products;
