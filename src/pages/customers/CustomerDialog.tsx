
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, MapPin } from "lucide-react";
import type { Customer } from "@/types/customer";

type CustomerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer;
  onSuccess: () => void;
};

type AddressType = {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference: string | null;
  type: "residential" | "commercial";
};

type CustomerFormData = {
  full_name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  birthday: string | null;
  addresses: AddressType[];
};

const CustomerDialog = ({ open, onOpenChange, customer, onSuccess }: CustomerDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>({
    full_name: customer?.full_name || "",
    email: customer?.email || null,
    phone: customer?.phone || null,
    document: customer?.document || null,
    birthday: customer?.birthday || null,
    addresses: [{
      street: "",
      number: "",
      complement: null,
      neighborhood: "",
      city: "",
      state: "",
      zip_code: "",
      reference: null,
      type: "residential"
    }]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Primeiro, salvamos o cliente
      const customerData = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        document: formData.document,
        birthday: formData.birthday,
        vendor_id: user.id,
      };

      let customerId: string;

      if (customer) {
        const { error } = await supabase
          .from("customers")
          .update(customerData)
          .eq("id", customer.id);

        if (error) throw error;
        customerId = customer.id;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const { data, error } = await supabase
          .from("customers")
          .insert(customerData)
          .select('id')
          .single();

        if (error) throw error;
        customerId = data.id;
        toast.success("Cliente cadastrado com sucesso!");
      }

      // Depois, salvamos os endereços
      for (const address of formData.addresses) {
        const addressData = {
          customer_id: customerId,
          street: address.street,
          number: address.number,
          complement: address.complement,
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          zip_code: address.zip_code,
          reference: address.reference,
          is_default: formData.addresses.indexOf(address) === 0
        };

        const { error } = await supabase
          .from("customer_addresses")
          .insert(addressData);

        if (error) throw error;
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

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        {
          street: "",
          number: "",
          complement: null,
          neighborhood: "",
          city: "",
          state: "",
          zip_code: "",
          reference: null,
          type: "residential"
        }
      ]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {customer ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
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
                  setFormData((prev) => ({ ...prev, email: e.target.value || null }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value || null }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document">CPF/CNPJ</Label>
              <Input
                id="document"
                value={formData.document || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, document: e.target.value || null }))
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
                  setFormData((prev) => ({ ...prev, birthday: e.target.value || null }))
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="text-primary" size={20} />
                <h3 className="text-lg font-medium">Endereços</h3>
              </div>
              <Button type="button" variant="outline" onClick={addAddress}>
                <Plus size={16} className="mr-2" />
                Adicionar Endereço
              </Button>
            </div>

            {formData.addresses.map((address, index) => (
              <div key={index} className="space-y-4 border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Endereço {index + 1}</h4>
                  <select
                    className="border rounded px-2 py-1"
                    value={address.type}
                    onChange={(e) => {
                      const newAddresses = [...formData.addresses];
                      newAddresses[index] = {
                        ...address,
                        type: e.target.value as "residential" | "commercial"
                      };
                      setFormData(prev => ({ ...prev, addresses: newAddresses }));
                    }}
                  >
                    <option value="residential">Residencial</option>
                    <option value="commercial">Comercial</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rua *</Label>
                    <Input
                      value={address.street}
                      onChange={(e) => {
                        const newAddresses = [...formData.addresses];
                        newAddresses[index] = { ...address, street: e.target.value };
                        setFormData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Número *</Label>
                    <Input
                      value={address.number}
                      onChange={(e) => {
                        const newAddresses = [...formData.addresses];
                        newAddresses[index] = { ...address, number: e.target.value };
                        setFormData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={address.complement || ""}
                    onChange={(e) => {
                      const newAddresses = [...formData.addresses];
                      newAddresses[index] = { ...address, complement: e.target.value || null };
                      setFormData(prev => ({ ...prev, addresses: newAddresses }));
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bairro *</Label>
                  <Input
                    value={address.neighborhood}
                    onChange={(e) => {
                      const newAddresses = [...formData.addresses];
                      newAddresses[index] = { ...address, neighborhood: e.target.value };
                      setFormData(prev => ({ ...prev, addresses: newAddresses }));
                    }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input
                      value={address.city}
                      onChange={(e) => {
                        const newAddresses = [...formData.addresses];
                        newAddresses[index] = { ...address, city: e.target.value };
                        setFormData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estado *</Label>
                    <Input
                      value={address.state}
                      onChange={(e) => {
                        const newAddresses = [...formData.addresses];
                        newAddresses[index] = { ...address, state: e.target.value };
                        setFormData(prev => ({ ...prev, addresses: newAddresses }));
                      }}
                      required
                      maxLength={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>CEP *</Label>
                  <Input
                    value={address.zip_code}
                    onChange={(e) => {
                      const newAddresses = [...formData.addresses];
                      newAddresses[index] = { ...address, zip_code: e.target.value };
                      setFormData(prev => ({ ...prev, addresses: newAddresses }));
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ponto de Referência</Label>
                  <Input
                    value={address.reference || ""}
                    onChange={(e) => {
                      const newAddresses = [...formData.addresses];
                      newAddresses[index] = { ...address, reference: e.target.value || null };
                      setFormData(prev => ({ ...prev, addresses: newAddresses }));
                    }}
                  />
                </div>
              </div>
            ))}
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
