
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CustomerAddress } from "@/types/customer";

type AddressDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  address?: CustomerAddress;
  onSuccess: () => void;
};

// Define um tipo para o formulário onde todos os campos obrigatórios devem estar presentes
type AddressFormData = {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference: string | null;
  is_default: boolean;
};

const AddressDialog = ({ open, onOpenChange, customerId, address, onSuccess }: AddressDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>(
    address || {
      street: "",
      number: "",
      complement: null,
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
      reference: null,
      is_default: false,
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Garantimos que todos os campos obrigatórios estão presentes
      const dataToSave = {
        ...formData,
        customer_id: customerId,
      };

      if (address) {
        const { error } = await supabase
          .from("customer_addresses")
          .update(dataToSave)
          .eq("id", address.id);

        if (error) throw error;
        toast.success("Endereço atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("customer_addresses")
          .insert(dataToSave);

        if (error) throw error;
        toast.success("Endereço cadastrado com sucesso!");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar endereço");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {address ? "Editar Endereço" : "Novo Endereço"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, street: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, number: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={formData.complement || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, complement: e.target.value || null }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, neighborhood: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, state: e.target.value }))
                }
                required
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP *</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, zip_code: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Ponto de Referência</Label>
            <Input
              id="reference"
              value={formData.reference || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reference: e.target.value || null }))
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

export default AddressDialog;
