import { Employee } from "./employee.entity";
export interface EmployeeRepository {
  findById?(id: number): Promise<Employee | null>;
  findByAuthUserId?(id: string): Promise<Employee | null>;
  findByUserId?(id: string | number, tenantId?: number): Promise<Employee | null>;
  save?(employee: Employee): Promise<Employee>;
}
