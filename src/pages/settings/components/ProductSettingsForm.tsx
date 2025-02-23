
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProductSettingsForm() {
  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Unidades de Medida</CardTitle>
          <CardDescription>
            Configure as unidades padrão para seus produtos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default_unit">Unidade Padrão</Label>
            <Select defaultValue="g">
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="g">Gramas (g)</SelectItem>
                <SelectItem value="ml">Mililitros (ml)</SelectItem>
                <SelectItem value="un">Unidades (un)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Exibir em Porções</Label>
              <p className="text-sm text-muted-foreground">
                Mostra medidas em porções ao invés do total
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precificação</CardTitle>
          <CardDescription>
            Configure as regras de precificação dos produtos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default_margin">Margem de Lucro Padrão (%)</Label>
            <Input
              id="default_margin"
              type="number"
              min="0"
              max="1000"
              defaultValue="30"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sugestões de Preço</Label>
              <p className="text-sm text-muted-foreground">
                Receba sugestões baseadas no mercado
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estoque</CardTitle>
          <CardDescription>
            Configure o controle de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Controle Automático</Label>
              <p className="text-sm text-muted-foreground">
                Atualiza o estoque automaticamente com base nos pedidos
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
