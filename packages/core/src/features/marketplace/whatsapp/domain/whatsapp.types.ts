export interface WhatsAppMessage {
    from: string;
    id: string;
    timestamp: string;
    type: 'text' | 'image' | 'document' | 'location' | 'unknown';
    text?: {
        body: string;
    };
    image?: {
        mime_type: string;
        sha256: string;
        id: string;
    };
    document?: {
        filename: string;
        mime_type: string;
        sha256: string;
        id: string;
    };
}

export interface WhatsAppContact {
    profile: {
        name: string;
    };
    wa_id: string;
}

export interface WhatsAppWebhookPayload {
    object: 'whatsapp_business_account';
    entry: {
        id: string;
        changes: {
            value: {
                messaging_product: 'whatsapp';
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts: WhatsAppContact[];
                messages: WhatsAppMessage[];
            };
            field: 'messages';
        }[];
    }[];
}
