'use client';

import { useRouter } from 'next/navigation';
import { createBusinessAction } from '@/features/business/actions/create-business';
import BusinessForm from '@/features/business/ui/components/business-form';

interface BusinessCreateWrapperProps {
    tenantId: number;
}

export default function BusinessCreateWrapper({ tenantId }: BusinessCreateWrapperProps) {
    const router = useRouter();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (data: any) => {
        try {
            const auditContext = {
                tenantId: tenantId,
                userId: undefined,
                ipAddress: undefined,
                userAgent: undefined,
            };

            const result = await createBusinessAction({
                business: {
                    legalName: data.legalName,
                    tradeName: data.tradeName,
                    taxId: data.taxId,
                    taxpayerType: data.taxpayerType,
                    logoUrl: data.logoUrl,
                    currency: data.currency,
                },
                person: {
                    first_name: data.first_name as string,
                    last_name: data.last_name as string,
                    email: data.email as string,
                    nationalId: (data.nationalId as string || '').replace(/\D/g, ''),
                },
                user: {
                    email: data.email,
                    password: data.password,
                },
                auditContext
            });

            if (result.success) {
                router.push('/business');
            } else {
                console.error(result.error);
                // TODO: Show error message
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <BusinessForm
            onSubmit={handleSubmit}
            isEditMode={false}
        />
    );
}