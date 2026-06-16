'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { SupabaseBusinessCategoryRepository } from "../infrastructure/repositories/supabase-business-category.repository";

const UpdateBusinessProfileSchema = z.object({
    businessId: z.number(),
    tradeName: z.string().min(1, "El nombre comercial es obligatorio"),
    brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color inválido"),
    acceptsSuppliers: z.boolean().optional().default(false),
    categoryIds: z.array(z.number()).optional().default([]),
});

export async function updateBusinessProfileAction(_prevState: unknown, formData: FormData) {
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "No autenticado" };
    }

    const businessId = Number(formData.get('businessId'));
    const tradeName = formData.get('tradeName') as string;
    const brandColor = formData.get('brandColor') as string;
    const acceptsSuppliers = formData.get('acceptsSuppliers') === 'true';

    // Parse categories from checkbox array
    const categoryIds = formData.getAll('categories').map(id => Number(id));

    // Validate
    const validatedFields = UpdateBusinessProfileSchema.safeParse({
        businessId,
        tradeName,
        brandColor,
        acceptsSuppliers,
        categoryIds
    });

    if (!validatedFields.success) {
        return { success: false, error: "Datos inválidos", errors: validatedFields.error.flatten().fieldErrors };
    }

    // 2. Check permissions (is employee of this business?)
    const { data: employee } = await supabase
        .schema('core')
        .from('employees')
        .select('tenant_id, role_id')
        .eq('user_id', user.id)
        .eq('tenant_id', businessId)
        .single();

    if (!employee) {
        return { success: false, error: "No tienes permisos para editar este negocio" };
    }

    // 3. Update Business
    const { error } = await supabase
        .schema('core')
        .from('business')
        .update({
            trade_name: tradeName,
            brand_color: brandColor,
            accepts_suppliers: acceptsSuppliers,
            updated_at: new Date().toISOString()
        })
        .eq('id', businessId);

    if (error) {
        console.error("Update Business Profile Error:", error);
        return { success: false, error: "Error al actualizar el perfil" };
    }

    // 4. Update Categories
    try {
        const categoryRepo = new SupabaseBusinessCategoryRepository(supabase);
        await categoryRepo.assignToBusiness(businessId, categoryIds);
    } catch (error) {
        console.error("Update Business Categories Error:", error);
        // We warn but don't fail the whole action if only tags fail? 
        // Or arguably we should return error. Let's return error to be safe.
        return { success: false, error: "Error al actualizar las categorías" };
    }

    revalidatePath('/protected/settings/marketplace');
    revalidatePath(`/marketplace/${businessId}`);
    revalidatePath(`/marketplace`);

    return { success: true, message: "Perfil actualizado correctamente" };
}
