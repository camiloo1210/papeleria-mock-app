export enum Permission {
    // Products
    PRODUCTS_VIEW = 'products:view',
    PRODUCTS_CREATE = 'products:create',
    PRODUCTS_EDIT = 'products:edit',
    PRODUCTS_DELETE = 'products:delete',

    // Sales
    SALES_VIEW = 'sales:view',
    SALES_CREATE = 'sales:create',

    // Clients
    CLIENTS_VIEW = 'clients:view',
    CLIENTS_CREATE = 'clients:create',
    CLIENTS_EDIT = 'clients:edit',

    // Employees & Roles (Admin)
    EMPLOYEES_VIEW = 'employees:view',
    EMPLOYEES_MANAGE = 'employees:manage',
    ROLES_MANAGE = 'roles:manage',

    // Dashboard
    DASHBOARD_VIEW = 'dashboard:view',
    BI_VIEW = 'bi:view',
}

export const PERMISSIONS_LIST = Object.values(Permission);
