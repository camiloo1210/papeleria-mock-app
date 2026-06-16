'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useFormState, useFormStatus } from "react-dom";
import { updateBusinessProfileAction } from "@/features/business/actions/update-business-profile.action";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Store, Palette } from "lucide-react";

interface Props {
    business: {
        id: number;
        tradeName: string;
        brandColor: string;
        logoUrl?: string | null;
        categoryIds: number[];
    };
    availableCategories: {
        id: number;
        name: string;
    }[];
}

const initialState = {
    success: false,
    message: null,
    error: null
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
            {pending ? "Guardando..." : "Guardar Cambios"}
        </Button>
    );
}

export function BusinessProfileForm({ business, availableCategories }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [state, formAction] = useFormState(updateBusinessProfileAction as any, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.success) {
            toast({
                title: "Perfil Actualizado",
                description: "Los cambios se han guardado correctamente.",
                variant: "default",
            });
        } else if (state?.error) {
            toast({
                title: "Error",
                description: state.error,
                variant: "destructive",
            });
        }
    }, [state, toast]);

    return (
        <form action={formAction}>
            <input type="hidden" name="businessId" value={business.id} />

            <Card>
                <CardHeader>
                    <CardTitle>Información Pública</CardTitle>
                    <CardDescription>
                        Estos datos serán visibles para todos los usuarios en el Marketplace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    <div className="space-y-2">
                        <Label htmlFor="tradeName">Nombre Comercial</Label>
                        <div className="relative">
                            <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="tradeName"
                                name="tradeName"
                                defaultValue={business.tradeName}
                                className="pl-9"
                                placeholder="Ej. Mi Tienda"
                                required
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">El nombre que verán tus clientes.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandColor">Color de Marca</Label>
                        <div className="flex gap-4 items-center">
                            <div className="relative flex-1">
                                <Palette className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="brandColor"
                                    name="brandColor"
                                    defaultValue={business.brandColor || '#4f46e5'}
                                    className="pl-9"
                                    placeholder="#000000"
                                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                                    required
                                />
                            </div>
                            <input
                                type="color"
                                className="h-10 w-10 p-1 rounded border cursor-pointer"
                                defaultValue={business.brandColor || '#4f46e5'}
                                onChange={(e) => {
                                    const input = document.getElementById('brandColor') as HTMLInputElement;
                                    if (input) input.value = e.target.value;
                                }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Color principal para tu perfil.</p>
                    </div>

                    <div className="space-y-3">
                        <Label>Categorías del Negocio</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {availableCategories.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`category-${category.id}`}
                                        name="categories"
                                        value={category.id}
                                        defaultChecked={business.categoryIds.includes(category.id)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                    />
                                    <Label
                                        htmlFor={`category-${category.id}`}
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        {category.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Selecciona las categorías que mejor describan tu negocio.</p>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    );
}
