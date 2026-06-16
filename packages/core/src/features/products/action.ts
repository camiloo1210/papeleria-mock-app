'use server'
import { IProductRepository } from "./domain/product.repository";
import { SupabaseProductRepository } from "./infrastructure/supabase-product.repository";
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { CreateProductInput, createProductUseCase } from "./application/create-product.use-case";
import { updateProductUseCase, UpdateProductData } from "./application/update-product.use-case";
import { archiveProductUseCase, ArchiveProductInput } from "./application/archive-product.use-case";
import { z } from 'zod';
import { ProductStatus } from "./domain/product.entity";

const CreateProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  price: z.coerce
    .number()
    .nonnegative("El precio debe ser un número positivo."), // Changed gt(0) to nonnegative to allow 0 for parents with variants
  cost: z.coerce
    .number()
    .nonnegative("El costo no puede ser negativo."),
  wholesalePrice: z.coerce
    .number()
    .nonnegative("El precio mayorista no puede ser negativo.")
    .optional()
    .default(0),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres."),
  stock: z.coerce
    .number()
    .int("El stock debe ser un número entero.")
    .nonnegative("El stock no puede ser negativo."),
  categoryId: z.string().uuid("La categoría seleccionada no es válida."),
  expirationDate: z.coerce.date().optional(),
  imagePath: z.string().optional(),
  hasVariants: z.string().transform(val => val === 'true').optional(), // FormData sends strings
  isVatExempt: z.string().transform(val => val === 'true').optional(),
})

export type CreateActionState = {
  message?: string | null;
  errors?: {
    [key: string]: string[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fieldValues?: any; // To preserve state on error if needed
};

export async function createProductAction(
  formData: FormData
): Promise<CreateActionState> {
  const supabase = await createClient()
  const productRepository: IProductRepository = new SupabaseProductRepository(supabase)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { message: "Acción no autorizada. Por favor, inicie sesión." }
  }

  // Fetch tenant_id from core.users
  const { data: userData, error: userError } = await supabase
    .schema('core')
    .from('users')
    .select('tenant_id')
    .eq('uuid', user.id)
    .single();

  if (userError || !userData) {
    return { message: "No se pudo obtener la información del usuario." };
  }

  const formDataObj = Object.fromEntries(formData.entries())

  const data = {
    ...formDataObj,
    price: formDataObj.price ? Number(formDataObj.price) : 0, // Fallback if empty/variant parent
    cost: formDataObj.cost ? Number(formDataObj.cost) : 0,
    stock: formDataObj.stock ? Number(formDataObj.stock) : 0,
    wholesalePrice: formDataObj.wholesalePrice ? Number(formDataObj.wholesalePrice) : 0,
  }

  const validatedFields = CreateProductSchema.safeParse(data)

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'La validación falló. Por favor, corrija los campos marcados.',
    }
  }

  // Generate SKU
  const sku = `${validatedFields.data.name.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const seasonIds = formData.getAll('seasonIds') as string[];

  // Parse variants
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let variants: any[] = [];
  try {
    const variantsJson = formData.get('variants') as string;
    if (variantsJson) {
      variants = JSON.parse(variantsJson);
    }
  } catch (e) {
    console.error("Error parsing variants", e);
  }

  const input: CreateProductInput = {
    id: crypto.randomUUID(),
    ...validatedFields.data,
    sku: sku,
    tenantId: userData.tenant_id,
    seasonIds: seasonIds,
    imagePath: formData.get('imagePath') as string | undefined,
    hasVariants: validatedFields.data.hasVariants,
    variants: variants,
    isVatExempt: validatedFields.data.isVatExempt,
    wholesalePrice: validatedFields.data.wholesalePrice || 0,
  }

  try {
    await createProductUseCase(input, productRepository)
  } catch (error) {
    console.error("Error al crear el producto:", error)
    return { message: error instanceof Error ? error.message : "Ocurrió un error inesperado al guardar el producto." }
  }

  revalidatePath('/products')
  redirect('/products')
}

export async function updateProductAction(formData: FormData) {
  const supabase = await createClient();
  const productRepository: IProductRepository = new SupabaseProductRepository(supabase);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const seasonIds = formData.getAll('seasonIds') as string[];

  // Parse variants
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let variants: any[] | undefined = undefined;
  try {
    const variantsJson = formData.get('variants') as string;
    if (variantsJson) {
      variants = JSON.parse(variantsJson);
    }
  } catch (e) {
    console.error("Error parsing variants", e);
  }

  const hasVariantsStr = formData.get('hasVariants') as string;
  const hasVariants = hasVariantsStr === 'true';

  const isVatExemptStr = formData.get('isVatExempt') as string;
  const isVatExempt = isVatExemptStr === 'true';

  const rawData = {
    id: formData.get('id') as string,
    name: formData.get('name') as string,
    price: Number(formData.get('price')),
    cost: Number(formData.get('cost')),
    wholesalePrice: Number(formData.get('wholesalePrice') || 0),
    description: formData.get('description') as string,
    stock: Number(formData.get('stock')),
    categoryId: formData.get('categoryId') as string,
    expirationDate: formData.get('expirationDate') ? new Date(formData.get('expirationDate') as string) : undefined,
    status: formData.get('status') as ProductStatus,
    seasonIds: seasonIds,
    imagePath: formData.has('imagePath')
      ? (formData.get('imagePath') === "" ? null : formData.get('imagePath') as string)
      : undefined,
    hasVariants: hasVariants,
    variants: variants,
    isVatExempt: isVatExempt
  }

  const input: UpdateProductData = rawData;

  try {
    await updateProductUseCase(productRepository, { id: rawData.id, data: input });
    revalidatePath('/products');
    redirect('/products');

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function archiveProductAction(formData: FormData) {
  const supabase = await createClient();
  const productRepository: IProductRepository = new SupabaseProductRepository(supabase);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  const rawData = {
    id: formData.get('id') as string,
  }
  const input: ArchiveProductInput = rawData;

  try {
    await archiveProductUseCase(productRepository, input);
    revalidatePath('/products');
    redirect('/products');
  } catch (error) {
    console.error(error);
    throw error;
  }
}