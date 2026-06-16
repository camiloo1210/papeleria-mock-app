'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const _profileSchema = z.object({
    firstName: z.string().min(2, "El nombre es muy corto"),
    lastName: z.string().min(2, "El apellido es muy corto"),
    gender: z.enum(["Male", "Female", "Prefer not to say"]),
    birthDate: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof _profileSchema>;

export async function getProfileAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "No autenticado" };
    }

    // Fetch core.users to get person_id
    const { data: coreUser, error: coreError } = await supabase
        .schema('core')
        .from('users')
        .select('person_id, tenant_id') // Marketplace users have null tenant_id often
        .eq('uuid', user.id)
        .single();

    if (coreError || !coreUser) {
        return { success: false, message: "Usuario no encontrado" };
    }

    // Fetch Person
    const { data: person, error: personError } = await supabase
        .schema('shared')
        .from('person')
        .select('*')
        .eq('id', coreUser.person_id)
        .single();

    if (personError || !person) {
        return { success: false, message: "Perfil no encontrado" };
    }

    return {
        success: true,
        data: {
            firstName: person.first_name,
            lastName: person.last_name,
            email: user.email!,
            nationalId: person.national_id || '',
            gender: person.gender,
            birthDate: person.birth_date ? new Date(person.birth_date).toISOString().split('T')[0] : '',
        }
    };
}

export async function updateProfileAction(data: ProfileFormValues) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, message: "No autenticado" };
    }

    // 1. Find Core User to get Person ID
    const { data: coreUser } = await supabase
        .schema('core')
        .from('users')
        .select('person_id, tenant_id')
        .eq('uuid', user.id)
        .single();

    if (!coreUser) return { success: false, message: 'Usuario no encontrado' };

    // 2. Update Person
    const { error } = await supabase
        .schema('shared')
        .from('person')
        .update({
            first_name: data.firstName,
            last_name: data.lastName,
            gender: data.gender,
            birth_date: data.birthDate || null,
        })
        .eq('id', coreUser.person_id);

    if (error) {
        console.error("Update Profile Error:", error);
        return { success: false, message: 'Error al actualizar perfil' };
    }

    revalidatePath('/marketplace/profile');
    return { success: true, message: 'Perfil actualizado correctamente' };
}
