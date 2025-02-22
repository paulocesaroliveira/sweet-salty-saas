
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { FixedCostDialog } from "./FixedCostDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type FixedCost = {
  id: string;
  name: string;
  amount: number;
  frequency: string;
};

export function FixedCosts() {
  const [selectedCost, setSelectedCost] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: fixedCosts, refetch } = useQuery({
    queryKey: ["fixed-costs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixed_costs")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as FixedCost[];
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Custos Fixos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus custos fixos mensais ou anuais.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <PlusCircle size={20} />
          Novo Custo Fixo
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Frequência</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fixedCosts?.map((cost) => (
            <TableRow key={cost.id}>
              <TableCell>{cost.name}</TableCell>
              <TableCell>R$ {cost.amount.toFixed(2)}</TableCell>
              <TableCell className="capitalize">{cost.frequency}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCost(cost.id);
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

      <FixedCostDialog
        costId={selectedCost}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedCost(null);
        }}
        onSave={() => {
          refetch();
          setIsDialogOpen(false);
          setSelectedCost(null);
        }}
      />
    </div>
  );
}
