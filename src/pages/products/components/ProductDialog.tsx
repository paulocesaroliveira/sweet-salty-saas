import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Plus, Trash, ImageIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

type ProductDialogProps = {
  open: boolean;
  productId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type ProductRecipe = {
  id: string;
  recipe_id: string;
  quantity: number;
  recipe?: {
    name: string;
    total_cost: number;
    unit?: string;
    category?: string | null;
  };
};

type ProductPackage = {
  id: string;
  package_id: string;
  quantity: number;
  package?: {
    name: string;
    unit_cost: number;
    type?: string | null;
  };
};

export function ProductDialog({ open, productId, onClose, onSaved }: ProductDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isVisibleInStore, setIsVisibleInStore] = useState(true);
  
  const [productRecipes, setProductRecipes] = useState<ProductRecipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState("");
  const [recipeQuantity, setRecipeQuantity] = useState(1);
  
  const [productPackages, setProductPackages] = useState<ProductPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [packageQuantity, setPackageQuantity] = useState(1);
  
  const [profitMargin, setProfitMargin] = useState(30);
  const [price, setPrice] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isUserEditingPrice, setIsUserEditingPrice] = useState(false);
  const [isUserEditingMargin, setIsUserEditingMargin] = useState(false);
  
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
  
  const { data: existingProductRecipes, isLoading: isLoadingRecipes } = useQuery({
    queryKey: ["product-recipes", productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from("product_recipes")
        .select(`
          id,
          recipe_id,
          quantity,
          recipes:recipe_id (
            name,
            total_cost,
            category
          )
        `)
        .eq("product_id", productId);
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        recipe_id: item.recipe_id,
        quantity: item.quantity,
        recipe: {
          name: item.recipes.name,
          total_cost: item.recipes.total_cost,
          category: item.recipes.category
        }
      }));
    },
    enabled: !!productId,
  });
  
  const { data: existingProductPackages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ["product-packages", productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from("product_packages")
        .select(`
          id,
          package_id,
          quantity,
          packages:package_id (
            name,
            unit_cost,
            type
          )
        `)
        .eq("product_id", productId);
      
      if (error) throw error;
      
      return data.map(item => ({
        id: item.id,
        package_id: item.package_id,
        quantity: item.quantity,
        package: {
          name: item.packages.name,
          unit_cost: item.packages.unit_cost,
          type: item.packages.type
        }
      }));
    },
    enabled: !!productId,
  });
  
  const { data: availableRecipes, isLoading: isLoadingAvailableRecipes } = useQuery({
    queryKey: ["recipes-for-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recipes")
        .select("id, name, total_cost, cost_per_unit, category, servings")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });
  
  const { data: availablePackages, isLoading: isLoadingAvailablePackages } = useQuery({
    queryKey: ["packages-for-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("id, name, unit_cost, type")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });
  
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setCategory(product.category || "");
      setImageUrl(product.image_url);
      setIsVisibleInStore(product.visible_in_store || false);
      setProfitMargin(product.profit_margin || 30);
      setPrice(product.price || 0);
    } else {
      resetForm();
    }
  }, [product]);
  
  useEffect(() => {
    if (existingProductRecipes) {
      setProductRecipes(existingProductRecipes);
    }
  }, [existingProductRecipes]);
  
  useEffect(() => {
    if (existingProductPackages) {
      setProductPackages(existingProductPackages);
    }
  }, [existingProductPackages]);
  
  useEffect(() => {
    calculateCosts();
  }, [productRecipes, productPackages]);
  
  useEffect(() => {
    if (isUserEditingMargin && !isUserEditingPrice) {
      const newPrice = totalCost + (totalCost * profitMargin / 100);
      setPrice(newPrice);
    }
  }, [profitMargin, totalCost, isUserEditingMargin]);
  
  useEffect(() => {
    if (isUserEditingPrice && !isUserEditingMargin && totalCost > 0) {
      const newMargin = ((price - totalCost) / totalCost) * 100;
      setProfitMargin(newMargin >= 0 ? newMargin : 0);
    }
  }, [price, totalCost, isUserEditingPrice]);
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("");
    setImageUrl(null);
    setIsVisibleInStore(true);
    setProductRecipes([]);
    setProductPackages([]);
    setProfitMargin(30);
    setPrice(0);
    setTotalCost(0);
    setSelectedRecipeId("");
    setRecipeQuantity(1);
    setSelectedPackageId("");
    setPackageQuantity(1);
  };
  
  const calculateCosts = () => {
    const recipesCost = productRecipes.reduce((total, item) => {
      const recipe = availableRecipes?.find(r => r.id === item.recipe_id);
      if (recipe) {
        return total + (recipe.cost_per_unit * item.quantity);
      }
      return total;
    }, 0);
    
    const packagesCost = productPackages.reduce((total, item) => {
      const pkg = availablePackages?.find(p => p.id === item.package_id);
      if (pkg) {
        return total + (pkg.unit_cost * item.quantity);
      }
      return total;
    }, 0);
    
    const newTotalCost = recipesCost + packagesCost;
    setTotalCost(newTotalCost);
    
    if (!isUserEditingPrice) {
      const suggestedPrice = newTotalCost + (newTotalCost * profitMargin / 100);
      setPrice(suggestedPrice);
    }
  };
  
  const handleAddRecipe = () => {
    if (!selectedRecipeId || recipeQuantity <= 0) return;
    
    const recipeExists = productRecipes.some(item => item.recipe_id === selectedRecipeId);
    if (recipeExists) {
      toast.error("Esta receita já foi adicionada ao produto");
      return;
    }
    
    const recipe = availableRecipes?.find(r => r.id === selectedRecipeId);
    if (recipe) {
      setProductRecipes([
        ...productRecipes,
        {
          id: `temp-${Date.now()}`,
          recipe_id: selectedRecipeId,
          quantity: recipeQuantity,
          recipe: {
            name: recipe.name,
            total_cost: recipe.total_cost,
            category: recipe.category
          }
        }
      ]);
      
      setSelectedRecipeId("");
      setRecipeQuantity(1);
    }
  };
  
  const handleRemoveRecipe = (recipeId: string) => {
    setProductRecipes(productRecipes.filter(item => item.recipe_id !== recipeId));
  };
  
  const handleAddPackage = () => {
    if (!selectedPackageId || packageQuantity <= 0) return;
    
    const packageExists = productPackages.some(item => item.package_id === selectedPackageId);
    if (packageExists) {
      toast.error("Esta embalagem já foi adicionada ao produto");
      return;
    }
    
    const pkg = availablePackages?.find(p => p.id === selectedPackageId);
    if (pkg) {
      setProductPackages([
        ...productPackages,
        {
          id: `temp-${Date.now()}`,
          package_id: selectedPackageId,
          quantity: packageQuantity,
          package: {
            name: pkg.name,
            unit_cost: pkg.unit_cost,
            type: pkg.type
          }
        }
      ]);
      
      setSelectedPackageId("");
      setPackageQuantity(1);
    }
  };
  
  const handleRemovePackage = (packageId: string) => {
    setProductPackages(productPackages.filter(item => item.package_id !== packageId));
  };
  
  const handleProfitMarginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserEditingMargin(true);
    setIsUserEditingPrice(false);
    setProfitMargin(parseFloat(e.target.value) || 0);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUserEditingPrice(true);
    setIsUserEditingMargin(false);
    setPrice(parseFloat(e.target.value) || 0);
  };
  
  const handleSubmit = async () => {
    if (!name) {
      toast.error("O nome do produto é obrigatório");
      return;
    }
    
    if (!user?.id) {
      toast.error("Você precisa estar logado para salvar um produto");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let productData;
      if (productId) {
        const { data, error } = await supabase
          .from("products")
          .update({
            name,
            description,
            category,
            image_url: imageUrl,
            price,
            visible_in_store: isVisibleInStore,
            cost: totalCost,
            profit_margin: profitMargin,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId)
          .select()
          .single();
        
        if (error) throw error;
        productData = data;
        
        const { error: deleteRecipesError } = await supabase
          .from("product_recipes")
          .delete()
          .eq("product_id", productId);
        
        if (deleteRecipesError) throw deleteRecipesError;
        
        const { error: deletePackagesError } = await supabase
          .from("product_packages")
          .delete()
          .eq("product_id", productId);
        
        if (deletePackagesError) throw deletePackagesError;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert({
            name,
            description,
            category,
            image_url: imageUrl,
            price,
            visible_in_store: isVisibleInStore,
            cost: totalCost,
            profit_margin: profitMargin,
            vendor_id: user.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        productData = data;
      }
      
      if (productRecipes.length > 0) {
        const recipePromises = productRecipes.map(recipe => {
          return supabase
            .from("product_recipes")
            .insert({
              product_id: productData.id,
              recipe_id: recipe.recipe_id,
              quantity: recipe.quantity
            });
        });
        
        const recipeResults = await Promise.all(recipePromises);
        const recipeErrors = recipeResults.filter(result => result.error);
        
        if (recipeErrors.length > 0) {
          throw recipeErrors[0].error;
        }
      }
      
      if (productPackages.length > 0) {
        const packagePromises = productPackages.map(pkg => {
          return supabase
            .from("product_packages")
            .insert({
              product_id: productData.id,
              package_id: pkg.package_id,
              quantity: pkg.quantity
            });
        });
        
        const packageResults = await Promise.all(packagePromises);
        const packageErrors = packageResults.filter(result => result.error);
        
        if (packageErrors.length > 0) {
          throw packageErrors[0].error;
        }
      }
      
      toast.success(productId ? "Produto atualizado com sucesso" : "Produto criado com sucesso");
      onSaved();
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {productId ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do produto para cadastrá-lo no sistema.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto pr-2">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="info">Informações Básicas</TabsTrigger>
              <TabsTrigger value="composition">Composição</TabsTrigger>
              <TabsTrigger value="pricing">Precificação</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-6 py-4">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Combo Brigadeiro Gourmet"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os detalhes do produto"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    placeholder="Ex: Doces, Bolos, Salgados"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Imagem do Produto</Label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 border rounded flex items-center justify-center bg-muted">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ImageIcon className="text-muted-foreground" size={24} />
                      )}
                    </div>
                    
                    <div className="space-y-2 flex-1">
                      <Input
                        id="image"
                        placeholder="URL da imagem"
                        value={imageUrl || ""}
                        onChange={(e) => setImageUrl(e.target.value)}
                      />
                      
                      <div className="text-xs text-muted-foreground">
                        Insira a URL de uma imagem para o produto. Para melhores resultados, use imagens quadradas.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="visible"
                    checked={isVisibleInStore}
                    onCheckedChange={setIsVisibleInStore}
                  />
                  <Label htmlFor="visible">Visível na Loja Pública</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="composition" className="space-y-6 py-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Receitas no Produto</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="recipe">Receita</Label>
                        <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma receita" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRecipes?.map((recipe) => (
                              <SelectItem key={recipe.id} value={recipe.id}>
                                {recipe.name} - {recipe.servings} unidades - Custo por unidade: {formatCurrency(recipe.cost_per_unit)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipeQuantity">Quantidade</Label>
                        <div className="flex gap-2">
                          <Input
                            id="recipeQuantity"
                            type="number"
                            min="1"
                            value={recipeQuantity}
                            onChange={(e) => setRecipeQuantity(parseInt(e.target.value) || 1)}
                          />
                          
                          <Button 
                            type="button" 
                            onClick={handleAddRecipe}
                            disabled={!selectedRecipeId}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {productRecipes.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhuma receita adicionada
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {productRecipes.map((item) => {
                          const recipe = availableRecipes?.find(r => r.id === item.recipe_id);
                          const recipeCost = (recipe?.cost_per_unit || 0) * item.quantity;
                          return (
                            <div 
                              key={item.recipe_id} 
                              className="flex items-center justify-between p-2 rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                                  {item.quantity}
                                </Badge>
                                <span>{item.recipe?.name || recipe?.name || "Receita"}</span>
                                {(recipe?.category || item.recipe?.category) && (
                                  <Badge variant="secondary" className="text-xs">
                                    {recipe?.category || item.recipe?.category || ""}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                  Custo: {formatCurrency(recipeCost)}
                                </span>
                                
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveRecipe(item.recipe_id)}
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Embalagens no Produto</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="package">Embalagem</Label>
                        <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma embalagem" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePackages?.map((pkg) => (
                              <SelectItem key={pkg.id} value={pkg.id}>
                                {pkg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="packageQuantity">Quantidade</Label>
                        <div className="flex gap-2">
                          <Input
                            id="packageQuantity"
                            type="number"
                            min="1"
                            value={packageQuantity}
                            onChange={(e) => setPackageQuantity(parseInt(e.target.value) || 1)}
                          />
                          
                          <Button 
                            type="button" 
                            onClick={handleAddPackage}
                            disabled={!selectedPackageId}
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {productPackages.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        Nenhuma embalagem adicionada
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {productPackages.map((item) => {
                          const pkg = availablePackages?.find(p => p.id === item.package_id);
                          return (
                            <div 
                              key={item.package_id} 
                              className="flex items-center justify-between p-2 rounded border"
                            >
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0">
                                  {item.quantity}
                                </Badge>
                                <span>{item.package?.name || pkg?.name || "Embalagem"}</span>
                                {(pkg?.type || item.package?.type) && (
                                  <Badge variant="secondary" className="text-xs">
                                    {pkg?.type || item.package?.type || ""}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                  Custo: {formatCurrency((item.package?.unit_cost || pkg?.unit_cost || 0) * item.quantity)}
                                </span>
                                
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleRemovePackage(item.package_id)}
                                >
                                  <Trash size={14} />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-6 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumo de Custos</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Custo das Receitas:</span>
                      <span>
                        {formatCurrency(productRecipes.reduce((total, item) => {
                          const recipe = availableRecipes?.find(r => r.id === item.recipe_id);
                          return total + ((recipe?.total_cost || 0) * item.quantity);
                        }, 0))}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Custo das Embalagens:</span>
                      <span>
                        {formatCurrency(productPackages.reduce((total, item) => {
                          const pkg = availablePackages?.find(p => p.id === item.package_id);
                          return total + ((pkg?.unit_cost || 0) * item.quantity);
                        }, 0))}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center font-medium">
                      <span>Custo Total do Produto:</span>
                      <span>
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Precificação</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="margin">Margem de Lucro (%)</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="margin"
                        type="number"
                        min="0"
                        max="1000"
                        value={profitMargin.toFixed(2)}
                        onChange={handleProfitMarginChange}
                        onFocus={() => {
                          setIsUserEditingMargin(true);
                          setIsUserEditingPrice(false);
                        }}
                      />
                      <span className="text-xl">%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço Final (R$)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price.toFixed(2)}
                      onChange={handlePriceChange}
                      onFocus={() => {
                        setIsUserEditingPrice(true);
                        setIsUserEditingMargin(false);
                      }}
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span>Lucro por Unidade:</span>
                      <span className={price > totalCost ? "text-green-600" : "text-destructive"}>
                        {formatCurrency(price - totalCost)}
                      </span>
                    </div>
                    
                    {totalCost > 0 && (
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-muted-foreground">Margem Efetiva:</span>
                        <span className={price > totalCost ? "text-green-600" : "text-destructive"}>
                          {totalCost > 0 ? `${((price - totalCost) / totalCost * 100).toFixed(1)}%` : "0%"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name}>
            {isSubmitting ? "Salvando..." : productId ? "Atualizar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
