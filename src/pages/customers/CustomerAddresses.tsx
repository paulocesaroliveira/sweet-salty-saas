
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CustomerAddress } from "@/types/customer";
import AddressDialog from "./AddressDialog";

type CustomerAddressesProps = {
  customerId: string;
};

const CustomerAddresses = ({ customerId }: CustomerAddressesProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | undefined>();

  const { data: addresses, refetch } = useQuery({
    queryKey: ["customer-addresses", customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customer_addresses")
        .select("*")
        .eq("customer_id", customerId)
        .order("is_default", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar endereços");
        throw error;
      }

      return data as CustomerAddress[];
    },
  });

  const handleEdit = (address: CustomerAddress) => {
    setSelectedAddress(address);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setSelectedAddress(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
            <MapPin className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-medium">Endereços</h3>
            <p className="text-neutral-600">
              {addresses?.length || 0} endereços cadastrados
            </p>
          </div>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={20} className="mr-2" />
          Novo Endereço
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses?.map((address) => (
          <div
            key={address.id}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {address.street}, {address.number}
                  {address.complement && ` - ${address.complement}`}
                </p>
                <p className="text-neutral-600">
                  {address.neighborhood}
                </p>
                <p className="text-neutral-600">
                  {address.city} - {address.state}
                </p>
                <p className="text-neutral-600">
                  CEP: {address.zip_code}
                </p>
                {address.reference && (
                  <p className="text-neutral-600 mt-2">
                    Referência: {address.reference}
                  </p>
                )}
              </div>
              {address.is_default && (
                <span className="px-2 py-1 bg-primary-light text-primary text-sm rounded">
                  Principal
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => handleEdit(address)}
            >
              Editar
            </Button>
          </div>
        ))}
      </div>

      {(!addresses || addresses.length === 0) && (
        <div className="text-center py-12 text-neutral-600">
          <MapPin className="mx-auto mb-4 text-neutral-400" size={48} />
          <p>Nenhum endereço cadastrado</p>
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customerId={customerId}
        address={selectedAddress}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CustomerAddresses;
