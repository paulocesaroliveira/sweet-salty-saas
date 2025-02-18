
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Ingredient = {
  id: string;
  name: string;
  unit: string;
  brand: string;
  package_cost: number;
  package_amount: number;
};

type IngredientDialogProps = {
  onSave: () => void;
  ingredient?: Ingredient;
};

const VALID_UNITS = [
  { value: "g", label: "Grama (g)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "un", label: "Unidade (un)" },
];

export function IngredientDialog({ onSave, ingredient }: IngredientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [brand, setBrand] = useState("");
  const [packageCost, setPackageCost] = useState("");
  const [packageAmount, setPackageAmount] = useState("");

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setUnit(ingredient.unit);
      setBrand(ingredient.brand || "");
      setPackageCost(ingredient.package_cost.toString());
      setPackageAmount(ingredient.package_amount.toString());
    }
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !unit || !packageCost || !packageAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const costPerUnit = Number(packageCost) / Number(packageAmount);
      const data = {
        name,
        unit,
        brand,
        package_cost: Number(packageCost),
        package_amount: Number(packageAmount),
        cost_per_unit: costPerUnit,
        vendor_id: user?.id,
      };

      let error;
      if (ingredient) {
        // Update
        ({ error } = await supabase
          .from("ingredients")
          .update(data)
          .eq("id", ingredient.id));
      } else {
        // Insert
        ({ error } = await supabase.from("ingredients").insert(data));
      }

      if (error) throw error;

      toast.success(
        ingredient 
          ? "Ingrediente atualizado com sucesso"
          : "Ingrediente adicionado com sucesso"
      );
      onSave();
      setOpen(false);
      resetForm();
    } catch (error) {
      toast.error(
        ingredient
          ? "Erro ao atualizar ingrediente"
          : "Erro ao adicionar ingrediente"
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setUnit("");
    setBrand("");
    setPackageCost("");
    setPackageAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {ingredient ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PlusCircle size={16} />
          </Button>
        ) : (
          <Button className="gap-2">
            <PlusCircle size={20} />
            Novo Ingrediente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {ingredient ? "Editar Ingrediente" : "Novo Ingrediente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Farinha de Trigo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex: Dona Benta"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {VALID_UNITS.map((unit) => (
                  <SelectItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageCost">Custo do Pacote (R$)</Label>
            <Input
              id="packageCost"
              type="number"
              step="0.01"
              min="0"
              value={packageCost}
              onChange={(e) => setPackageCost(e.target.value)}
              placeholder="Ex: 15.90"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="packageAmount">Quantidade no Pacote</Label>
            <Input
              id="packageAmount"
              type="number"
              step="0.01"
              min="0"
              value={packageAmount}
              onChange={(e) => setPackageAmount(e.target.value)}
              placeholder="Ex: 1"
            />
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
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
