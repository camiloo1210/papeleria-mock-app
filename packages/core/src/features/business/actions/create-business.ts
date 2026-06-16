'use server';

import { createClient } from '@/lib/supabase/server';
import { CreateBusinessUseCase } from '@/features/business/application/create-business.use-case';
import { SupabaseBusinessRepository } from '@/features/business/infrastructure/supabase-business.repository';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> audit-logs (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseAuditLogRepository } from '@/features/audit-logs/infrastructure/supabase-audit-log.repository';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> audit-logs (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { RecordAuditLogUseCase } from '@/features/audit-logs/application/record-audit-log.use-case';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> person (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabasePersonRepository } from '@/features/person/infrastructure/supabase-person.repository';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { AuthRepositoryImpl } from '@/features/auth/infrastructure/adapters/AuthRepositoryImpl';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> employee (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { SupabaseEmployeeRepository } from '@/features/employee/infrastructure/supabase-employee.repository';
import { TaxId } from '@/features/shared/domain/value-objects/TaxId';
import { CurrencyCode } from '@/features/shared/domain/value-objects/CurrencyCode';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> person (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { NationalId } from '@/features/person/domain/value-objects/national-id.vo';


interface CreateBusinessActionProps {
    business: {
        legalName: string;
        tradeName: string;
        taxId: string;
        taxpayerType: string;
        logoUrl: string;
        currency: string;
        countryCode?: string;
        categories?: string[];
    };
    person: {
        first_name: string;
        last_name: string;
        email: string;
        phone_number?: string;
        date_of_birth?: string; // Passed as string to be serializable
        gender?: string;
        nationalId: string;
    };
    user: {
        email: string;
        password?: string;
    };
    auditContext: {
        tenantId: number;
        userId?: number;
        ipAddress?: string;
        userAgent?: string;
    };
}

import { createServiceRoleClient } from '@/lib/supabase/service';

export async function createBusinessAction(props: CreateBusinessActionProps) {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Use Admin client for BusinessRepository to bypass RLS during creation
    const businessRepository = new SupabaseBusinessRepository(supabaseAdmin);
    const auditLogRepository = new SupabaseAuditLogRepository(supabase);
    const recordAuditLogUseCase = new RecordAuditLogUseCase(auditLogRepository);
    const personRepository = new SupabasePersonRepository(supabase);
    const authRepository = new AuthRepositoryImpl(supabase);
    const employeeRepository = new SupabaseEmployeeRepository(supabase);


    const createBusinessUseCase = new CreateBusinessUseCase(
        businessRepository,
        recordAuditLogUseCase,
        supabase,
        personRepository,
        authRepository,
        employeeRepository
    );

    try {
        const businessProps = {
            legalName: props.business.legalName,
            tradeName: props.business.tradeName,
            taxId: TaxId.create(props.business.taxId),
            taxpayerType: props.business.taxpayerType,
            logoUrl: props.business.logoUrl,
            currency: CurrencyCode.create(props.business.currency),
            countryCode: props.business.countryCode,
            categories: props.business.categories,
        };

        const personProps = {
            ...props.person,
            date_of_birth: props.person.date_of_birth ? new Date(props.person.date_of_birth) : undefined,
            nationalId: NationalId.create(props.person.nationalId, props.business.countryCode),
        };

        const result = await createBusinessUseCase.execute(
            businessProps,
            personProps,
            props.user,
            props.auditContext
        );

        return { success: true, data: result.toPrimitives() };
    } catch (error: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any; // Cast for accessing message property safely or use standard check
        console.error('Error creating business:', err);
        return { success: false, error: err.message || String(error) };
    }
}
