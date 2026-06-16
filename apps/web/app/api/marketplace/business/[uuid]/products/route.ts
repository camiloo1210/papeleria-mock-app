import { NextRequest, NextResponse } from "next/server";
import { SupabaseMarketplaceRepository } from "@/features/marketplace/infrastructure/supabase-marketplace.repository";

interface Params {
    params: Promise<{
        uuid: string;
    }>;
}

export async function GET(req: NextRequest, { params }: Params) {
    const { uuid } = await params;
    const repo = new SupabaseMarketplaceRepository();

    // 1. Find the business to get the numeric ID
    const business = await repo.findBusinessByUuid(uuid);

    if (!business) {
        return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    if (!business.id) {
        return NextResponse.json({ error: "Business ID invalid" }, { status: 500 });
    }

    // 2. Fetch products using the numeric ID
    // Note: The repository handles signed URLs internally.
    const products = await repo.findProductsByBusiness(business.id);

    return NextResponse.json(products, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
