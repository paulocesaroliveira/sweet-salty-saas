
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash, Check, Receipt, Send } from "lucide-react";
import { useState } from "react";
import { useSales } from "../hooks/useSales";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function SalesTable() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    paymentMethod: "",
  });

  const { data: sales, isLoading } = useSales(filters);

  const handlePrintReceipt = async (orderId: string) => {
    // Here you can implement the printing logic
    // For example, opening a new window with the formatted receipt
    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) return;

    const receiptId = order.id.substring(0, 8).toUpperCase();
    
    const receiptWindow = window.open("", "_blank");
    if (receiptWindow) {
      receiptWindow.document.write(`
        <html>
          <head>
            <title>Recibo #${receiptId}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .details { margin-bottom: 20px; }
              .total { font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Recibo de Venda</h1>
              <p>Recibo #${receiptId}</p>
              <p>${new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div class="details">
              <p><strong>Cliente:</strong> ${order.customer_name}</p>
              <p><strong>Valor Total:</strong> ${formatCurrency(order.total_amount)}</p>
              <p><strong>Forma de Pagamento:</strong> ${order.payment_method}</p>
            </div>
            <div class="total">
              <p>Total Pago: ${formatCurrency(order.total_amount)}</p>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  const handleMarkAsPaid = async (orderId: string) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    const { error } = await supabase
      .from("orders")
      .update({ 
        payment_status: "paid",
        status: "paid" 
      })
      .eq("id", orderId)
      .eq("vendor_id", user.id);

    if (error) {
      console.error("Error marking order as paid:", error);
      toast.error("Erro ao marcar como pago");
    } else {
      toast.success("Venda marcada como paga");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar por cliente ou ID..."
          value={filters.search}
          onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
          className="sm:max-w-xs"
        />
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters(f => ({ ...f, status: value }))}
        >
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.paymentMethod}
          onValueChange={(value) => setFilters(f => ({ ...f, paymentMethod: value }))}
        >
          <SelectTrigger className="sm:max-w-[180px]">
            <SelectValue placeholder="Forma de Pagamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="pix">PIX</SelectItem>
            <SelectItem value="cash">Dinheiro</SelectItem>
            <SelectItem value="credit">Cartão de Crédito</SelectItem>
            <SelectItem value="debit">Cartão de Débito</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : !sales?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhuma venda encontrada
                </TableCell>
              </TableRow>
            ) : (
              sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{formatCurrency(sale.total_amount)}</TableCell>
                  <TableCell>{sale.payment_method}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                        sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {sale.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrintReceipt(sale.id)}
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      {sale.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsPaid(sale.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
