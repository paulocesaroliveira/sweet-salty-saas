
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { User, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CustomerDialog from "./CustomerDialog";
import type { Customer } from "@/types/customer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Customers = () => {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  const { data: customers, refetch } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Erro ao carregar clientes");
        throw error;
      }

      return data as Customer[];
    },
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    refetch();
    setSelectedCustomer(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display mb-1">Clientes</h1>
        <p className="text-neutral-600">Gerencie seus clientes</p>
      </div>

      <div className="flex justify-between gap-4">
        <div className="flex items-center border rounded-lg px-3 flex-1 max-w-md">
          <Search className="text-neutral-400" size={20} />
          <Input
            placeholder="Buscar clientes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus size={20} />
          Novo Cliente
        </Button>
      </div>

      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary-light flex items-center justify-center">
            <User className="text-primary" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-medium">Lista de Clientes</h2>
            <p className="text-neutral-600">
              {customers?.length || 0} clientes cadastrados
            </p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>CPF/CNPJ</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.full_name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.document}</TableCell>
                <TableCell>
                  {format(new Date(customer.created_at), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(customer)}
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {(!customers || customers.length === 0) && (
          <div className="text-center py-12 text-neutral-600">
            <User className="mx-auto mb-4 text-neutral-400" size={48} />
            <p>Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Customers;
