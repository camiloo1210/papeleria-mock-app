import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServiceRoleClient } from '@/lib/supabase/service';
import { HandleIncomingMessageUseCase } from '@/features/marketplace/whatsapp/application/use-cases/handle-incoming-message.use-case';
import { webhookRatelimit } from '@fiado/core';

// Environment variables
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;

    // Parse params from the webhook verification request
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Respond with 200 OK and challenge token from the request
            return new NextResponse(challenge, { status: 200 });
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            return new NextResponse('Verification failed', { status: 403 });
        }
    }

    return new NextResponse('Invalid request', { status: 400 });
}

function verifySignature(body: string, signature: string | null, secret: string | undefined): boolean {
    if (!signature || !secret) {
        // Fail securely if signature or secret is missing configuration
        console.error('[WhatsApp] Missing signature or secret');
        return false;
    }

    const [algorithm, signatureHash] = signature.split('=');
    if (algorithm !== 'sha256') {
        return false;
    }

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(signatureHash),
        Buffer.from(expectedSignature)
    );
}

export async function POST(req: NextRequest) {
    try {
        // 0. Rate Limit
        const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
        const { success } = await webhookRatelimit.limit(ip);
        if (!success) {
            return new NextResponse('Too Many Requests', { status: 429 });
        }

        // 1. Get Raw Body for signature verification
        const rawBody = await req.text();
        const signature = req.headers.get('x-hub-signature-256');

        // 2. Verify Signature
        if (!verifySignature(rawBody, signature, APP_SECRET)) {
            console.warn('[WhatsApp] Invalid signature attempt', { signature });
            return new NextResponse('Invalid signature', { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const supabase = createServiceRoleClient();
        const useCase = new HandleIncomingMessageUseCase(supabase);

        // Basic Structure Check
        if (payload.object === 'whatsapp_business_account') {

            // Loop over entries (usually one)
            for (const entry of payload.entry) {
                for (const change of entry.changes) {
                    const value = change.value;

                    if (value.messages && value.messages.length > 0) {
                        const message = value.messages[0];
                        const contact = value.contacts?.[0]; // Sender info
                        const senderName = contact?.profile?.name || 'Usuario';
                        const senderId = contact?.wa_id;
                        const metadata = value.metadata; // Contains phone_number_id

                        if (senderId && metadata?.phone_number_id) {
                            // Execute Orchestrator
                            // Note: We await here but in Vercel Serverless we might timeout if long processing.
                            // For background jobs, we should queue it using Inngest or Supabase Queue.
                            await useCase.execute(message, senderId, senderName, {
                                phone_number_id: metadata.phone_number_id
                            });
                        }
                    }
                }
            }

            return new NextResponse('EVENT_RECEIVED', { status: 200 });
        }

        return new NextResponse('Not a WhatsApp event', { status: 404 });

    } catch (error) {
        console.error('[WhatsApp] Error processing webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
