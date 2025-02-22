
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export function LaborCosts() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hourlyRate, setHourlyRate] = useState("");

  const { data: laborCost, refetch } = useQuery({
    queryKey: ["labor-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labor_costs")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (laborCost) {
        const { error } = await supabase
          .from("labor_costs")
          .update({
            hourly_rate: Number(hourlyRate),
          })
          .eq("id", laborCost.id);

        if (error) throw error;
        toast.success("Custo de mão de obra atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("labor_costs").insert({
          hourly_rate: Number(hourlyRate),
          vendor_id: user?.id,
        });

        if (error) throw error;
        toast.success("Custo de mão de obra adicionado com sucesso!");
      }

      refetch();
    } catch (error) {
      toast.error("Erro ao salvar custo de mão de obra");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Custo da Mão de Obra</h2>
        <p className="text-sm text-muted-foreground">
          Configure o valor da sua hora de trabalho.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Valor da Hora</Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="0,00"
                required
              />
              <p className="text-sm text-muted-foreground">
                Este valor será usado para calcular o custo da mão de obra em suas receitas.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
