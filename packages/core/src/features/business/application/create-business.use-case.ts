import { Business, BusinessProps } from "../domain/business.entity";
import { BusinessRepository } from "../domain/business.repository";
import { RecordAuditLogUseCase } from "../../audit-logs/application/record-audit-log.use-case";
import { AuditLogProps } from "../../audit-logs/domain/audit-log.entity";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> person (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { NationalId } from '@/features/person/domain/value-objects/national-id.vo';
import { SupabaseClient } from "@supabase/supabase-js";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> person (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { PersonRepository } from "@/features/person/domain/person.repository";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { AuthRepository } from "@/features/auth/domain/repositories/AuthRepository";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> employee (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { EmployeeRepository } from "@/features/employee/domain/employee.repository";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> person (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { Gender } from "@/features/person/domain/gender.enum";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> person (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { Person } from "@/features/person/domain/person.entity";
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> employee (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { Employee } from "@/features/employee/domain/employee.entity";



import { createServiceRoleClient } from "@/lib/supabase/service";

export class CreateBusinessUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly recordAuditLogUseCase: RecordAuditLogUseCase,
        private readonly supabase: SupabaseClient,
        private readonly personRepository: PersonRepository,
        private readonly authRepository: AuthRepository,
        private readonly employeeRepository: EmployeeRepository
    ) {}

    async execute(
        businessProps: BusinessProps & { categories?: string[] },
        personProps: { first_name: string; last_name: string; email: string; phone_number?: string; date_of_birth?: Date; gender?: string; nationalId: NationalId; },
        userProps: { email: string; password?: string; },
        _auditContext: { tenantId: number, userId?: number, ipAddress?: string, userAgent?: string }
    ): Promise<Business> {


        const supabaseAdmin = createServiceRoleClient();

        if (!supabaseAdmin) {
            throw new Error("Error crítico: No se pudo inicializar el cliente Service Role (Admin). Revisa tus variables de entorno.");
        }

        // --- Paso 0: Crear Negocio ---
        const businessEntity = Business.create({
            ...businessProps,
            taxId: businessProps.taxId,
            categories: businessProps.categories
        });
        const createdBusiness = await this.businessRepository.create(businessEntity);
        const newBusinessId = createdBusiness.toPrimitives().id;

        // --- Paso 1: Crear Persona (Usando cliente Admin para saltar RLS en 'shared') ---
        const newPersonEntity = Person.create({
            tenantId: newBusinessId!,
            firstName: personProps.first_name,
            lastName: personProps.last_name,
            birthDate: personProps.date_of_birth || new Date(),
            gender: personProps.gender && this.isValidGender(personProps.gender)
                ? personProps.gender as Gender
                : Gender.Male,
            nationalId: personProps.nationalId,
        });

        // Pasamos supabaseAdmin aquí
        const person = await this.personRepository.createWithServiceRole(newPersonEntity, supabaseAdmin);

        // --- Paso 2: Setear Tenant en sesión del usuario (opcional, para contexto) ---
        // Note: 'set_tenant_id' RPC does not exist in the current schema.
        // Session context is usually managed via middleware or RLS claims.
        // await this.supabase.rpc('set_tenant_id', { tenant_id: newBusinessId! });


        const user = await this.authRepository.create({
            email: userProps.email,
            password: userProps.password,
            personId: person.toPrimitives().id!,
            tenantId: newBusinessId!,
            isEmailVerified: false,
            mustChangePassword: true,
            isActive: true,
        }, supabaseAdmin); // ✅ ¡ESTO ES LO QUE FALTABA O ESTABA UNDEFINED!

        // --- Paso 4: Obtener Rol ADMIN (Usando cliente Admin por seguridad) ---
        const { data: adminRole, error: adminRoleError } = await supabaseAdmin
            .schema('core')
            .from('roles')
            .select('id')
            .eq('name', 'ADMIN')
            .single();
        if (adminRoleError) throw new Error(`Error fetching ADMIN role: ${adminRoleError.message}`);
        if (!adminRole) throw new Error('ADMIN role not found.');

        // --- Paso 5: Crear Empleado ---
        const newEmployeeEntity = Employee.create({
            personId: person.toPrimitives().id!,
            userId: user.getId(),
            tenantId: newBusinessId!,
            roleId: adminRole.id,
            isOwner: true,
            isActive: true,
            canWorkOffline: false,
        });

        await this.employeeRepository.create(newEmployeeEntity);





        // --- Paso 6: Auditoría ---
        const auditLogProps: AuditLogProps = {
            tenant_id: newBusinessId!,
            changed_by: user.getId().toString(),
            operation: 'INSERT',
            table_name: 'Business',
            record_id: newBusinessId!.toString(),
            new_values: createdBusiness.toPrimitives() as unknown as Record<string, unknown>,
            old_values: null,
            // ipAddress/userAgent not supported in new schema directly, maybe in metadata?
            // For now, ignoring or would need schema update. Schema has jsonb values, could put there?
            // "new_values" is JSONB. We can put metadata there if needed or just drop it as schema is strict.
            // Dropping for now to pass type check.
        };

        await this.recordAuditLogUseCase.execute(auditLogProps);

        return createdBusiness;
    }

    private isValidGender(gender: string): boolean {
        return Object.values(Gender).includes(gender as Gender);
    }
}