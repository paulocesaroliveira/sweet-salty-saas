
import { useEffect, useState } from "react";
import { PlusCircle, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  type: 'solid' | 'liquid';
  unit: string;
  brand: string | null;
  supplier: string | null;
  category: string | null;
  stock: number;
  package_cost: number;
  package_amount: number;
  cost_per_unit: number;
};

type IngredientDialogProps = {
  onSave: () => void;
  ingredient?: Ingredient;
};

const CATEGORIES = [
  "Farinhas",
  "Laticínios",
  "Chocolates",
  "Frutas",
  "Gorduras",
  "Açúcares",
  "Outros"
];

const VALID_UNITS = {
  solid: [
    { value: "g", label: "Gramas (g)" },
    { value: "kg", label: "Quilogramas (kg)" },
    { value: "un", label: "Unidades (un)" },
  ],
  liquid: [
    { value: "ml", label: "Mililitros (ml)" },
    { value: "l", label: "Litros (l)" },
  ],
};

export function IngredientDialog({ onSave, ingredient }: IngredientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [type, setType] = useState<"solid" | "liquid">("solid");
  const [unit, setUnit] = useState("");
  const [brand, setBrand] = useState("");
  const [supplier, setSupplier] = useState("");
  const [category, setCategory] = useState("");
  const [packageCost, setPackageCost] = useState("");
  const [packageAmount, setPackageAmount] = useState("");
  const [stock, setStock] = useState("");

  useEffect(() => {
    if (ingredient) {
      setName(ingredient.name);
      setType(ingredient.type);
      setUnit(ingredient.unit);
      setBrand(ingredient.brand || "");
      setSupplier(ingredient.supplier || "");
      setCategory(ingredient.category || "");
      setPackageCost(ingredient.package_cost.toString());
      setPackageAmount(ingredient.package_amount.toString());
      setStock(ingredient.stock?.toString() || "0");
    }
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !type || !unit || !packageCost || !packageAmount) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const costPerUnit = Number(packageCost) / Number(packageAmount);
      const data = {
        name,
        type,
        unit,
        brand: brand || null,
        supplier: supplier || null,
        category: category || null,
        stock: Number(stock) || 0,
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
    setType("solid");
    setUnit("");
    setBrand("");
    setSupplier("");
    setCategory("");
    setPackageCost("");
    setPackageAmount("");
    setStock("0");
  };

  const availableUnits = VALID_UNITS[type];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {ingredient ? (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil size={16} />
          </Button>
        ) : (
          <Button className="gap-2">
            <PlusCircle size={20} />
            Novo Ingrediente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {ingredient ? "Editar Ingrediente" : "Novo Ingrediente"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do ingrediente. O custo por unidade será calculado automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Farinha de Trigo"
              />
            </div>

            <div className="space-y-2">
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
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select 
                value={type} 
                onValueChange={(value: "solid" | "liquid") => {
                  setType(value);
                  setUnit(""); 
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Sólido</SelectItem>
                  <SelectItem value="liquid">Líquido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unidade de Medida *</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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
              <Label htmlFor="supplier">Fornecedor</Label>
              <Input
                id="supplier"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Distribuidora ABC"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="packageAmount">Qtd. Embalagem *</Label>
              <Input
                id="packageAmount"
                type="number"
                step="0.01"
                min="0"
                value={packageAmount}
                onChange={(e) => setPackageAmount(e.target.value)}
                placeholder={`Ex: 1000 ${unit}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packageCost">Custo da Emb. (R$) *</Label>
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
              <Label htmlFor="stock">Estoque Atual</Label>
              <Input
                id="stock"
                type="number"
                step="0.01"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder={`Ex: 500 ${unit}`}
              />
            </div>
          </div>

          {packageAmount && packageCost && (
            <div className="text-sm text-muted-foreground">
              Custo por {unit}: R$ {(Number(packageCost) / Number(packageAmount)).toFixed(3)}
            </div>
          )}

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
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
