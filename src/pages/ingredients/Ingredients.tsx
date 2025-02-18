
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { IngredientDialog } from "./IngredientDialog";

type Ingredient = {
  id: string;
  name: string;
  unit: string;
  package_cost: number;
  package_amount: number;
  cost_per_unit: number;
  created_at: string;
};

const Ingredients = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: ingredients, refetch } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar ingredientes");
        throw error;
      }

      return data as Ingredient[];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ingrediente?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("ingredients")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Ingrediente excluído com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir ingrediente");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Ingredientes</h1>
        <IngredientDialog onSave={refetch} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Custo do Pacote</TableHead>
              <TableHead>Quantidade no Pacote</TableHead>
              <TableHead>Custo por Unidade</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients?.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>{ingredient.name}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                <TableCell>R$ {ingredient.package_cost.toFixed(2)}</TableCell>
                <TableCell>
                  {ingredient.package_amount} {ingredient.unit}
                </TableCell>
                <TableCell>R$ {ingredient.cost_per_unit.toFixed(2)}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(ingredient.id)}
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!ingredients || ingredients.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                  Nenhum ingrediente cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Ingredients;
