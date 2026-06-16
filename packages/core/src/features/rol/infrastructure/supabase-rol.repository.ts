import { RolRepository } from "../domain/rol.repository";
export class SupabaseRolRepository implements RolRepository {
  constructor(private client?: any) {}
  [key: string]: any;
}
