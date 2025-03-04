
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, 
  FileSpreadsheet, 
  PlusCircle, 
  HelpCircle,
  Package,
  Calculator,
  DollarSign,
  Store,
  Pencil,
  Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { IngredientDialog } from "./IngredientDialog";

type Ingredient = {
  id: string;
  name: string;
  type: 'solid' | 'liquid' | 'pó';
  unit: string;
  brand: string | null;
  supplier: string | null;
  category: string | null;
  package_cost: number;
  package_amount: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
  vendor_id: string;
};

const CATEGORIES = [
  "Todos",
  "Farinhas",
  "Laticínios",
  "Chocolates",
  "Frutas",
  "Gorduras",
  "Açúcares",
  "Confeitos",
  "Outros"
];

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<Ingredient | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data: ingredients, refetch } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("name");

      if (error) {
        toast.error("Erro ao carregar ingredientes");
        throw error;
      }

      return (data || []).map(ingredient => ({
        ...ingredient,
        supplier: ingredient.supplier || null,
        category: ingredient.category || null,
        type: ingredient.type || 'solid',
      })) as Ingredient[];
    },
  });

  const handleDelete = async () => {
    if (!ingredientToDelete) return;
    
    setIsLoading(true);
    try {
      const { data: recipeIngredients, error: checkError } = await supabase
        .from("recipe_ingredients")
        .select("id")
        .eq("ingredient_id", ingredientToDelete.id)
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (recipeIngredients && recipeIngredients.length > 0) {
        toast.error("Não é possível excluir este ingrediente pois ele está sendo usado em receitas");
        setDeleteDialogOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from("ingredients")
        .delete()
        .eq("id", ingredientToDelete.id);
      
      if (error) throw error;
      
      toast.success("Ingrediente excluído com sucesso");
      refetch();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao excluir ingrediente:", error);
      toast.error("Erro ao excluir ingrediente");
    } finally {
      setIsLoading(false);
    }
  };

  const helpCards = [
    {
      icon: Package,
      title: "Como Cadastrar Ingredientes",
      description: "Clique em 'Novo Ingrediente' e preencha as informações básicas como nome, unidade de medida e custo da embalagem."
    },
    {
      icon: Calculator,
      title: "Cálculo Automático",
      description: "O sistema calcula automaticamente o custo por unidade baseado no preço da embalagem e quantidade."
    },
    {
      icon: DollarSign,
      title: "Gestão de Custos",
      description: "Mantenha seus preços atualizados para ter um controle preciso dos custos das suas receitas."
    },
    {
      icon: Store,
      title: "Fornecedores",
      description: "Registre informações de fornecedores para facilitar a reposição dos seus ingredientes."
    }
  ];

  const filteredIngredients = ingredients?.filter(ingredient => {
    const matchesSearch = 
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ingredient.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (ingredient.supplier?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === "Todos" || 
      ingredient.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display mb-2">Ingredientes</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os ingredientes utilizados nas suas receitas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet size={20} />
            Importar Planilha
          </Button>
          <IngredientDialog onSave={refetch} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {helpCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <card.icon size={20} className="text-primary" />
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="text-muted-foreground" size={20} />
          <Input
            placeholder="Buscar por nome, marca ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Qtd. Embalagem</TableHead>
              <TableHead>Custo Emb.</TableHead>
              <TableHead>Custo/Unidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIngredients?.map((ingredient) => (
              <TableRow key={ingredient.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{ingredient.name}</p>
                    {ingredient.brand && (
                      <p className="text-sm text-muted-foreground">
                        {ingredient.brand}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{ingredient.category || "-"}</TableCell>
                <TableCell>{ingredient.supplier || "-"}</TableCell>
                <TableCell>
                  {ingredient.package_amount} {ingredient.unit}
                </TableCell>
                <TableCell>
                  R$ {ingredient.package_cost.toFixed(2)}
                </TableCell>
                <TableCell>
                  R$ {ingredient.cost_per_unit.toFixed(3)}/{ingredient.unit}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <IngredientDialog
                      ingredient={ingredient}
                      onSave={refetch}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setIngredientToDelete(ingredient);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {(!filteredIngredients || filteredIngredients.length === 0) && (
              <TableRow>
                <TableCell 
                  colSpan={7} 
                  className="h-32 text-center text-muted-foreground"
                >
                  {searchTerm || selectedCategory !== "Todos"
                    ? "Nenhum ingrediente encontrado com os filtros aplicados"
                    : "Nenhum ingrediente cadastrado"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ingrediente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o ingrediente "{ingredientToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Ingredients;
