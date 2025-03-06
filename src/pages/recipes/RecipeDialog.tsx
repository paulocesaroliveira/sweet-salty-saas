import { useEffect, useState } from "react";
import { PlusCircle, Trash2, Plus, X, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { formatCurrency } from "@/lib/utils";

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
  package_amount: number;
};

type RecipeIngredient = {
  ingredient_id: string;
  amount: number;
  name?: string;
  unit?: string;
  cost_per_unit?: number;
};

type IngredientPerServing = {
  ingredient_id: string;
  amount: number;
  name?: string;
  unit?: string;
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<string>("0");
  
  const [servings, setServings] = useState("1");
  
  const [ingredientsPerServing, setIngredientsPerServing] = useState<IngredientPerServing[]>([]);
  const [selectedServingIngredientId, setSelectedServingIngredientId] = useState<string>("");
  const [selectedServingAmount, setSelectedServingAmount] = useState<string>("0");
  
  const [totalCost, setTotalCost] = useState(0);
  const [costPerUnit, setCostPerUnit] = useState(0);

  const { data: ingredients = [] } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("id, name, cost_per_unit, unit, package_amount")
        .order("name");

      if (error) throw error;
      return data as Ingredient[] || [];
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
          ingredients (id, name, unit, cost_per_unit, package_amount)
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

  const { data: ingredientsPerServingData } = useQuery({
    queryKey: ["ingredients-per-serving", recipeId],
    queryFn: async () => {
      if (!recipeId) return null;

      const { data: allIngredients, error } = await supabase
        .from("recipe_ingredients")
        .select(`
          id,
          amount,
          ingredient_id,
          ingredients (id, name, unit, cost_per_unit, package_amount)
        `)
        .eq("recipe_id", recipeId);

      if (error) throw error;
      
      return [];
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
    if (ingredientsPerServingData) {
      setIngredientsPerServing(ingredientsPerServingData);
    }
  }, [ingredientsPerServingData]);

  useEffect(() => {
    const calculatedTotalCost = recipeIngredients.reduce((sum, item) => {
      const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
      if (ingredient) {
        return sum + (ingredient.cost_per_unit * item.amount);
      }
      return sum + ((item.cost_per_unit || 0) * item.amount);
    }, 0);

    const perServingTotalCost = ingredientsPerServing.reduce((sum, item) => {
      const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
      if (ingredient) {
        return sum + (ingredient.cost_per_unit * item.amount * parseInt(servings));
      }
      return sum;
    }, 0);
    
    const totalCostWithServings = calculatedTotalCost + perServingTotalCost;
    setTotalCost(totalCostWithServings);
    
    const numServings = parseInt(servings) || 1;
    setCostPerUnit(totalCostWithServings / numServings);
  }, [recipeIngredients, ingredientsPerServing, servings, ingredients]);

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

  const handleAddIngredientPerServing = () => {
    if (!selectedServingIngredientId || parseFloat(selectedServingAmount) <= 0) {
      toast.error("Selecione um ingrediente e uma quantidade válida para a porção");
      return;
    }

    const ingredient = ingredients?.find(ing => ing.id === selectedServingIngredientId);
    if (!ingredient) {
      toast.error("Ingrediente não encontrado");
      return;
    }

    const existingIndex = ingredientsPerServing.findIndex(
      item => item.ingredient_id === selectedServingIngredientId
    );

    if (existingIndex >= 0) {
      const updatedIngredients = [...ingredientsPerServing];
      updatedIngredients[existingIndex] = {
        ...updatedIngredients[existingIndex],
        amount: parseFloat(selectedServingAmount)
      };
      setIngredientsPerServing(updatedIngredients);
    } else {
      setIngredientsPerServing([
        ...ingredientsPerServing,
        {
          ingredient_id: selectedServingIngredientId,
          amount: parseFloat(selectedServingAmount),
          name: ingredient.name,
          unit: ingredient.unit
        }
      ]);
    }

    setSelectedServingIngredientId("");
    setSelectedServingAmount("0");
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = [...recipeIngredients];
    updatedIngredients.splice(index, 1);
    setRecipeIngredients(updatedIngredients);
  };

  const handleRemoveIngredientPerServing = (index: number) => {
    const updatedIngredients = [...ingredientsPerServing];
    updatedIngredients.splice(index, 1);
    setIngredientsPerServing(updatedIngredients);
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
        const { error: deleteError } = await supabase
          .from("recipe_ingredients")
          .delete()
          .eq("recipe_id", savedRecipeId);

        if (deleteError) throw deleteError;

        const ingredientPromises = [];
        
        for (const item of recipeIngredients) {
          const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
          const ingredientCost = (ingredient?.cost_per_unit || item.cost_per_unit || 0) * item.amount;
          
          ingredientPromises.push(
            supabase
              .from("recipe_ingredients")
              .insert({
                recipe_id: savedRecipeId,
                ingredient_id: item.ingredient_id,
                amount: item.amount,
                ingredient_cost: ingredientCost
              })
          );
        }
        
        for (const item of ingredientsPerServing) {
          const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
          const totalAmount = item.amount * (parseInt(servings) || 1);
          const ingredientCost = (ingredient?.cost_per_unit || 0) * totalAmount;
          
          ingredientPromises.push(
            supabase
              .from("recipe_ingredients")
              .insert({
                recipe_id: savedRecipeId,
                ingredient_id: item.ingredient_id,
                amount: totalAmount,
                ingredient_cost: ingredientCost
              })
          );
        }
        
        const results = await Promise.all(ingredientPromises);
        
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          throw errors[0].error;
        }
      }

      toast.success(recipeId ? "Receita atualizada com sucesso" : "Receita criada com sucesso");
      onSave();
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting recipe:", error);
      toast.error(recipeId ? "Erro ao atualizar receita" : "Erro ao criar receita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recipeId) return;
    
    setIsLoading(true);
    try {
      const { error: deleteIngredientsError } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", recipeId);
      
      if (deleteIngredientsError) throw deleteIngredientsError;
      
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId);
      
      if (error) throw error;
      
      toast.success("Receita excluída com sucesso");
      onSave();
      setOpen(false);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao excluir receita:", error);
      toast.error("Erro ao excluir receita");
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
    setIngredientsPerServing([]);
    setSelectedServingIngredientId("");
    setSelectedServingAmount("0");
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
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{recipeId ? "Editar Receita" : "Nova Receita"}</DialogTitle>
          <DialogDescription>
            Preencha os dados da receita e adicione os ingredientes necessários.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-2 -mr-2">
          <form className="space-y-6">
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
                  <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                    <SelectTrigger id="ingredient">
                      <SelectValue placeholder="Selecione um ingrediente" />
                    </SelectTrigger>
                    <SelectContent>
                      {ingredients.map((ingredient) => (
                        <SelectItem key={ingredient.id} value={ingredient.id}>
                          {ingredient.name} ({ingredient.unit}) - {ingredient.package_amount} por embalagem
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
                        <th className="text-center p-2">Pacote</th>
                        <th className="text-center p-2">Custo</th>
                        <th className="text-right p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipeIngredients.map((item, index) => {
                        const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
                        const name = item.name || ingredient?.name || "Ingrediente";
                        const unit = item.unit || ingredient?.unit || "";
                        const packageAmount = ingredient?.package_amount || 0;
                        const costPerUnit = item.cost_per_unit || ingredient?.cost_per_unit || 0;
                        const cost = costPerUnit * item.amount;
                        
                        return (
                          <tr key={index} className="border-t">
                            <td className="p-2">{name}</td>
                            <td className="p-2 text-center">{item.amount} {unit}</td>
                            <td className="p-2 text-center">{packageAmount} {unit}</td>
                            <td className="p-2 text-center">{formatCurrency(cost)}</td>
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
              <h3 className="font-semibold text-lg">Porção/Unidade</h3>
              
              <div>
                <Label htmlFor="servings">Quantidade de unidades ou porções que a receita produz*</Label>
                <Input
                  id="servings"
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label>Ingredientes por porção/unidade</Label>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Label htmlFor="servingIngredient">Ingrediente</Label>
                    <Select 
                      value={selectedServingIngredientId} 
                      onValueChange={setSelectedServingIngredientId}
                    >
                      <SelectTrigger id="servingIngredient">
                        <SelectValue placeholder="Selecione um ingrediente" />
                      </SelectTrigger>
                      <SelectContent>
                        {ingredients.map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.id}>
                            {ingredient.name} ({ingredient.unit}) - {ingredient.package_amount} por embalagem
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-full sm:w-36">
                    <Label htmlFor="servingAmount">Quant. por porção</Label>
                    <Input
                      id="servingAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedServingAmount}
                      onChange={(e) => setSelectedServingAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="self-end">
                    <Button 
                      type="button" 
                      onClick={handleAddIngredientPerServing}
                      className="gap-2"
                    >
                      <Plus size={16} />
                      Adicionar
                    </Button>
                  </div>
                </div>
                
                {ingredientsPerServing.length > 0 ? (
                  <div className="border rounded-md overflow-hidden mt-4">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2">Ingrediente</th>
                          <th className="text-center p-2">Quant. por porção</th>
                          <th className="text-right p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ingredientsPerServing.map((item, index) => {
                          const ingredient = ingredients?.find(ing => ing.id === item.ingredient_id);
                          const name = item.name || ingredient?.name || "Ingrediente";
                          const unit = item.unit || ingredient?.unit || "";
                          
                          return (
                            <tr key={index} className="border-t">
                              <td className="p-2">{name}</td>
                              <td className="p-2 text-center">{item.amount} {unit}</td>
                              <td className="p-2 text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveIngredientPerServing(index)}
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
                  <div className="text-center p-4 text-muted-foreground bg-muted/20 rounded-md">
                    Nenhum ingrediente por porção adicionado
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 p-4 border rounded-lg bg-muted/20">
              <h3 className="font-semibold text-lg">Custos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Custo total dos ingredientes</p>
                  <p className="text-lg font-semibold">{formatCurrency(totalCost)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Custo por porção/unidade</p>
                  <p className="text-lg font-semibold">{formatCurrency(costPerUnit)}</p>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          {recipeId && (
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={isLoading}>
                  <Trash2 size={16} className="mr-2" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir receita</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a receita "{name}"? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : (recipeId ? "Atualizar" : "Criar")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
