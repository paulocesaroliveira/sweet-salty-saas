
import {
  Calculator,
  LucideIcon,
  PieChart,
  ArrowUpDown,
  DollarSign,
  PackageOpen,
  Clock,
  BarChart3,
  Building2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type HelpCard = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const helpCards: HelpCard[] = [
  {
    icon: Calculator,
    title: "Custos dos Ingredientes",
    description: "Importe suas receitas automaticamente e calcule o custo exato de cada ingrediente.",
  },
  {
    icon: PackageOpen,
    title: "Embalagens",
    description: "Inclua o custo de embalagens, rótulos e materiais de entrega no preço final.",
  },
  {
    icon: Clock,
    title: "Mão de Obra",
    description: "Calcule o custo do seu tempo de trabalho por hora para cada produto.",
  },
  {
    icon: Building2,
    title: "Custos Fixos",
    description: "Distribua custos fixos como aluguel, energia e gás entre seus produtos.",
  },
  {
    icon: PieChart,
    title: "Margem de Lucro",
    description: "Defina sua margem de lucro por porcentagem ou valor fixo.",
  },
  {
    icon: ArrowUpDown,
    title: "Simulação Dinâmica",
    description: "Ajuste valores em tempo real e veja o impacto no preço final.",
  },
  {
    icon: DollarSign,
    title: "Preço Mínimo",
    description: "Alerta automático se o preço definido estiver abaixo do custo total.",
  },
  {
    icon: BarChart3,
    title: "Análise de Mercado",
    description: "Compare seus preços com a concorrência e ajuste sua estratégia.",
  },
];

export function PricingHelpCards() {
  return (
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
  );
}
