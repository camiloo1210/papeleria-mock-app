import axios from 'axios';

export class WhatsAppClientAdapter {
    private readonly baseUrl: string = 'https://graph.facebook.com/v17.0'; // Check version
    constructor(
        private readonly token: string,
        private readonly phoneNumberId: string
    ) {
        if (!this.token || !this.phoneNumberId) {
            console.warn('[WhatsAppClient] Missing credentials provided to constructor');
        }
    }

    async sendText(to: string, text: string) {
        if (!this.token) return;

        try {
            await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'text',
                    text: { body: text }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            // eslint-disable-next-line no-console
            console.log(`[WhatsApp] Sent text to ${to}`);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line no-console
            console.error('[WhatsApp] Failed to send text:', error.response?.data || error.message);
        }
    }

    async sendDocument(to: string, fileUrl: string, caption?: string, filename?: string) {
        if (!this.token) return;

        try {
            await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/messages`,
                {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'document',
                    document: {
                        link: fileUrl, // Must be a public URL
                        caption: caption,
                        filename: filename || 'document.pdf'
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            // eslint-disable-next-line no-console
            console.log(`[WhatsApp] Sent document to ${to}`);
        } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line no-console
            console.error('[WhatsApp] Failed to send document:', error.response?.data || error.message);
        }
    }

    // TODO: Implement Media ID upload for local files if needed (Meta requires Media ID for non-public files usually, but link works for public)
}
