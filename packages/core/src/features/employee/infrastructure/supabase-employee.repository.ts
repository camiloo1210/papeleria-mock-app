import { EmployeeRepository } from "../domain/employee.repository";
import { Employee } from "../domain/employee.entity";

export class SupabaseEmployeeRepository implements EmployeeRepository {
  constructor(private client?: any) {}
  
  async findById(id: number): Promise<Employee | null> {
    return null;
  }
  
  async findByAuthUserId(id: string): Promise<Employee | null> {
    return null;
  }

  async findByUserId(id: string | number, tenantId?: number): Promise<Employee | null> {
    return null;
  }

  async save(employee: Employee): Promise<Employee> {
    return employee;
  }

  // Fallback for any other methods that might be called
  [key: string]: any;
}
