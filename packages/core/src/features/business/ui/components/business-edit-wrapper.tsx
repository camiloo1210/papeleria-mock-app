'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

import { UpdateBusinessUseCase } from '@/features/business/application/update-business.use-case';
import { DeleteBusinessUseCase } from '@/features/business/application/delete-business.use-case';
import { SupabaseBusinessRepository } from '@/features/business/infrastructure/supabase-business.repository';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> audit-logs (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { RecordAuditLogUseCase } from '@/features/audit-logs/application/record-audit-log.use-case';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> audit-logs (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseAuditLogRepository } from '@/features/audit-logs/infrastructure/supabase-audit-log.repository';
import BusinessEditForm from '@/features/business/ui/components/business-edit-form';

interface BusinessFormValues {
    id?: number;
    uuid?: string;
    legalName: string;
    tradeName: string;
    taxId: string;
    taxpayerType: string;
    logoUrl: string;
    brandColor?: string;
    timezone?: string;
    currency: string;
    subscriptionStatus?: string;
    status?: boolean;
    acceptsSuppliers?: boolean;
    categories?: string[];
}

interface BusinessEditWrapperProps {
    initialData: BusinessFormValues;
    tenantId: number;
    availableCategories: { id: number; name: string; slug: string }[];
}

export default function BusinessEditWrapper({ initialData, tenantId, availableCategories }: BusinessEditWrapperProps) {
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (data: any) => {
        const supabase = createClient();
        const businessRepository = new SupabaseBusinessRepository(supabase);
        const auditLogRepository = new SupabaseAuditLogRepository(supabase);
        const recordAuditLogUseCase = new RecordAuditLogUseCase(auditLogRepository);
        const updateBusinessUseCase = new UpdateBusinessUseCase(businessRepository, recordAuditLogUseCase);

        try {
            const auditContext = {
                tenantId: tenantId, // Use the passed tenant ID
                userId: undefined, // Replace with actual user ID
                ipAddress: undefined,
                userAgent: undefined,
            };

            await updateBusinessUseCase.execute(Number(initialData.id), data, auditContext);
            router.push('/business'); // Redirect to business list after update
        } catch (error) {
            console.error(error);
            // Show error message
        }
    };

    const handleDelete = async () => {
        const supabase = createClient();
        const businessRepository = new SupabaseBusinessRepository(supabase);
        const auditLogRepository = new SupabaseAuditLogRepository(supabase);
        const recordAuditLogUseCase = new RecordAuditLogUseCase(auditLogRepository);
        const deleteBusinessUseCase = new DeleteBusinessUseCase(businessRepository, recordAuditLogUseCase);

        try {
            const auditContext = {
                tenantId: tenantId, // Use the passed tenant ID
                userId: undefined, // Replace with actual user ID
                ipAddress: undefined,
                userAgent: undefined,
            };

            await deleteBusinessUseCase.execute(Number(initialData.id), auditContext);
            router.push('/business'); // Redirect to business list after deletion
        } catch (error) {
            console.error(error);
            // Show error message
        }
    };

    return (
        <BusinessEditForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            availableCategories={availableCategories}
        />
    );
}