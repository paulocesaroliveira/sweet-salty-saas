
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Calendar,
  PlusCircle,
  DollarSign,
  PieChart,
  ArrowDownUp,
  Building2
} from "lucide-react";
import { FixedCostDialog } from "./FixedCostDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FixedCost = {
  id: string;
  name: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
};

const helpCards = [
  {
    icon: Calculator,
    title: "O que são Custos Fixos?",
    description: "São despesas que ocorrem regularmente, independente da produção, como aluguel, energia e salários."
  },
  {
    icon: Calendar,
    title: "Frequência de Pagamento",
    description: "Cadastre custos com diferentes frequências: diários, semanais, mensais ou anuais. O sistema fará a conversão automaticamente."
  },
  {
    icon: PieChart,
    title: "Impacto na Precificação",
    description: "Os custos fixos são distribuídos entre os produtos, garantindo que todas as despesas sejam cobertas pelo preço final."
  },
  {
    icon: Building2,
    title: "Gestão do Negócio",
    description: "Mantenha seus custos fixos organizados para ter uma visão clara das despesas e tomar melhores decisões."
  }
];

function formatFrequency(frequency: string) {
  const formats = {
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
    yearly: "Anual"
  };
  return formats[frequency as keyof typeof formats] || frequency;
}

function getMonthlyAmount(amount: number, frequency: string): number {
  switch (frequency) {
    case "daily":
      return amount * 30;
    case "weekly":
      return amount * 4;
    case "monthly":
      return amount;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

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

  const totalMonthly = fixedCosts?.reduce(
    (acc, cost) => acc + getMonthlyAmount(cost.amount, cost.frequency),
    0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Custos Fixos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus custos fixos mensais, semanais ou anuais.
          </p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <PlusCircle size={20} />
          Novo Custo Fixo
        </Button>
      </div>

      {/* Cards Informativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {helpCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <card.icon size={20} className="text-primary" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo Mensal */}
      <Card className="bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Mensal</p>
              <p className="text-2xl font-bold">R$ {totalMonthly.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Custos */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Valor Original</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Valor Mensal</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fixedCosts?.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell>
                  <div className="font-medium">{cost.name}</div>
                </TableCell>
                <TableCell>R$ {cost.amount.toFixed(2)}</TableCell>
                <TableCell className="capitalize">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-muted-foreground" />
                    {formatFrequency(cost.frequency)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ArrowDownUp size={16} className="text-muted-foreground" />
                    R$ {getMonthlyAmount(cost.amount, cost.frequency).toFixed(2)}
                  </div>
                </TableCell>
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

            {(!fixedCosts || fixedCosts.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhum custo fixo cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

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
