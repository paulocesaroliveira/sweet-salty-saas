
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Pencil, Trash2, Eye } from "lucide-react";
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
import { RecipeDialog } from "./RecipeDialog";
import { RecipeDetails } from "./RecipeDetails";

type Recipe = {
  id: string;
  name: string;
  total_cost: number;
  created_at: string;
};

const Recipes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  const { data: recipes, refetch } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar receitas");
        throw error;
      }

      return data as Recipe[];
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta receita?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Receita excluída com sucesso");
      refetch();
    } catch (error) {
      toast.error("Erro ao excluir receita");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">Receitas</h1>
        <RecipeDialog onSave={refetch} />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Custo Total</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipes?.map((recipe) => (
              <TableRow key={recipe.id}>
                <TableCell>{recipe.name}</TableCell>
                <TableCell>R$ {recipe.total_cost.toFixed(2)}</TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedRecipe(recipe.id)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(recipe.id)}
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!recipes || recipes.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-neutral-500"
                >
                  Nenhuma receita cadastrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <RecipeDetails
        recipeId={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
};

export default Recipes;
