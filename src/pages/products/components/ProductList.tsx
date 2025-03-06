
import { useState } from "react";
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { type Product } from "../Products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";

interface ProductListProps {
  products: Product[];
  view: "grid" | "table";
  onEdit: (id: string) => void;
  onRefresh: () => void;
}

export function ProductList({ products, view, onEdit, onRefresh }: ProductListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      // First delete related records in product_recipes
      const { error: recipesError } = await supabase
        .from("product_recipes")
        .delete()
        .eq("product_id", id);
      
      if (recipesError) throw recipesError;
      
      // Delete related records in product_packages
      const { error: packagesError } = await supabase
        .from("product_packages")
        .delete()
        .eq("product_id", id);
      
      if (packagesError) throw packagesError;
      
      // Finally delete the product
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Produto excluído com sucesso");
      onRefresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ visible_in_store: !product.visible_in_store })
        .eq("id", product.id);
      
      if (error) throw error;
      
      toast.success(
        product.visible_in_store
          ? "Produto ocultado da loja pública"
          : "Produto visível na loja pública"
      );
      
      onRefresh();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Erro ao atualizar visibilidade do produto");
    }
  };

  if (products.length === 0) {
    return (
      <div className="p-12 text-center border rounded-lg bg-muted/10">
        <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground">
          Comece criando seu primeiro produto clicando em "Novo Produto"
        </p>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <ProductActions
                  product={product}
                  onDelete={handleDelete}
                  onEdit={onEdit}
                  onToggleVisibility={handleToggleVisibility}
                />
              </div>
            </CardHeader>
            
            <CardContent className="py-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Preço</div>
                  <div className="text-lg font-semibold">{formatCurrency(product.price)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Custo</div>
                  <div className="text-lg font-semibold">{formatCurrency(product.cost)}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <Badge variant="outline">{product.category}</Badge>
                )}
                <Badge variant={product.visible_in_store ? "default" : "secondary"}>
                  {product.visible_in_store ? "Visível na loja" : "Oculto"}
                </Badge>
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/20 flex justify-between pt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEdit(product.id)}
                className="px-2 flex-1"
              >
                <Pencil size={16} className="mr-2" />
                Editar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">Nome</th>
            <th className="text-center p-3 font-medium">Categoria</th>
            <th className="text-center p-3 font-medium">Preço</th>
            <th className="text-center p-3 font-medium">Custo</th>
            <th className="text-center p-3 font-medium">Margem</th>
            <th className="text-center p-3 font-medium">Visível</th>
            <th className="text-right p-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t hover:bg-muted/20">
              <td className="p-3">{product.name}</td>
              <td className="p-3 text-center">
                {product.category ? (
                  <Badge variant="outline">{product.category}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="p-3 text-center font-medium">{formatCurrency(product.price)}</td>
              <td className="p-3 text-center">{formatCurrency(product.cost)}</td>
              <td className="p-3 text-center">
                {product.profit_margin.toFixed(0)}%
              </td>
              <td className="p-3 text-center">
                <Badge variant={product.visible_in_store ? "success" : "secondary"}>
                  {product.visible_in_store ? "Sim" : "Não"}
                </Badge>
              </td>
              <td className="p-3 text-right">
                <ProductActions
                  product={product}
                  onDelete={handleDelete}
                  onEdit={onEdit}
                  onToggleVisibility={handleToggleVisibility}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ProductActionsProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleVisibility: (product: Product) => void;
}

function ProductActions({ product, onDelete, onEdit, onToggleVisibility }: ProductActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(product.id)}>
          <Pencil className="mr-2" size={14} />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onToggleVisibility(product)}>
          {product.visible_in_store ? (
            <>
              <EyeOff className="mr-2" size={14} />
              Ocultar da loja
            </>
          ) : (
            <>
              <Eye className="mr-2" size={14} />
              Mostrar na loja
            </>
          )}
        </DropdownMenuItem>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
              <Trash className="mr-2" size={14} />
              Excluir
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir produto</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir "{product.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(product.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
