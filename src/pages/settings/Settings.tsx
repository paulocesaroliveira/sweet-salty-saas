
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreSettingsForm } from "./components/StoreSettingsForm";
import { ProductSettingsForm } from "./components/ProductSettingsForm";
import { OrderSettingsForm } from "./components/OrderSettingsForm";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("store");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Personalize a plataforma de acordo com as necessidades do seu negócio.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="store">
            Dados da Loja
          </TabsTrigger>
          <TabsTrigger value="products">
            Produtos e Receitas
          </TabsTrigger>
          <TabsTrigger value="orders">
            Pedidos e Entregas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <StoreSettingsForm />
        </TabsContent>

        <TabsContent value="products">
          <ProductSettingsForm />
        </TabsContent>

        <TabsContent value="orders">
          <OrderSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
