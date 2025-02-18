
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type RecipeDetailsProps = {
  recipeId: string | null;
  onClose: () => void;
};

type RecipeWithIngredients = {
  recipes: {
    id: string;
    name: string;
    total_cost: number;
  };
  ingredients: {
    id: string;
    name: string;
    unit: string;
  };
  amount: number;
  ingredient_cost: number;
};

export function RecipeDetails({ recipeId, onClose }: RecipeDetailsProps) {
  const { data: recipeDetails } = useQuery({
    queryKey: ["recipe-details", recipeId],
    queryFn: async () => {
      if (!recipeId) return null;

      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select(`
          amount,
          ingredient_cost,
          recipes (
            id,
            name,
            total_cost
          ),
          ingredients (
            id,
            name,
            unit
          )
        `)
        .eq("recipe_id", recipeId);

      if (error) {
        toast.error("Erro ao carregar detalhes da receita");
        throw error;
      }

      return data as RecipeWithIngredients[];
    },
    enabled: !!recipeId,
  });

  if (!recipeId || !recipeDetails || recipeDetails.length === 0) return null;

  const recipe = recipeDetails[0].recipes;

  return (
    <Dialog open={!!recipeId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recipe.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ingrediente</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipeDetails.map((detail) => (
                <TableRow key={detail.ingredients.id}>
                  <TableCell>{detail.ingredients.name}</TableCell>
                  <TableCell>
                    {detail.amount} {detail.ingredients.unit}
                  </TableCell>
                  <TableCell>R$ {detail.ingredient_cost.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end text-lg font-medium">
            Custo Total: R$ {recipe.total_cost.toFixed(2)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
