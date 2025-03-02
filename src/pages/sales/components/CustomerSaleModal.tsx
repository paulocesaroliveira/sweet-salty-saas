
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
import { Plus, Trash, UserCircle, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type OrderItem = {
  id: string;
  product: string;
  quantity: string;
  price: string;
};

export function CustomerSaleModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: "1", product: "", quantity: "", price: "" },
  ]);
  const [formData, setFormData] = useState({
    payment: "",
    origin: "",
    notes: "",
    orderDate: new Date(),
    deliveryDate: undefined as Date | undefined,
  });

  // Calculate total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return total + (quantity * price);
    }, 0);
  };

  // Fetch customers from database
  const { data: customers } = useQuery({
    queryKey: ["customers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, full_name")
        .eq("vendor_id", user?.id);

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id && open,
  });

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

  // Function to add new order item
  const addOrderItem = () => {
    const newId = (orderItems.length + 1).toString();
    setOrderItems([
      ...orderItems,
      { id: newId, product: "", quantity: "", price: "" },
    ]);
  };

  // Function to remove order item
  const removeOrderItem = (id: string) => {
    if (orderItems.length === 1) {
      toast.error("É necessário pelo menos um produto");
      return;
    }
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  // Function to update order item
  const updateOrderItem = (id: string, field: string, value: string) => {
    setOrderItems(
      orderItems.map((item) => {
        if (item.id === id) {
          if (field === "product" && products) {
            const selectedProduct = products.find(prod => prod.id === value);
            if (selectedProduct) {
              return { 
                ...item, 
                [field]: value,
                price: selectedProduct.price.toString()
              };
            }
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Update price when product changes
  useEffect(() => {
    orderItems.forEach(item => {
      if (item.product && products) {
        const selectedProduct = products.find(prod => prod.id === item.product);
        if (selectedProduct && !item.price) {
          updateOrderItem(item.id, "price", selectedProduct.price.toString());
        }
      }
    });
  }, [orderItems, products]);

  const handleSubmit = async () => {
    // Validate form
    if (!selectedCustomer) {
      toast.error("Selecione um cliente");
      return;
    }

    const invalidItems = orderItems.filter(
      (item) => !item.product || !item.quantity || !item.price
    );
    if (invalidItems.length > 0) {
      toast.error("Preencha todos os campos de produtos");
      return;
    }

    if (!formData.payment) {
      toast.error("Selecione uma forma de pagamento");
      return;
    }

    if (!formData.deliveryDate) {
      toast.error("Selecione uma data de entrega");
      return;
    }

    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Get customer name
      const customer = customers?.find((c) => c.id === selectedCustomer);
      
      // Calculate total amount
      const totalAmount = calculateTotal();

      // Create the order first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customer?.full_name || "Cliente não identificado",
          customer_id: selectedCustomer,
          total_amount: totalAmount,
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

      // Create the order items
      const orderItemsData = orderItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.product,
        quantity: Number(item.quantity),
        unit_price: Number(item.price),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        throw itemsError;
      }

      toast.success("Venda registrada com sucesso!");
      
      // Reset form
      setOpen(false);
      setSelectedCustomer("");
      setOrderItems([{ id: "1", product: "", quantity: "", price: "" }]);
      setFormData({
        payment: "",
        origin: "",
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
          <UserCircle className="mr-2 h-4 w-4" />
          Nova Venda Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Venda para Cliente</DialogTitle>
          <DialogDescription>
            Selecione o cliente e adicione os produtos para esta venda.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações do Cliente</h3>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Cliente *
              </Label>
              <div className="col-span-3">
                <Select
                  value={selectedCustomer}
                  onValueChange={setSelectedCustomer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Produtos</h3>
              <Button type="button" onClick={addOrderItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Adicionar Produto
              </Button>
            </div>

            {orderItems.map((item) => (
              <Card key={item.id} className="relative">
                <CardContent className="pt-6">
                  <div className="absolute top-2 right-2">
                    <Button
                      type="button"
                      onClick={() => removeOrderItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`product-${item.id}`} className="text-right">
                        Produto *
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={item.product}
                          onValueChange={(value) =>
                            updateOrderItem(item.id, "product", value)
                          }
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
                      <Label htmlFor={`quantity-${item.id}`} className="text-right">
                        Quantidade *
                      </Label>
                      <Input
                        id={`quantity-${item.id}`}
                        type="number"
                        placeholder="0"
                        className="col-span-3"
                        value={item.quantity}
                        onChange={(e) =>
                          updateOrderItem(item.id, "quantity", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor={`price-${item.id}`} className="text-right">
                        Preço Unitário *
                      </Label>
                      <Input
                        id={`price-${item.id}`}
                        type="number"
                        placeholder="0,00"
                        className="col-span-3"
                        value={item.price}
                        onChange={(e) =>
                          updateOrderItem(item.id, "price", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações da Venda</h3>

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

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Venda"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
