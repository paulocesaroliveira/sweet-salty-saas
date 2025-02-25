
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { ProductPricingDialog } from "./components/ProductPricingDialog";
import { PricingHelpCards } from "./components/PricingHelpCards";
import { PricingTable } from "./components/PricingTable";

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
            name,
            category
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Precificação Inteligente</h1>
          <p className="text-muted-foreground">
            Calcule o preço ideal dos seus produtos considerando todos os custos envolvidos.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <PlusCircle size={20} />
          Nova Precificação
        </Button>
      </div>

      <PricingHelpCards />
      <PricingTable 
        pricings={pricings}
        onEdit={(id) => {
          setSelectedPricing(id);
          setIsDialogOpen(true);
        }}
      />

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
