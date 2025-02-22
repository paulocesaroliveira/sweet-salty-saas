
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProductPricingDialog } from "./components/ProductPricingDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProductPricing = {
  id: string;
  recipe_id: string;
  recipe_cost: number;
  labor_minutes: number;
  labor_cost: number;
  packaging_cost: number;
  fixed_costs_share: number;
  total_cost: number;
  profit_margin: number;
  suggested_price: number;
  final_price: number;
  yield_amount: number;
  unit_cost: number;
  unit_price: number;
};

export default function Pricing() {
  const [selectedPricing, setSelectedPricing] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: pricings, refetch } = useQuery({
    queryKey: ["product-pricing"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_pricing")
        .select(`
          *,
          recipes:recipes (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (ProductPricing & { recipes: { name: string } })[];
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Precificação</h1>
          <p className="text-muted-foreground">
            Gerencie os preços dos seus produtos calculando custos e margens de lucro.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <PlusCircle size={20} />
          Nova Precificação
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receita</TableHead>
            <TableHead>Custo Total</TableHead>
            <TableHead>Margem</TableHead>
            <TableHead>Preço Final</TableHead>
            <TableHead>Preço Unitário</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricings?.map((pricing) => (
            <TableRow key={pricing.id}>
              <TableCell>{pricing.recipes.name}</TableCell>
              <TableCell>R$ {pricing.total_cost.toFixed(2)}</TableCell>
              <TableCell>{pricing.profit_margin}%</TableCell>
              <TableCell>R$ {pricing.final_price.toFixed(2)}</TableCell>
              <TableCell>R$ {pricing.unit_price.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPricing(pricing.id);
                    setIsDialogOpen(true);
                  }}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ProductPricingDialog
        pricingId={selectedPricing}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedPricing(null);
        }}
        onSave={() => {
          refetch();
          setIsDialogOpen(false);
          setSelectedPricing(null);
        }}
      />
    </div>
  );
}
