import { WhatsAppCommandParser, WhatsAppIntent } from '../command-parser.service';
import { WhatsAppClientAdapter } from '../../infrastructure/whatsapp-client.adapter';
import { WhatsAppRepository } from '../../infrastructure/whatsapp.repository';
import { WhatsAppMessage } from '../../domain/whatsapp.types';
import { SupabaseClient } from '@supabase/supabase-js';

// TODO: Import real Use Cases
// import { GenerateElectronicInvoiceUseCase } from ...

export class HandleIncomingMessageUseCase {
    private repo: WhatsAppRepository;

    constructor(
        private readonly supabase: SupabaseClient
    ) {
        this.repo = new WhatsAppRepository(supabase);
    }

    async execute(message: WhatsAppMessage, senderId: string, senderName: string, metadata: { phone_number_id: string }) {
        // 0. Resolve Tenant Config
        const config = await this.repo.getByPhoneNumberId(metadata.phone_number_id);

        if (!config) {
            console.warn(`[WhatsApp] Unknown phone number ID: ${metadata.phone_number_id}. Ignoring.`);
            return;
        }

        // Initialize Client with Tenant Credentials
        const client = new WhatsAppClientAdapter(config.access_token, config.phone_number_id);

        // 1. Only handle text for now
        if (message.type !== 'text' || !message.text) {
            // await client.sendText(senderId, 'Lo siento, solo entiendo mensajes de texto por ahora. 🤖');
            return;
        }

        const text = message.text.body;
        // eslint-disable-next-line no-console
        console.log(`[WhatsAppUseCase] Processing: "${text}" from ${senderName} (${senderId}) for Tenant ${config.tenant_id}`);

        // 2. Parse Command
        const command = WhatsAppCommandParser.parse(text);

        // 3. Router
        switch (command.intent) {
            case WhatsAppIntent.GENERATE_INVOICE:
                await this.handleGenerateInvoice(client, senderId, command.args, config.tenant_id);
                break;

            case WhatsAppIntent.CREATE_ORDER:
                await this.handleCreateOrder(client, senderId, command.args);
                break;

            case WhatsAppIntent.HELP:
                await client.sendText(senderId,
                    `👋 Hola ${senderName}, bienvenido a ${config.name || 'Fiado'}!\n\n` +
                    `Comandos disponibles:\n` +
                    `📄 *!factura* <id_orden> : Generar factura\n` +
                    `🛒 *!pedido* <items> : Crear pedido (Demo)\n` +
                    `❓ *!ayuda* : Ver este menú`
                );
                break;

            case WhatsAppIntent.UNKNOWN:
                if (text.startsWith('!')) {
                    await client.sendText(senderId, 'Comando no reconocido. Escribe *!ayuda* para ver opciones.');
                }
                break;
        }
    }

    private async handleGenerateInvoice(client: WhatsAppClientAdapter, to: string, args: string[], tenantId: string) {
        if (args.length === 0) {
            await client.sendText(to, '⚠️ Debes indicar el ID de la orden. Ejemplo: *!factura 123*');
            return;
        }

        const orderId = args[0];
        await client.sendText(to, `🔄 Generando factura para la orden #${orderId}... espera un momento.`);

        try {
            // TODO: Call Real Use Case
            // const useCase = new GenerateElectronicInvoiceUseCase(new SupabaseBillingRepository(this.supabase), this.supabase);
            // await useCase.execute(orderId, tenantId);

            // Mock delay
            await new Promise(r => setTimeout(r, 2000));

            // Mock Success (Real logic would return the signed XML/PDF URL)
            await client.sendText(to, `✅ Factura generada y enviada al SRI. (Simulación para tenant ${tenantId})`);
            await client.sendDocument(to, 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'Factura-123.pdf');

        } catch (error) {
            console.error(error);
            await client.sendText(to, '❌ Error generando la factura. Verifica el ID.');
        }
    }

    private async handleCreateOrder(client: WhatsAppClientAdapter, to: string, _args: string[]) {
        await client.sendText(to, '🚧 Módulo de Pedidos en construcción.');
    }
}
