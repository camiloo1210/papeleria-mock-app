'use client';

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateProfileAction, ProfileFormValues } from "@/features/marketplace/actions/profile.action";
import { toast } from "sonner"; // Assuming sonner or useToast
import { Loader2 } from "lucide-react";

// Schema (Matching Action)
const profileSchema = z.object({
    firstName: z.string().min(2, "El nombre es muy corto"),
    lastName: z.string().min(2, "El apellido es muy corto"),
    gender: z.enum(["Male", "Female", "Prefer not to say"]),
    birthDate: z.string().optional(),
});

interface ProfileFormProps {
    initialData: {
        firstName: string;
        lastName: string;
        email: string;
        nationalId: string;
        gender: string;
        birthDate: string;
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: initialData.firstName,
            lastName: initialData.lastName,
            gender: initialData.gender as "Male" | "Female" | "Prefer not to say",
            birthDate: initialData.birthDate,
        },
    });

    function onSubmit(data: ProfileFormValues) {
        startTransition(async () => {
            const result = await updateProfileAction(data);
            if (result.success) {
                toast.success(result.message);
            } else {
                toast.error(result.message);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu apellido" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                            <Input value={initialData.email} disabled className="bg-gray-50" />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">No puedes cambiar tu email.</p>
                    </FormItem>

                    <FormItem>
                        <FormLabel>Cédula / ID</FormLabel>
                        <FormControl>
                            <Input value={initialData.nationalId} disabled className="bg-gray-50" />
                        </FormControl>
                    </FormItem>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Género</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Male">Masculino</SelectItem>
                                        <SelectItem value="Female">Femenino</SelectItem>
                                        <SelectItem value="Prefer not to say">Prefiero no decir</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fecha de Nacimiento</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>

            </form>
        </Form>
    );
}
