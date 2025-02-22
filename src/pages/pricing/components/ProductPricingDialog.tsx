
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

type ProductPricingDialogProps = {
  pricingId: string | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function ProductPricingDialog({
  pricingId,
  open,
  onClose,
  onSave,
}: ProductPricingDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [recipeId, setRecipeId] = useState("");
  const [laborMinutes, setLaborMinutes] = useState("");
  const [packagingCost, setPackagingCost] = useState("");
  const [profitMargin, setProfitMargin] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");

  // Buscar receitas disponíveis
  const { data: recipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, name, total_cost")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  // Buscar custo de mão de obra por hora
  const { data: laborCost } = useQuery({
    queryKey: ["labor-cost"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labor_costs")
        .select("hourly_rate")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  // Buscar custos fixos mensais totais
  const { data: fixedCosts } = useQuery({
    queryKey: ["fixed-costs-total"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("amount, frequency");

      if (error) throw error;

      // Calcular total mensal (custos mensais + custos anuais divididos por 12)
      return data.reduce((total, cost) => {
        if (cost.frequency === "monthly") {
          return total + cost.amount;
        } else if (cost.frequency === "yearly") {
          return total + (cost.amount / 12);
        }
        return total;
      }, 0);
    },
  });

  // Buscar precificação existente se estiver editando
  const { data: pricing } = useQuery({
    queryKey: ["pricing", pricingId],
    queryFn: async () => {
      if (!pricingId) return null;

      const { data, error } = await supabase
        .from("product_pricing")
        .select("*")
        .eq("id", pricingId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!pricingId,
  });

  useEffect(() => {
    if (pricing) {
      setRecipeId(pricing.recipe_id);
      setLaborMinutes(pricing.labor_minutes.toString());
      setPackagingCost(pricing.packaging_cost.toString());
      setProfitMargin(pricing.profit_margin.toString());
      setYieldAmount(pricing.yield_amount.toString());
    } else {
      setRecipeId("");
      setLaborMinutes("");
      setPackagingCost("");
      setProfitMargin("");
      setYieldAmount("");
    }
  }, [pricing]);

  const calculatePricing = () => {
    if (!recipes || !laborCost || !fixedCosts) return null;

    const recipe = recipes.find((r) => r.id === recipeId);
    if (!recipe) return null;

    const laborCostValue = (Number(laborMinutes) / 60) * laborCost.hourly_rate;
    const fixedCostShare = fixedCosts * 0.01; // 1% dos custos fixos por produto
    const totalCost = recipe.total_cost + laborCostValue + Number(packagingCost) + fixedCostShare;
    const profitValue = totalCost * (Number(profitMargin) / 100);
    const finalPrice = totalCost + profitValue;
    const unitCost = totalCost / Number(yieldAmount);
    const unitPrice = finalPrice / Number(yieldAmount);

    return {
      recipe_cost: recipe.total_cost,
      labor_cost: laborCostValue,
      fixed_costs_share: fixedCostShare,
      total_cost: totalCost,
      suggested_price: finalPrice,
      final_price: finalPrice,
      unit_cost: unitCost,
      unit_price: unitPrice,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const pricing = calculatePricing();
      if (!pricing) throw new Error("Erro ao calcular precificação");

      const data = {
        recipe_id: recipeId,
        labor_minutes: Number(laborMinutes),
        packaging_cost: Number(packagingCost),
        profit_margin: Number(profitMargin),
        yield_amount: Number(yieldAmount),
        vendor_id: user?.id,
        ...pricing,
      };

      if (pricingId) {
        const { error } = await supabase
          .from("product_pricing")
          .update(data)
          .eq("id", pricingId);

        if (error) throw error;
        toast.success("Precificação atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("product_pricing")
          .insert(data);

        if (error) throw error;
        toast.success("Precificação criada com sucesso!");
      }

      onSave();
    } catch (error) {
      toast.error("Erro ao salvar precificação");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {pricingId ? "Editar Precificação" : "Nova Precificação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipe">Receita</Label>
              <Select value={recipeId} onValueChange={setRecipeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma receita" />
                </SelectTrigger>
                <SelectContent>
                  {recipes?.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="yieldAmount">Rendimento (unidades)</Label>
              <Input
                id="yieldAmount"
                type="number"
                min="1"
                value={yieldAmount}
                onChange={(e) => setYieldAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="laborMinutes">Tempo de Trabalho (minutos)</Label>
              <Input
                id="laborMinutes"
                type="number"
                min="0"
                value={laborMinutes}
                onChange={(e) => setLaborMinutes(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="packagingCost">Custo de Embalagem</Label>
              <Input
                id="packagingCost"
                type="number"
                step="0.01"
                min="0"
                value={packagingCost}
                onChange={(e) => setPackagingCost(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitMargin">Margem de Lucro (%)</Label>
              <Input
                id="profitMargin"
                type="number"
                min="0"
                max="1000"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                required
              />
            </div>
          </div>

          {recipeId && laborMinutes && packagingCost && profitMargin && yieldAmount && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const pricing = calculatePricing();
                    if (!pricing) return null;

                    return (
                      <>
                        <div>
                          <Label>Custo da Receita</Label>
                          <p className="text-lg">R$ {pricing.recipe_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <Label>Custo de Mão de Obra</Label>
                          <p className="text-lg">R$ {pricing.labor_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <Label>Rateio de Custos Fixos</Label>
                          <p className="text-lg">R$ {pricing.fixed_costs_share.toFixed(2)}</p>
                        </div>
                        <div>
                          <Label>Custo Total</Label>
                          <p className="text-lg font-medium">R$ {pricing.total_cost.toFixed(2)}</p>
                        </div>
                        <div>
                          <Label>Preço Final</Label>
                          <p className="text-lg font-medium">R$ {pricing.final_price.toFixed(2)}</p>
                        </div>
                        <div>
                          <Label>Preço por Unidade</Label>
                          <p className="text-lg font-medium">R$ {pricing.unit_price.toFixed(2)}</p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {pricingId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
