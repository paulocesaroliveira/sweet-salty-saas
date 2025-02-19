
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Customer } from "@/types/customer";

type CustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSuccess: () => void;
};

const CustomerDialog = ({ open, onOpenChange, customer, onSuccess }: CustomerDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>(
    customer || {
      full_name: "",
      email: "",
      phone: "",
      document: "",
      birthday: null,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const dataWithVendorId = {
        ...formData,
        vendor_id: user.id,
      };

      if (customer) {
        const { error } = await supabase
          .from("customers")
          .update(dataWithVendorId)
          .eq("id", customer.id);

        if (error) throw error;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("customers")
          .insert(dataWithVendorId);

        if (error) throw error;
        toast.success("Cliente cadastrado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, full_name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">CPF/CNPJ</Label>
            <Input
              id="document"
              value={formData.document || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, document: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Data de Nascimento</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, birthday: e.target.value }))
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDialog;
