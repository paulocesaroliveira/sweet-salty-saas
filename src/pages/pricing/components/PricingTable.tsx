
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type PricingTableProps = {
  pricings: any[];
  onEdit: (id: string) => void;
};

export function PricingTable({ pricings, onEdit }: PricingTableProps) {
  if (!pricings || pricings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma precificação cadastrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comece adicionando uma nova precificação para seus produtos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Receita</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Custo Total</TableHead>
            <TableHead>Margem</TableHead>
            <TableHead>Preço Final</TableHead>
            <TableHead>Preço por Unidade</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pricings.map((pricing) => (
            <TableRow key={pricing.id}>
              <TableCell className="font-medium">{pricing.recipes.name}</TableCell>
              <TableCell>{pricing.recipes.category || "-"}</TableCell>
              <TableCell>{formatCurrency(pricing.total_cost)}</TableCell>
              <TableCell>{pricing.profit_margin}%</TableCell>
              <TableCell>{formatCurrency(pricing.final_price)}</TableCell>
              <TableCell>{formatCurrency(pricing.unit_price)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(pricing.id)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
