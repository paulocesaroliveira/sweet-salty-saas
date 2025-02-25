
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

type RecipeDialogProps = {
  recipeId?: string;
  trigger?: React.ReactNode;
  onSave: () => void;
};

export function RecipeDialog({ recipeId, trigger, onSave }: RecipeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [servings, setServings] = useState("1");
  const [category, setCategory] = useState("");

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

  useEffect(() => {
    if (recipeData) {
      setName(recipeData.name);
      setDescription(recipeData.description || "");
      setServings(String(recipeData.servings));
      setCategory(recipeData.category || "");
    }
  }, [recipeData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !servings) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const recipeData = {
        name,
        description: description || null,
        servings: Number(servings),
        category: category || null,
        vendor_id: user?.id,
      };

      if (recipeId) {
        const { error } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq("id", recipeId);

        if (error) throw error;
        toast.success("Receita atualizada com sucesso");
      } else {
        const { error } = await supabase
          .from("recipes")
          .insert([recipeData]);

        if (error) throw error;
        toast.success("Receita criada com sucesso");
      }

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
    setServings("1");
    setCategory("");
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{recipeId ? "Editar Receita" : "Nova Receita"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descrição da receita"
              />
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

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Doces, Bolos, Salgados"
              />
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
              {recipeId ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
