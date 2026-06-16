'use client';

import { useState } from 'react';
import { saveWhatsAppConfig } from '@/features/marketplace/whatsapp/actions/save-whatsapp-config.action';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function WhatsAppConfigForm({ initialData }: { initialData?: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        setStatus('idle');

        const result = await saveWhatsAppConfig(formData);

        setIsLoading(false);
        if (result.success) {
            setStatus('success');
        } else {
            console.error(result.error);
            setStatus('error');
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto border border-gray-100">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Configuración de WhatsApp 📲</h2>
                <p className="text-gray-500 text-sm">
                    Conecta tu número de WhatsApp Business API para enviar facturas y recibir pedidos automáticamente.
                </p>
            </div>

            <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Nombre para mostrar (Interno)
                    </label>
                    <input
                        id="name"
                        name="name"
                        defaultValue={initialData?.name}
                        placeholder="Ej. Línea Principal de Ventas"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="grid gap-2">
                    <label htmlFor="phone_number_id" className="text-sm font-medium leading-none">
                        Phone Number ID (Meta)
                    </label>
                    <input
                        id="phone_number_id"
                        name="phoneNumberId"
                        defaultValue={initialData?.phone_number_id}
                        required
                        placeholder="Ej. 352453624645..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[0.8rem] text-gray-500">
                        Consíguelo en el panel de Meta Developers &rarr; WhatsApp &rarr; API Setup.
                    </p>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="access_token" className="text-sm font-medium leading-none">
                        Permanent Access Token
                    </label>
                    <input
                        id="access_token"
                        name="accessToken"
                        type="password"
                        defaultValue={initialData?.access_token}
                        required
                        placeholder="EAAGG..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    <p className="text-[0.8rem] text-gray-500">
                        Debe ser un token de sistema o usuario con permisos `whatsapp_business_messaging`.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <label htmlFor="business_account_id" className="text-sm font-medium leading-none">
                            WABA ID (Opcional)
                        </label>
                        <input
                            id="business_account_id"
                            name="businessAccountId"
                            defaultValue={initialData?.business_account_id}
                            placeholder="Ej. 100023..."
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-gray-300"
                        />
                    </div>
                    <div className="grid gap-2">
                        <label htmlFor="verify_token" className="text-sm font-medium leading-none">
                            Verify Token (Webhook)
                        </label>
                        <input
                            id="verify_token"
                            name="verifyToken"
                            defaultValue={initialData?.verify_token}
                            placeholder="Tu token secreto"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm border-gray-300"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                {status === 'success' && (
                    <span className="text-green-600 text-sm font-medium flex items-center animate-in fade-in">
                        ✅ Guardado correctamente
                    </span>
                )}
                {status === 'error' && (
                    <span className="text-red-600 text-sm font-medium flex items-center animate-in fade-in">
                        ❌ Error al guardar
                    </span>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 py-2 px-4 w-32"
                >
                    {isLoading ? 'Guardando...' : 'Guardar'}
                </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-800">
                💡 <strong>Webhook URL:</strong>
                <code className="ml-2 bg-white px-2 py-1 rounded border border-blue-200 select-all">
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/whatsapp` : '/api/webhooks/whatsapp'}
                </code>
            </div>
        </form>
    );
}
