
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useDailySales } from "../hooks/useDailySales";
import { useTopProducts } from "../hooks/useTopProducts";
import { formatCurrency } from "@/lib/utils";

export function SalesAnalytics() {
  const { data: salesData, isLoading: salesLoading, error: salesError } = useDailySales();
  const { data: topProducts, isLoading: productsLoading, error: productsError } = useTopProducts();

  if (salesError) {
    console.error("Error loading sales data:", salesError);
  }
  
  if (productsError) {
    console.error("Error loading product data:", productsError);
  }

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {salesLoading ? (
              <div className="h-full flex items-center justify-center">Carregando...</div>
            ) : !salesData?.length ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Sem dados de vendas para exibir
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatTooltipValue} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Valor"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {productsLoading ? (
              <div className="h-full flex items-center justify-center">Carregando...</div>
            ) : !topProducts?.length ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Sem dados de produtos para exibir
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={formatTooltipValue} />
                  <Tooltip formatter={formatTooltipValue} />
                  <Bar dataKey="revenue" name="Receita" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
