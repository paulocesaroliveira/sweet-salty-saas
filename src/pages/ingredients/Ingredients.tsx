
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  type: 'solid' | 'liquid';
  unit: string;
  brand: string | null;
  package_cost: number;
  package_amount: number;
  cost_per_unit: number;
};

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

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

      // Garantindo que o tipo está definido para os registros existentes
      return (data || []).map(ingredient => ({
        ...ingredient,
        type: ingredient.type || 'solid'
      })) as Ingredient[];
    },
  });

  const filteredIngredients = ingredients?.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ingredient.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ingrediente?")) return;

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
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Ingredientes</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os ingredientes utilizados nas suas receitas
          </p>
        </div>
        <IngredientDialog onSave={refetch} />
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar ingredientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Qtd. Embalagem</TableHead>
              <TableHead>Custo Emb.</TableHead>
              <TableHead>Custo/Unidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients?.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell className="font-medium">{ingredient.name}</TableCell>
                <TableCell>
                  {ingredient.type === 'solid' ? 'Sólido' : 'Líquido'}
                </TableCell>
                <TableCell>{ingredient.brand || "-"}</TableCell>
                <TableCell>
                  {ingredient.package_amount} {ingredient.unit}
                </TableCell>
                <TableCell>
                  R$ {ingredient.package_cost.toFixed(2)}
                </TableCell>
                <TableCell>
                  R$ {ingredient.cost_per_unit.toFixed(3)}/{ingredient.unit}
                </TableCell>
                <TableCell className="text-right">
                  <IngredientDialog
                    ingredient={ingredient}
                    onSave={refetch}
                  />
                </TableCell>
              </TableRow>
            ))}

            {(!filteredIngredients || filteredIngredients.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  {searchTerm
                    ? "Nenhum ingrediente encontrado para esta busca"
                    : "Nenhum ingrediente cadastrado"}
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
