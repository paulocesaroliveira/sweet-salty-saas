
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

type FixedCostDialogProps = {
  costId: string | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
};

export function FixedCostDialog({ costId, open, onClose, onSave }: FixedCostDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");

  const { data: cost } = useQuery({
    queryKey: ["fixed-cost", costId],
    queryFn: async () => {
      if (!costId) return null;

      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .eq("id", costId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!costId,
  });

  useEffect(() => {
    if (cost) {
      setName(cost.name);
      setAmount(cost.amount.toString());
      setFrequency(cost.frequency);
    } else {
      setName("");
      setAmount("");
      setFrequency("monthly");
    }
  }, [cost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (costId) {
        const { error } = await supabase
          .from("fixed_costs")
          .update({
            name,
            amount: Number(amount),
            frequency,
          })
          .eq("id", costId);

        if (error) throw error;
        toast.success("Custo fixo atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("fixed_costs").insert({
          name,
          amount: Number(amount),
          frequency,
          vendor_id: user?.id,
        });

        if (error) throw error;
        toast.success("Custo fixo adicionado com sucesso!");
      }

      onSave();
    } catch (error) {
      toast.error("Erro ao salvar custo fixo");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {costId ? "Editar Custo Fixo" : "Novo Custo Fixo"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Custo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Aluguel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Frequência</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {costId ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
