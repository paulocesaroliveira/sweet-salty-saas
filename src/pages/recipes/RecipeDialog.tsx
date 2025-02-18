
import { useEffect, useState } from "react";
import { PlusCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

type RecipeDialogProps = {
  recipeId?: string;
  trigger?: React.ReactNode;
  onSave: () => void;
};

type Ingredient = {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
};

type RecipeIngredient = {
  ingredient: Ingredient;
  amount: number;
  cost: number;
};

export function RecipeDialog({ recipeId, trigger, onSave }: RecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [amount, setAmount] = useState("");

  const { data: ingredients } = useQuery({
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

  const { data: recipeDetails } = useQuery({
    queryKey: ["recipe-edit", recipeId],
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
            unit,
            cost_per_unit
          )
        `)
        .eq("recipe_id", recipeId);

      if (error) {
        toast.error("Erro ao carregar detalhes da receita");
        throw error;
      }

      return data;
    },
    enabled: !!recipeId,
  });

  useEffect(() => {
    if (recipeDetails && recipeDetails.length > 0) {
      setName(recipeDetails[0].recipes.name);
      
      const ingredients = recipeDetails.map((detail) => ({
        ingredient: {
          id: detail.ingredients.id,
          name: detail.ingredients.name,
          unit: detail.ingredients.unit,
          cost_per_unit: detail.ingredients.cost_per_unit,
        },
        amount: detail.amount,
        cost: detail.ingredient_cost,
      }));

      setSelectedIngredients(ingredients);
    }
  }, [recipeDetails]);

  const addIngredient = () => {
    if (!selectedIngredientId || !amount) {
      toast.error("Selecione um ingrediente e defina a quantidade");
      return;
    }

    const ingredient = ingredients?.find((i) => i.id === selectedIngredientId);
    if (!ingredient) return;

    const cost = ingredient.cost_per_unit * Number(amount);
    
    setSelectedIngredients([
      ...selectedIngredients,
      {
        ingredient,
        amount: Number(amount),
        cost,
      },
    ]);

    setSelectedIngredientId("");
    setAmount("");
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients(
      selectedIngredients.filter((i) => i.ingredient.id !== ingredientId)
    );
  };

  const calculateTotalCost = () => {
    return selectedIngredients.reduce((total, item) => total + item.cost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || selectedIngredients.length === 0) {
      toast.error("Preencha todos os campos e adicione pelo menos um ingrediente");
      return;
    }

    setIsLoading(true);
    try {
      const totalCost = calculateTotalCost();

      if (recipeId) {
        // Atualização
        const { error: recipeError } = await supabase
          .from("recipes")
          .update({
            name,
            total_cost: totalCost,
          })
          .eq("id", recipeId);

        if (recipeError) throw recipeError;

        // Remove ingredientes antigos
        const { error: deleteError } = await supabase
          .from("recipe_ingredients")
          .delete()
          .eq("recipe_id", recipeId);

        if (deleteError) throw deleteError;

        // Adiciona novos ingredientes
        const recipeIngredients = selectedIngredients.map((item) => ({
          recipe_id: recipeId,
          ingredient_id: item.ingredient.id,
          amount: item.amount,
          ingredient_cost: item.cost,
        }));

        const { error: ingredientsError } = await supabase
          .from("recipe_ingredients")
          .insert(recipeIngredients);

        if (ingredientsError) throw ingredientsError;

        toast.success("Receita atualizada com sucesso");
      } else {
        // Criação
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert({
            name,
            total_cost: totalCost,
            vendor_id: user?.id,
          })
          .select()
          .single();

        if (recipeError) throw recipeError;

        const recipeIngredients = selectedIngredients.map((item) => ({
          recipe_id: recipe.id,
          ingredient_id: item.ingredient.id,
          amount: item.amount,
          ingredient_cost: item.cost,
        }));

        const { error: ingredientsError } = await supabase
          .from("recipe_ingredients")
          .insert(recipeIngredients);

        if (ingredientsError) throw ingredientsError;

        toast.success("Receita adicionada com sucesso");
      }

      onSave();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(recipeId ? "Erro ao atualizar receita" : "Erro ao adicionar receita");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setSelectedIngredients([]);
    setSelectedIngredientId("");
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <PlusCircle size={20} />
            Nova Receita
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{recipeId ? "Editar Receita" : "Nova Receita"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Receita</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Bolo de Chocolate"
            />
          </div>

          <div className="space-y-4">
            <Label>Ingredientes</Label>
            
            <div className="flex gap-2">
              <select
                value={selectedIngredientId}
                onChange={(e) => setSelectedIngredientId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione um ingrediente</option>
                {ingredients?.map((ingredient) => (
                  <option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name}
                  </option>
                ))}
              </select>
              
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Quantidade"
                className="w-32"
              />
              
              <Button type="button" onClick={addIngredient}>
                Adicionar
              </Button>
            </div>

            <div className="border rounded-lg divide-y">
              {selectedIngredients.map((item) => (
                <div
                  key={item.ingredient.id}
                  className="flex items-center justify-between p-3"
                >
                  <div>
                    <span className="font-medium">{item.ingredient.name}</span>
                    <span className="text-sm text-neutral-500 ml-2">
                      {item.amount} {item.ingredient.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">
                      R$ {item.cost.toFixed(2)}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => removeIngredient(item.ingredient.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {selectedIngredients.length === 0 && (
                <div className="p-8 text-center text-neutral-500">
                  Nenhum ingrediente adicionado
                </div>
              )}
            </div>

            {selectedIngredients.length > 0 && (
              <div className="flex justify-end text-lg font-medium">
                Custo Total: R$ {calculateTotalCost().toFixed(2)}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {recipeId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
