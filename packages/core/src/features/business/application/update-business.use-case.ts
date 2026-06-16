
import { Business, BusinessProps } from "../domain/business.entity";
import { BusinessRepository } from "../domain/business.repository";
import { RecordAuditLogUseCase } from "../../audit-logs/application/record-audit-log.use-case";
import { AuditLogProps } from "../../audit-logs/domain/audit-log.entity";

export class UpdateBusinessUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly recordAuditLogUseCase: RecordAuditLogUseCase
    ) { }

    async execute(id: number, props: BusinessProps, auditContext: { tenantId: number, userId?: number, ipAddress?: string, userAgent?: string }): Promise<Business> {
        // Fetch the old business state for audit logging
        const oldBusiness = await this.businessRepository.findById(id);
        const oldBusinessPrimitives = oldBusiness ? oldBusiness.toPrimitives() : undefined;

        const taxId = props.taxId;
        const business = Business.create({ ...props, taxId, id });
        const updatedBusiness = await this.businessRepository.update(id, business, auditContext.tenantId);

        // Record audit log
        const auditLogProps: AuditLogProps = {
            tenant_id: auditContext.tenantId,
            changed_by: auditContext.userId?.toString() || null,
            operation: 'UPDATE',
            table_name: 'Business',
            record_id: updatedBusiness.toPrimitives().id!.toString(),
            old_values: (oldBusinessPrimitives || null) as unknown as Record<string, unknown>,
            new_values: updatedBusiness.toPrimitives() as unknown as Record<string, unknown>,
        };
        await this.recordAuditLogUseCase.execute(auditLogProps);

        return updatedBusiness;
    }
}
