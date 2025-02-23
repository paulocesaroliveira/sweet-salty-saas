
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function OrderSettingsForm() {
  return (
    <form className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Pedidos</CardTitle>
          <CardDescription>
            Configure como os pedidos são processados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aprovação Automática</Label>
              <p className="text-sm text-muted-foreground">
                Aceita pedidos automaticamente
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-muted-foreground">
                Receba emails quando novos pedidos chegarem
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações por WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Receba mensagens quando novos pedidos chegarem
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Entrega</CardTitle>
          <CardDescription>
            Configure as opções de entrega
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Retirada no Local</Label>
              <p className="text-sm text-muted-foreground">
                Permite que clientes retirem no estabelecimento
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Entrega Própria</Label>
              <p className="text-sm text-muted-foreground">
                Utiliza entregadores próprios
              </p>
            </div>
            <Switch />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_fee">Taxa de Entrega (R$)</Label>
            <Input
              id="delivery_fee"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
          <CardDescription>
            Configure os horários de atendimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day) => (
            <div key={day} className="grid grid-cols-3 gap-4 items-center">
              <Label className="col-span-1">{day}</Label>
              <div className="col-span-2 flex gap-2">
                <Input type="time" />
                <Input type="time" />
              </div>
            </div>
          ))}
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
