import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, MessageCircle, Key, Link as LinkIcon } from "lucide-react";

export default function WhatsAppSettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración de WhatsApp</h1>
        <p className="text-muted-foreground mt-2">
          Administra las credenciales y webhooks para la integración con WhatsApp Business API.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" /> Credenciales de la API
              </CardTitle>
              <CardDescription>
                Tokens de acceso y verificación necesarios para conectar tu bot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token Permanente</Label>
                <Input id="accessToken" type="password" value="EAALx1234567890abcdefghijklmnopqrstuvwxyz" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <Input id="phoneNumberId" type="text" value="123456789012345" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wabaId">WhatsApp Business Account ID</Label>
                <Input id="wabaId" type="text" value="987654321098765" readOnly />
              </div>
              <div className="flex justify-end pt-4">
                <Button>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-primary" /> Configuración del Webhook
              </CardTitle>
              <CardDescription>
                Ruta donde recibirás los mensajes entrantes de tus clientes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL (Callback)</Label>
                <Input id="webhookUrl" type="text" value="https://api.tudominio.com/webhooks/whatsapp" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verifyToken">Verify Token</Label>
                <Input id="verifyToken" type="password" value="my-super-secret-verify-token-2024" readOnly />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5 text-green-600" /> Estado del Servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-400">Conectado</p>
                  <p className="text-sm text-muted-foreground">El webhook está respondiendo correctamente.</p>
                </div>
              </div>
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mensajes enviados (hoy)</span>
                  <span className="font-medium">1,245</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sesiones activas</span>
                  <span className="font-medium">42</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
