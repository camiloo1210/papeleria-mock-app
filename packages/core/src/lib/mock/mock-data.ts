export type MockStore = Record<string, Record<string, unknown>[]>;

const MOCK_USER_UUID = 'mock-user-00000000-0000-0000-0000-000000000001';

export const MOCK_AUTH_USER = {
  id: MOCK_USER_UUID,
  email: 'demo@fiado.app',
  app_metadata: {
    provider: 'email',
    providers: ['email'],
    tenant_id: 1,
  },
  user_metadata: {},
  aud: 'authenticated',
  role: 'authenticated',
  factors: [],
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

const initialStore: MockStore = {
  'core:users': [
    {
      id: 1,
      uuid: MOCK_USER_UUID,
      tenant_id: 1,
      person_id: 1,
      theme_settings: {},
      created_at: '2024-01-01T00:00:00Z',
    },
  ],

  'core:business': [
    {
      id: 1,
      uuid: 'mock-biz-00000000-0000-0000-0000-000000000001',
      legal_name: 'Papelería El Estudiante S.A.S.',
      trade_name: 'Papelería El Estudiante',
      tax_id: '900123456-7',
      taxpayer_type: 'juridica',
      logo_url: '/mock/logo.png',
      brand_color: '#8b5cf6',
      timezone: 'America/Bogota',
      currency: 'USD',
      plan_id: 1,
      subscription_date: '2024-01-01T00:00:00Z',
      subscription_status: 'active',
      status: true,
      accepts_suppliers: true,
      country_id: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      // Pre-computed join result for findById query
      categories: [{ category: { slug: 'papeleria-general' } }],
    },
  ],

  'shared:country': [
    { id: 1, iso_code_2: 'CO', name: 'Colombia' },
    { id: 2, iso_code_2: 'US', name: 'United States' },
  ],

  'shared:person': [
    {
      id: 1,
      first_name: 'Carlos',
      last_name: 'Demostración',
      email: 'demo@fiado.app',
      phone_number: '+573001234567',
    },
  ],

  'core:product_categories': [
    { id: 1, uuid: 'cat-uuid-00000000-0000-0000-0000-000000000001', name: 'Cuadernos y Libretas', slug: 'cuadernos' },
    { id: 2, uuid: 'cat-uuid-00000000-0000-0000-0000-000000000002', name: 'Escritura', slug: 'escritura' },
    { id: 3, uuid: 'cat-uuid-00000000-0000-0000-0000-000000000003', name: 'Arte y Diseño', slug: 'arte' },
    { id: 4, uuid: 'cat-uuid-00000000-0000-0000-0000-000000000004', name: 'Oficina', slug: 'oficina' },
    { id: 5, uuid: 'cat-uuid-00000000-0000-0000-0000-000000000005', name: 'Papelería General', slug: 'papeleria' },
  ],

  'core:products': [
    {
      id: 1,
      uuid: 'prod-uuid-00000000-0000-0000-0000-000000000001',
      name: 'Cuaderno Norma 100 Hojas',
      price: 6.5,
      cost: 4.5,
      wholesale_price: 5.5,
      description: 'Cuaderno argollado tapa dura Norma, 100 hojas cuadriculadas',
      stock: 150,
      category_id: 1,
      expiration_date: null,
      status: 'active',
      sku: 'CUA-NOR100',
      tenant_id: 1,
      image_path: '/mock/cuaderno.png',
      is_active: true,
      is_deleted: false,
      has_variants: false,
      is_vat_exempt: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      uuid: 'prod-uuid-00000000-0000-0000-0000-000000000002',
      name: 'Bolígrafo Bic Cristal Azul',
      price: 1.2,
      cost: 0.8,
      wholesale_price: 1.0,
      description: 'Bolígrafo clásico Bic Cristal con tinta color azul, punta media',
      stock: 480,
      category_id: 2,
      expiration_date: null,
      status: 'active',
      sku: 'BOL-BIC-AZ',
      tenant_id: 1,
      image_path: '/mock/boligrafo.png',
      is_active: true,
      is_deleted: false,
      has_variants: false,
      is_vat_exempt: false,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 3,
      uuid: 'prod-uuid-00000000-0000-0000-0000-000000000003',
      name: 'Resma Papel Carta Reprograf',
      price: 22.0,
      cost: 16.5,
      wholesale_price: 18.5,
      description: 'Resma de papel tamaño carta 75g, paquete de 500 hojas',
      stock: 30,
      category_id: 4,
      expiration_date: null,
      status: 'active',
      sku: 'RES-REP-CAR',
      tenant_id: 1,
      image_path: '/mock/resma.png',
      is_active: true,
      is_deleted: false,
      has_variants: false,
      is_vat_exempt: true,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 4,
      uuid: 'prod-uuid-00000000-0000-0000-0000-000000000004',
      name: 'Caja Colores Prismacolor x12',
      price: 28.0,
      cost: 21.0,
      wholesale_price: 24.5,
      description: 'Caja de lápices de colores Prismacolor Premier, 12 unidades',
      stock: 0,
      category_id: 3,
      expiration_date: null,
      status: 'out_of_stock',
      sku: 'COL-PRI-12',
      tenant_id: 1,
      image_path: '/mock/colores.png',
      is_active: true,
      is_deleted: false,
      has_variants: false,
      is_vat_exempt: false,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 5,
      uuid: 'prod-uuid-00000000-0000-0000-0000-000000000005',
      name: 'Marcadores Sharpie x4',
      price: 18.5,
      cost: 13.0,
      wholesale_price: 15.5,
      description: 'Paquete de 4 marcadores permanentes Sharpie punta fina surtidos',
      stock: 60,
      category_id: 3,
      expiration_date: null,
      status: 'active',
      sku: 'MAR-SHA-4',
      tenant_id: 1,
      image_path: '/mock/marcadores.png',
      is_active: true,
      is_deleted: false,
      has_variants: false,
      is_vat_exempt: false,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 6,
      uuid: 'prod-uuid-00000000-0000-0000-0000-000000000006',
      name: 'Calculadora Científica',
      price: 85.0,
      cost: 62.0,
      wholesale_price: 75.0,
      description: 'Calculadora científica ideal para colegio y universidad, modelo estándar',
      stock: 33,
      category_id: 5,
      expiration_date: null,
      status: 'active',
      sku: 'CAL-CIEN',
      tenant_id: 1,
      image_path: '/mock/calculadora.png',
      is_active: true,
      is_deleted: false,
      has_variants: true,
      is_vat_exempt: false,
      created_at: '2024-01-01T00:00:00Z',
      variants: [
        { id: 1, product_id: 6, sku: 'CAL-CIEN-NEG', price: 85.0, cost: 62.0, stock: 10, attributes: { color: 'Negro' }, status: 'active', image_path: null },
        { id: 2, product_id: 6, sku: 'CAL-CIEN-GRI', price: 85.0, cost: 62.0, stock: 15, attributes: { color: 'Gris' }, status: 'active', image_path: null },
        { id: 3, product_id: 6, sku: 'CAL-CIEN-AZU', price: 85.0, cost: 62.0, stock: 8, attributes: { color: 'Azul' }, status: 'active', image_path: null },
      ],
    },
  ],

  'core:product_variants': [
    { id: 1, product_id: 6, sku: 'CAL-CIEN-NEG', price: 85.0, cost: 62.0, stock: 10, attributes: { color: 'Negro' }, status: 'active', image_path: null, tenant_id: 1 },
    { id: 2, product_id: 6, sku: 'CAL-CIEN-GRI', price: 85.0, cost: 62.0, stock: 15, attributes: { color: 'Gris' }, status: 'active', image_path: null, tenant_id: 1 },
    { id: 3, product_id: 6, sku: 'CAL-CIEN-AZU', price: 85.0, cost: 62.0, stock: 8, attributes: { color: 'Azul' }, status: 'active', image_path: null, tenant_id: 1 },
  ],

  'core:business_categories': [
    { id: 1, name: 'Tienda General', slug: 'tienda-general', description: 'Tiendas de barrio y similares', created_at: '2024-01-01T00:00:00Z' },
    { id: 2, name: 'Supermercado', slug: 'supermercado', description: 'Supermercados y grandes superficies', created_at: '2024-01-01T00:00:00Z' },
    { id: 3, name: 'Farmacia', slug: 'farmacia', description: 'Droguerías y farmacias', created_at: '2024-01-01T00:00:00Z' },
    { id: 4, name: 'Restaurante', slug: 'restaurante', description: 'Restaurantes y comida preparada', created_at: '2024-01-01T00:00:00Z' },
    { id: 5, name: 'Ropa y Calzado', slug: 'ropa-calzado', description: 'Almacenes de ropa y calzado', created_at: '2024-01-01T00:00:00Z' },
  ],

  'core:business_category_links': [
    { id: 1, business_id: 1, category_id: 1 },
  ],

  'core:business_ratings': [
    {
      id: 1,
      target_business_id: 1,
      rating: 5,
      comment: 'Excelente servicio y gran variedad de productos',
      author_type: 'USER',
      author_business_id: null,
      author_user_id: MOCK_USER_UUID,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      target_business_id: 1,
      rating: 4,
      comment: 'Muy buena atención, precios justos',
      author_type: 'USER',
      author_business_id: null,
      author_user_id: 'other-user-uuid',
      created_at: '2024-02-01T00:00:00Z',
    },
  ],

  'core:business_relationships': [
    {
      id: 1,
      requester_business_id: 1,
      target_business_id: 2,
      status: 'ACCEPTED',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],

  'core:branch': [
    { id: 1, name: 'Sede Principal', tenant_id: 1, address: 'Calle 1 # 1-1', is_active: true },
    { id: 2, name: 'Sucursal Norte', tenant_id: 1, address: 'Carrera 7 # 12-34', is_active: true },
  ],

  'core:seasons': [
    { id: 1, name: 'Temporada Escolar', tenant_id: 1, start_date: '2024-01-15T00:00:00Z', end_date: '2024-03-15T00:00:00Z' },
    { id: 2, name: 'Fin de Año Oficina', tenant_id: 1, start_date: '2024-11-01T00:00:00Z', end_date: '2024-12-31T00:00:00Z' },
  ],

  'core:product_seasons': [
    { id: 1, season_id: 1, product_id: 1 },
    { id: 2, season_id: 1, product_id: 2 },
    { id: 3, season_id: 1, product_id: 4 },
    { id: 4, season_id: 2, product_id: 2 },
    { id: 5, season_id: 2, product_id: 3 },
    { id: 6, season_id: 2, product_id: 5 },
  ],

  'core:inventory_logs': (() => {
    const logs = [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    // Generate sales logs over the last 30 days
    let logId = 1;
    for (let d = 1; d <= 30; d++) {
      for (let prodId = 1; prodId <= 6; prodId++) {
        const qty = Math.floor(Math.random() * 5) + 1;
        logs.push({
          id: logId++,
          tenant_id: 1,
          product_id: prodId,
          change_amount: -qty,
          reason: 'SALE',
          created_at: new Date(now - d * day).toISOString()
        });
      }
    }
    return logs;
  })(),

  'core:orders': (() => {
    const orders = [];
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    
    // We want to generate orders spanning 90 days to populate the sales history
    // For cohorts:
    // Clients: 1, 2, 3, 4
    // Client 1 joined 75 days ago (Month -3)
    // Client 2 joined 45 days ago (Month -2)
    // Client 3 joined 15 days ago (Month -1)
    
    for (let i = 1; i <= 90; i++) {
      let clientId = null;
      if (i % 5 === 0) clientId = 1;
      else if (i % 5 === 1) clientId = 2;
      else if (i % 5 === 2) clientId = 3;
      else if (i % 5 === 3) clientId = 4;

      orders.push({
        id: i,
        tenant_id: 1,
        total: 10 + (i % 15) * 5.5,
        status: 'completed',
        branch_id: (i % 2) + 1,
        client_id: clientId,
        created_at: new Date(now - i * (day * 0.95)).toISOString()
      });
    }
    return orders;
  })(),

  'core:order_items': (() => {
    const items = [];
    let itemId = 1;
    // Generate order items for the 90 orders
    for (let orderId = 1; orderId <= 90; orderId++) {
      // 1 to 3 items per order
      const itemCount = (orderId % 3) + 1;
      for (let i = 0; i < itemCount; i++) {
        const productId = ((orderId + i) % 6) + 1;
        const qty = (orderId % 4) + 1;
        const prices = [0, 6.5, 1.2, 22.0, 28.0, 18.5, 85.0];
        const price = prices[productId] || 10.0;
        items.push({
          id: itemId++,
          order_id: orderId,
          product_id: productId,
          quantity: qty,
          unit_price: price,
          line_total: qty * price
        });
      }
    }
    return items;
  })(),

  'core:employees': [
    { id: 1, user_id: 1, tenant_id: 1, role_id: 1, branch_id: 1, is_active: true, created_at: '2024-01-01T00:00:00Z' },
  ],

  'core:roles': [
    { id: 1, name: 'OWNER', description: 'Propietario del negocio', tenant_id: 1 },
    { id: 2, name: 'MANAGER', description: 'Gerente de sucursal', tenant_id: 1 },
    { id: 3, name: 'CASHIER', description: 'Cajero', tenant_id: 1 },
  ],

  'core:permissions': [
    { id: 1, slug: 'products:read', name: 'Ver productos' },
    { id: 2, slug: 'products:write', name: 'Crear/editar productos' },
    { id: 3, slug: 'products:delete', name: 'Eliminar productos' },
    { id: 4, slug: 'orders:read', name: 'Ver pedidos' },
    { id: 5, slug: 'orders:write', name: 'Crear pedidos' },
    { id: 6, slug: 'business:read', name: 'Ver negocio' },
    { id: 7, slug: 'business:write', name: 'Editar negocio' },
    { id: 8, slug: 'employees:read', name: 'Ver empleados' },
    { id: 9, slug: 'bi:read', name: 'Ver dashboard BI' },
    { id: 10, slug: 'relationships:read', name: 'Ver relaciones' },
    { id: 11, slug: 'relationships:write', name: 'Gestionar relaciones' },
  ],

  'core:role_permissions': [
    { role_id: 1, permission_id: 1 }, { role_id: 1, permission_id: 2 }, { role_id: 1, permission_id: 3 },
    { role_id: 1, permission_id: 4 }, { role_id: 1, permission_id: 5 }, { role_id: 1, permission_id: 6 },
    { role_id: 1, permission_id: 7 }, { role_id: 1, permission_id: 8 }, { role_id: 1, permission_id: 9 },
    { role_id: 1, permission_id: 10 }, { role_id: 1, permission_id: 11 },
  ],
};

// Module-level mutable store (persists between requests in dev mode)
let _store: MockStore | null = null;

export function getMockStore(): MockStore {
  // Always initialize fresh to avoid HMR caching old data
  _store = JSON.parse(JSON.stringify(initialStore)) as MockStore;
  return _store;
}

export function resetMockStore(): void {
  _store = null;
}
