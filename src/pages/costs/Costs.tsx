
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FixedCosts } from "./components/FixedCosts";
import { LaborCosts } from "./components/LaborCosts";

export default function Costs() {
  const [activeTab, setActiveTab] = useState("fixed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Custos</h1>
        <p className="text-muted-foreground">
          Gerencie seus custos fixos e custos de mão de obra.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="fixed">Custos Fixos</TabsTrigger>
          <TabsTrigger value="labor">Mão de Obra</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fixed" className="mt-6">
          <FixedCosts />
        </TabsContent>
        
        <TabsContent value="labor" className="mt-6">
          <LaborCosts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
