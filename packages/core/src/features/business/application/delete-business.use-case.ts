
import { BusinessRepository } from "../domain/business.repository";
import { RecordAuditLogUseCase } from "../../audit-logs/application/record-audit-log.use-case";
import { AuditLogProps } from "../../audit-logs/domain/audit-log.entity";

export class DeleteBusinessUseCase {
    constructor(
        private readonly businessRepository: BusinessRepository,
        private readonly recordAuditLogUseCase: RecordAuditLogUseCase
    ) { }

    async execute(id: number, auditContext: { tenantId: number, userId?: number, ipAddress?: string, userAgent?: string }): Promise<void> {
        // Fetch the business state before deletion for audit logging
        const deletedBusiness = await this.businessRepository.findById(id);
        const deletedBusinessPrimitives = deletedBusiness ? deletedBusiness.toPrimitives() : null;

        await this.businessRepository.delete(id, auditContext.tenantId);

        // Record audit log
        const auditLogProps: AuditLogProps = {
            tenant_id: auditContext.tenantId,
            changed_by: auditContext.userId?.toString() || null,
            operation: 'DELETE',
            table_name: 'Business',
            record_id: id.toString(),
            old_values: (deletedBusinessPrimitives || null) as unknown as Record<string, unknown>,
            new_values: null,
        };
        await this.recordAuditLogUseCase.execute(auditLogProps);
    }
}
