
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function SaleModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    price: "",
    payment: "",
    origin: "",
    customer: "",
    notes: "",
    orderDate: new Date(),
    deliveryDate: undefined as Date | undefined,
  });

  // Calculate total
  const calculateTotal = () => {
    const quantity = Number(formData.quantity) || 0;
    const price = Number(formData.price) || 0;
    return quantity * price;
  };

  // Fetch products from database
  const { data: products } = useQuery({
    queryKey: ["products", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price")
        .eq("vendor_id", user?.id)
        .eq("active", true);

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Update price when product changes
  useEffect(() => {
    if (formData.product && products) {
      const selectedProduct = products.find(prod => prod.id === formData.product);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          price: selectedProduct.price.toString()
        }));
      }
    }
  }, [formData.product, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      if (!formData.product || !formData.quantity || !formData.price || !formData.payment) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      if (!formData.deliveryDate) {
        throw new Error("Selecione uma data de entrega");
      }

      // Create the order first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.customer || "Cliente não identificado",
          customer_id: null, // Simple sale doesn't link to a customer record
          total_amount: Number(formData.quantity) * Number(formData.price),
          payment_method: formData.payment,
          sale_origin: formData.origin || null,
          discount_amount: 0,
          seller_notes: formData.notes || null,
          status: "pending",
          payment_status: "pending",
          vendor_id: user.id,
          sale_type: "manual",
          created_at: formData.orderDate.toISOString(),
          delivery_date: formData.deliveryDate ? formData.deliveryDate.toISOString() : null,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw orderError;
      }

      // Create the order item
      const { error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderData.id,
          product_id: formData.product,
          quantity: Number(formData.quantity),
          unit_price: Number(formData.price),
        });

      if (itemError) {
        console.error("Order item creation error:", itemError);
        throw itemError;
      }

      toast.success("Venda registrada com sucesso!");
      setOpen(false);
      setFormData({
        product: "",
        quantity: "",
        price: "",
        payment: "",
        origin: "",
        customer: "",
        notes: "",
        orderDate: new Date(),
        deliveryDate: undefined,
      });
      
      // Refresh data after saving
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sales"] });
      queryClient.invalidateQueries({ queryKey: ["top-products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      // Reload page to show updated data
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao registrar venda");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da venda abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Produto *
            </Label>
            <div className="col-span-3">
              <Select 
                value={formData.product}
                onValueChange={(value) => setFormData({ ...formData, product: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - R$ {product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantidade *
            </Label>
            <Input
              id="quantity"
              type="number"
              placeholder="0"
              className="col-span-3"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Preço Unitário *
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="0,00"
              className="col-span-3"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="orderDate" className="text-right">
              Data do Pedido *
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.orderDate ? (
                      format(formData.orderDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.orderDate}
                    onSelect={(date) => 
                      date && setFormData({ ...formData, orderDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryDate" className="text-right">
              Data de Entrega *
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.deliveryDate ? (
                      format(formData.deliveryDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.deliveryDate}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, deliveryDate: date })
                    }
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="payment" className="text-right">
              Pagamento *
            </Label>
            <Select 
              value={formData.payment}
              onValueChange={(value) => setFormData({ ...formData, payment: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="origin" className="text-right">
              Origem
            </Label>
            <Select
              value={formData.origin}
              onValueChange={(value) => setFormData({ ...formData, origin: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a origem da venda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="store">Loja Física</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customer" className="text-right">
              Cliente
            </Label>
            <Input
              id="customer"
              placeholder="Nome do cliente"
              className="col-span-3"
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Observações
            </Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais"
              className="col-span-3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-bold">
              Valor Total:
            </Label>
            <div className="col-span-3 text-xl font-bold text-green-600 border-t pt-2">
              {formatCurrency(calculateTotal())}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar Venda"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
