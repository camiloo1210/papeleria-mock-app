export enum WhatsAppIntent {
    GENERATE_INVOICE = 'GENERATE_INVOICE',
    CREATE_ORDER = 'CREATE_ORDER',
    HELP = 'HELP',
    UNKNOWN = 'UNKNOWN'
}

export interface ParsedCommand {
    intent: WhatsAppIntent;
    args: string[];
    rawCallbackId?: string; // For button clicks in the future
}

export class WhatsAppCommandParser {

    static parse(text: string): ParsedCommand {
        const trimmed = text.trim();

        if (trimmed.startsWith('!')) {
            const parts = trimmed.substring(1).split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);

            switch (command) {
                case 'factura':
                case 'invoice':
                case 'xml':
                    return { intent: WhatsAppIntent.GENERATE_INVOICE, args };

                case 'pedido':
                case 'order':
                    return { intent: WhatsAppIntent.CREATE_ORDER, args }; // e.g., !order 3xCola

                case 'ayuda':
                case 'help':
                    return { intent: WhatsAppIntent.HELP, args };

                default:
                    return { intent: WhatsAppIntent.UNKNOWN, args };
            }
        }

        // Natural Language Parsing or default behavior could go here
        return { intent: WhatsAppIntent.UNKNOWN, args: [] };
    }
}
