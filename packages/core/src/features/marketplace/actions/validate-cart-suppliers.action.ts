"use server";

import { createClient } from "@/lib/supabase/server";

export interface SupplierValidationResult {
    supplierId: number;
    isConnected: boolean;
    acceptsSuppliers: boolean;
    tradeName: string;
}

export async function validateCartSuppliersAction(supplierIds: number[], buyerTenantId: number): Promise<Record<number, SupplierValidationResult>> {
    const supabase = await createClient();
    const results: Record<number, SupplierValidationResult> = {};

    if (!supplierIds.length) return results;

    // 1. Fetch Suppliers Info (Business table)
    const { data: businesses } = await supabase
        .schema('core')
        .from('business')
        .select('id, trade_name, accepts_suppliers')
        .in('id', supplierIds);

    if (!businesses) return results;

    // 2. Check connections (Suppliers table in Buyer's tenant)
    // We check if "core.suppliers" has an entry with matching tax_id?
    // Or do we check "business_relationships" (if implemented)? 
    // The "Phase 3" plan says: "Check if Seller exists in Buyer's core.suppliers".
    // Problem: core.suppliers doesn't store the Seller's Tenant ID directly usually, it stores tax_id.
    // So we need to fetch Seller's Tax ID first?
    // OPTIMIZATION: If we added `tenant_id` to core.suppliers to link back to platform business?
    // Let's check `core.suppliers` schema again.
    // `20260209120000_connect_suppliers_to_tenants.sql` might have added it?
    // Let's assume we match by Tax ID for now which is the standard way.

    // Fetch Tax IDs for these businesses
    const { data: businessesWithTax } = await supabase
        .schema('core')
        .from('business')
        .select('id, tax_id')
        .in('id', supplierIds);

    const taxIdMap = new Map<number, string>();
    businessesWithTax?.forEach(b => taxIdMap.set(b.id, b.tax_id));

    // Now check Buyer's suppliers
    const taxIds = Array.from(taxIdMap.values());

    // If no buyerTenantId (e.g. Personal mode), we just return empty connections
    if (!buyerTenantId) {
        businesses.forEach(b => {
            results[b.id] = {
                supplierId: b.id,
                isConnected: false,
                acceptsSuppliers: b.accepts_suppliers ?? false,
                tradeName: b.trade_name
            };
        });
        return results;
    }

    const { data: existingSuppliers } = await supabase
        .schema('core')
        .from('suppliers')
        .select('tax_id')
        .eq('tenant_id', buyerTenantId)
        .in('tax_id', taxIds);

    const connectedTaxIds = new Set(existingSuppliers?.map(s => s.tax_id));

    businesses.forEach(b => {
        const taxId = taxIdMap.get(b.id);
        const isConnected = taxId ? connectedTaxIds.has(taxId) : false;

        results[b.id] = {
            supplierId: b.id,
            isConnected,
            acceptsSuppliers: b.accepts_suppliers ?? false,
            tradeName: b.trade_name
        };
    });

    return results;
}
