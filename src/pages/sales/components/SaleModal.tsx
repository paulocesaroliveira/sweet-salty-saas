
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
import { Plus, ShoppingCart, UserCircle } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerSaleModal } from "./CustomerSaleModal";

export function SaleModal() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    product: "",
    quantity: "",
    price: "",
    payment: "",
    origin: "",
    customer: "",
    discount: "",
    notes: "",
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

      // Create the order first
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_name: formData.customer || "Cliente não identificado",
          customer_id: null, // Simple sale doesn't link to a customer record
          total_amount: Number(formData.quantity) * Number(formData.price) - Number(formData.discount || 0),
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

      // Create the order item
      const { error: itemError } = await supabase
        .from("order_items")
        .insert({
          order_id: orderData.id,
          product_id: formData.product,
          quantity: Number(formData.quantity),
          unit_price: Number(formData.price),
        });

      if (itemError) throw itemError;

      toast.success("Venda registrada com sucesso!");
      setOpen(false);
      setFormData({
        product: "",
        quantity: "",
        price: "",
        payment: "",
        origin: "",
        customer: "",
        discount: "",
        notes: "",
      });
    } catch (error) {
      toast.error("Erro ao registrar venda");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Venda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nova Venda</DialogTitle>
          <DialogDescription>
            Escolha o tipo de venda que deseja registrar.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="simple" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="simple" className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Nova Venda
            </TabsTrigger>
            <TabsTrigger value="customer" className="flex-1">
              <UserCircle className="mr-2 h-4 w-4" />
              Nova Venda Cliente
            </TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="mt-4">
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

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Venda"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customer" className="mt-4">
            <CustomerSaleModal onClose={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
