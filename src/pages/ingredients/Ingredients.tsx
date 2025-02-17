
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Ingredient {
  id: string;
  name: string;
  unit: 'g' | 'ml';
  package_cost: number;
  package_amount: number;
  cost_per_unit: number;
}

const Ingredients = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<'g' | 'ml'>('g');
  const [packageCost, setPackageCost] = useState("");
  const [packageAmount, setPackageAmount] = useState("");

  const { data: ingredients, isLoading } = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('vendor_id', user?.id)
        .order('name');

      if (error) throw error;
      return data as Ingredient[];
    }
  });

  const calculateCostPerUnit = (cost: number, amount: number) => {
    return cost / amount;
  };

  const resetForm = () => {
    setName("");
    setUnit('g');
    setPackageCost("");
    setPackageAmount("");
    setEditingIngredient(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const costPerUnit = calculateCostPerUnit(
      Number(packageCost),
      Number(packageAmount)
    );

    try {
      if (editingIngredient) {
        const { error } = await supabase
          .from('ingredients')
          .update({
            name,
            unit,
            package_cost: Number(packageCost),
            package_amount: Number(packageAmount),
            cost_per_unit: costPerUnit
          })
          .eq('id', editingIngredient.id);

        if (error) throw error;
        toast.success("Ingrediente atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('ingredients')
          .insert({
            name,
            unit,
            package_cost: Number(packageCost),
            package_amount: Number(packageAmount),
            cost_per_unit: costPerUnit,
            vendor_id: user?.id
          });

        if (error) throw error;
        toast.success("Ingrediente criado com sucesso!");
      }

      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      resetForm();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ingrediente?")) return;

    try {
      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Ingrediente excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display mb-1">Ingredientes</h1>
          <p className="text-neutral-600">Gerencie seus ingredientes e custos</p>
        </div>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} />
          <span>Novo Ingrediente</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Nome</th>
                <th className="text-left p-4">Unidade</th>
                <th className="text-right p-4">Custo da Embalagem</th>
                <th className="text-right p-4">Quantidade na Embalagem</th>
                <th className="text-right p-4">Custo por Unidade</th>
                <th className="p-4 w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {ingredients?.map((ingredient) => (
                <tr key={ingredient.id} className="border-b">
                  <td className="p-4">{ingredient.name}</td>
                  <td className="p-4">{ingredient.unit}</td>
                  <td className="p-4 text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(ingredient.package_cost)}
                  </td>
                  <td className="p-4 text-right">
                    {ingredient.package_amount} {ingredient.unit}
                  </td>
                  <td className="p-4 text-right">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(ingredient.cost_per_unit)}
                    /{ingredient.unit}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditingIngredient(ingredient);
                          setName(ingredient.name);
                          setUnit(ingredient.unit);
                          setPackageCost(ingredient.package_cost.toString());
                          setPackageAmount(ingredient.package_amount.toString());
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(ingredient.id)}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Ingrediente */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-medium mb-4">
              {editingIngredient ? "Editar Ingrediente" : "Novo Ingrediente"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">Nome</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="unit" className="label">Unidade</label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'g' | 'ml')}
                  className="input-field"
                  required
                >
                  <option value="g">Gramas (g)</option>
                  <option value="ml">Mililitros (ml)</option>
                </select>
              </div>

              <div>
                <label htmlFor="packageCost" className="label">Custo da Embalagem</label>
                <input
                  id="packageCost"
                  type="number"
                  step="0.01"
                  value={packageCost}
                  onChange={(e) => setPackageCost(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="packageAmount" className="label">
                  Quantidade na Embalagem ({unit})
                </label>
                <input
                  id="packageAmount"
                  type="number"
                  step="0.01"
                  value={packageAmount}
                  onChange={(e) => setPackageAmount(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {packageCost && packageAmount && (
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-600">
                    Custo por {unit}:{" "}
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(calculateCostPerUnit(Number(packageCost), Number(packageAmount)))}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ingredients;
