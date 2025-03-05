
import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card,
  CardContent
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import type { Product } from "../Products";

type ProductListProps = {
  products: Product[];
  view: "grid" | "table";
  onEdit: (productId: string) => void;
  onRefresh: () => void;
};

export function ProductList({ products, view, onEdit, onRefresh }: ProductListProps) {
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteProductId) return;

    setIsDeleting(true);
    try {
      // Delete from product_recipes and product_packages
      await supabase.from("product_recipes").delete().eq("product_id", deleteProductId);
      await supabase.from("product_packages").delete().eq("product_id", deleteProductId);
      
      // Delete the product
      const { error } = await supabase.from("products").delete().eq("id", deleteProductId);
      
      if (error) throw error;
      
      toast.success("Produto excluído com sucesso");
      onRefresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
    } finally {
      setIsDeleting(false);
      setDeleteProductId(null);
    }
  };

  const toggleVisibility = async (productId: string, currentVisibility: boolean) => {
    setUpdatingVisibility(productId);
    try {
      const { error } = await supabase
        .from("products")
        .update({ visible_in_store: !currentVisibility })
        .eq("id", productId);
      
      if (error) throw error;
      
      toast.success(currentVisibility ? 
        "Produto ocultado da loja" : 
        "Produto visível na loja"
      );
      
      onRefresh();
    } catch (error) {
      console.error("Error updating product visibility:", error);
      toast.error("Erro ao atualizar visibilidade do produto");
    } finally {
      setUpdatingVisibility(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/30">
        <p className="text-muted-foreground">Nenhum produto encontrado</p>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
            <div className="relative aspect-square overflow-hidden bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sem imagem
                </div>
              )}
              
              <div className="absolute inset-x-0 top-0 p-2 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  onClick={() => onEdit(product.id)}
                >
                  <Edit size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                  onClick={() => setDeleteProductId(product.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-1 gap-2">
                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 shrink-0"
                  disabled={updatingVisibility === product.id}
                  onClick={() => toggleVisibility(product.id, product.visible_in_store)}
                >
                  {product.visible_in_store ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-2">
                {product.description || "Sem descrição"}
              </div>
              
              <div className="mt-auto pt-2 border-t flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Custo: R$ {product.cost.toFixed(2)}</p>
                  <p className="font-medium">R$ {product.price.toFixed(2)}</p>
                </div>
                
                <Badge variant={product.visible_in_store ? "default" : "secondary"}>
                  {product.visible_in_store ? "Visível" : "Oculto"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Visibilidade</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        Sem img
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 max-w-56">
                      {product.description || "Sem descrição"}
                    </div>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {product.category ? (
                  <Badge variant="outline">{product.category}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              
              <TableCell>R$ {product.cost.toFixed(2)}</TableCell>
              <TableCell>R$ {product.price.toFixed(2)}</TableCell>
              
              <TableCell>
                <Button
                  size="sm"
                  variant={product.visible_in_store ? "default" : "secondary"}
                  className="gap-1 text-xs h-7"
                  disabled={updatingVisibility === product.id}
                  onClick={() => toggleVisibility(product.id, product.visible_in_store)}
                >
                  {product.visible_in_store ? (
                    <>
                      <Eye size={12} />
                      <span>Visível</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} />
                      <span>Oculto</span>
                    </>
                  )}
                </Button>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onEdit(product.id)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteProductId(product.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
