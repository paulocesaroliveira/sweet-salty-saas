import { useEffect, useState } from "react";
import { PlusCircle, Trash2, Plus, X } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Recipe = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  servings: number;
  category: string | null;
  total_cost: number;
  packaging_cost: number;
  cost_per_unit: number;
  vendor_id: string;
};

type Ingredient = {
  id: string;
  name: string;
  cost_per_unit: number;
  unit: string;
};

type RecipeIngredient = {
  ingredient_id: string;
  amount: number;
  name?: string;
  unit?: string;
  cost_per_unit?: number;
};

type RecipeDialogProps = {
  recipeId?: string;
  trigger?: React.ReactNode;
  onSave: () => void;
};

const CATEGORIES = [
  "Doces",
  "Salgados",
  "Bolos",
  "Tortas",
  "Bebidas",
  "Outros"
];

export function RecipeDialog({ recipeId, trigger, onSave }: RecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<string>("0");
  
  const [category, setCategory] = useState("");
  const [servings, setServings] = useState("1");
  
  const [totalCost, setTotalCost] = useState(0);
  const [costPerUnit, setCostPerUnit] = useState(0);

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("id, name, cost_per_unit, unit")
        .order("name");

      if (error) throw error;
      return data as Ingredient[];
    },
  });

  const { data: recipeData } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: async () => {
      if (!recipeId) return null;

      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    enabled: !!recipeId,
  });

  const { data: recipeIngredientsData } = useQuery({
    queryKey: ["recipe-ingredients", recipeId],
    queryFn: async () => {
      if (!recipeId) return null;

      const { data, error } = await supabase
        .from("recipe_ingredients")
        .select(`
          id,
          amount,
          ingredient_id,
          ingredients (id, name, unit, cost_per_unit)
        `)
        .eq("recipe_id", recipeId);

      if (error) throw error;
      
      return data.map(item => ({
        ingredient_id: item.ingredient_id,
        amount: item.amount,
        name: item.ingredients.name,
        unit: item.ingredients.unit,
        cost_per_unit: item.ingredients.cost_per_unit
      })) as RecipeIngredient[];
    },
    enabled: !!recipeId,
  });

  useEffect(() => {
    if (recipeData) {
      setName(recipeData.name);
      setDescription(recipeData.description || "");
      setCategory(recipeData.category || "");
      setServings(String(recipeData.servings));
      setTotalCost(recipeData.total_cost);
      setCostPerUnit(recipeData.cost_per_unit);
    }
  }, [recipeData]);

  useEffect(() => {
    if (recipeIngredientsData) {
      setRecipeIngredients(recipeIngredientsData);
    }
  }, [recipeIngredientsData]);

  useEffect(() => {
    const calculatedTotalCost = recipeIngredients.reduce((sum, item) => {
      const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
      if (ingredient) {
        return sum + (ingredient.cost_per_unit * item.amount);
      }
      return sum + ((item.cost_per_unit || 0) * item.amount);
    }, 0);
    
    setTotalCost(calculatedTotalCost);
    
    const numServings = parseInt(servings) || 1;
    setCostPerUnit(calculatedTotalCost / numServings);
  }, [recipeIngredients, servings, ingredients]);

  const handleAddIngredient = () => {
    if (!selectedIngredientId || parseFloat(selectedAmount) <= 0) {
      toast.error("Selecione um ingrediente e uma quantidade válida");
      return;
    }

    const ingredient = ingredients?.find(ing => ing.id === selectedIngredientId);
    if (!ingredient) {
      toast.error("Ingrediente não encontrado");
      return;
    }

    const existingIndex = recipeIngredients.findIndex(
      item => item.ingredient_id === selectedIngredientId
    );

    if (existingIndex >= 0) {
      const updatedIngredients = [...recipeIngredients];
      updatedIngredients[existingIndex] = {
        ...updatedIngredients[existingIndex],
        amount: updatedIngredients[existingIndex].amount + parseFloat(selectedAmount)
      };
      setRecipeIngredients(updatedIngredients);
    } else {
      setRecipeIngredients([
        ...recipeIngredients,
        {
          ingredient_id: selectedIngredientId,
          amount: parseFloat(selectedAmount),
          name: ingredient.name,
          unit: ingredient.unit,
          cost_per_unit: ingredient.cost_per_unit
        }
      ]);
    }

    setSelectedIngredientId("");
    setSelectedAmount("0");
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients.splice(index, 1);
    setRecipeIngredients(updatedIngredients);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || recipeIngredients.length === 0) {
      toast.error("Preencha o nome da receita e adicione pelo menos um ingrediente");
      return;
    }

    setIsLoading(true);
    try {
      const recipeData = {
        name,
        description: description || null,
        category: category || null,
        servings: parseInt(servings) || 1,
        vendor_id: user?.id,
        total_cost: totalCost,
        cost_per_unit: costPerUnit,
        packaging_cost: 0,
      };

      let savedRecipeId = recipeId;

      if (recipeId) {
        const { error } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq("id", recipeId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("recipes")
          .insert(recipeData)
          .select('id')
          .single();

        if (error) throw error;
        savedRecipeId = data.id;
      }

      if (savedRecipeId) {
        const { error } = await supabase
          .from("recipe_ingredients")
          .delete()
          .eq("recipe_id", savedRecipeId);

        if (error) throw error;
      }

      if (savedRecipeId && recipeIngredients.length > 0) {
        const ingredientsToInsert = recipeIngredients.map(item => {
          const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
          return {
            recipe_id: savedRecipeId,
            ingredient_id: item.ingredient_id,
            amount: item.amount,
            ingredient_cost: (ingredient?.cost_per_unit || item.cost_per_unit || 0) * item.amount
          };
        });

        const { error } = await supabase
          .from("recipe_ingredients")
          .insert(ingredientsToInsert);

        if (error) throw error;
      }

      toast.success(recipeId ? "Receita atualizada com sucesso" : "Receita criada com sucesso");
      onSave();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(recipeId ? "Erro ao atualizar receita" : "Erro ao criar receita");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setRecipeIngredients([]);
    setSelectedIngredientId("");
    setSelectedAmount("0");
    setCategory("");
    setServings("1");
    setTotalCost(0);
    setCostPerUnit(0);
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{recipeId ? "Editar Receita" : "Nova Receita"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Informações Básicas</h3>
            <div>
              <Label htmlFor="name">Nome da Receita*</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Brigadeiro Gourmet"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição da receita"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Ingredientes</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="ingredient">Ingrediente</Label>
                <Select 
                  value={selectedIngredientId} 
                  onValueChange={setSelectedIngredientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ingrediente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients?.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-36">
                <Label htmlFor="amount">Quantidade</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={selectedAmount}
                  onChange={(e) => setSelectedAmount(e.target.value)}
                />
              </div>
              
              <div className="self-end">
                <Button 
                  type="button" 
                  onClick={handleAddIngredient}
                  className="gap-2"
                >
                  <Plus size={16} />
                  Adicionar
                </Button>
              </div>
            </div>
            
            {recipeIngredients.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-2">Ingrediente</th>
                      <th className="text-center p-2">Quantidade</th>
                      <th className="text-center p-2">Custo</th>
                      <th className="text-right p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeIngredients.map((item, index) => {
                      const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
                      const name = item.name || ingredient?.name || "Ingrediente";
                      const unit = item.unit || ingredient?.unit || "";
                      const costPerUnit = item.cost_per_unit || ingredient?.cost_per_unit || 0;
                      const cost = costPerUnit * item.amount;
                      
                      return (
                        <tr key={index} className="border-t">
                          <td className="p-2">{name}</td>
                          <td className="p-2 text-center">{item.amount} {unit}</td>
                          <td className="p-2 text-center">R$ {cost.toFixed(2)}</td>
                          <td className="p-2 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveIngredient(index)}
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-md">
                Nenhum ingrediente adicionado
              </div>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-lg">Detalhes da Receita</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="servings">Porções*</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
            <h3 className="font-semibold text-lg">Custos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Custo total dos ingredientes</p>
                <p className="text-lg font-semibold">R$ {totalCost.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Custo por porção</p>
                <p className="text-lg font-semibold">R$ {costPerUnit.toFixed(2)}</p>
              </div>
            </div>
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
              {isLoading ? "Salvando..." : (recipeId ? "Atualizar" : "Criar")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
