
import { useState, useEffect } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type OrderItem = {
  id: string;
  product: string;
  quantity: string;
  price: string;
};

type CustomerSaleModalProps = {
  onClose: () => void;
};

export function CustomerSaleModal({ onClose }: CustomerSaleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    { id: "1", product: "", quantity: "", price: "" },
  ]);
  const [formData, setFormData] = useState({
    payment: "",
    origin: "",
    notes: "",
    discount: "",
  });

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
    enabled: !!user?.id,
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
    enabled: !!user?.id,
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
          return { ...item, [field]: value };
          
          // If product is changed, update price automatically
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

    setIsLoading(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Get customer name
      const customer = customers?.find((c) => c.id === selectedCustomer);
      
      // Calculate total amount
      const totalAmount = orderItems.reduce(
        (acc, item) => acc + Number(item.quantity) * Number(item.price),
        0
      ) - Number(formData.discount || 0);

      // Create the order first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: customer?.full_name || "Cliente não identificado",
          customer_id: selectedCustomer,
          total_amount: totalAmount,
          payment_method: formData.payment,
          sale_origin: formData.origin,
          discount_amount: Number(formData.discount || 0),
          seller_notes: formData.notes,
          status: "pending",
          payment_status: "pending",
          vendor_id: user.id,
        })
        .select()
        .single();

      if (orderError) throw orderError;

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

      if (itemsError) throw itemsError;

      toast.success("Venda registrada com sucesso!");
      onClose();
    } catch (error) {
      toast.error("Erro ao registrar venda");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <Label htmlFor="discount" className="text-right">
            Desconto
          </Label>
          <Input
            id="discount"
            type="number"
            placeholder="0"
            className="col-span-3"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
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
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar Venda"}
        </Button>
      </div>
    </div>
  );
}
