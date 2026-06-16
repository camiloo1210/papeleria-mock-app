import { getProfileAction } from "@/features/marketplace/actions/profile.action";
import { ProfileForm } from "@/features/marketplace/ui/profile-form";
import { UserCheck } from "lucide-react";

export default async function ProfilePage() {
    const { success, data, message } = await getProfileAction();

    if (!success || !data) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
                    <UserCheck className="h-8 w-8 mx-auto mb-2" />
                    <h2 className="text-lg font-bold">Error al cargar perfil</h2>
                    <p>{message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Configuración de Cuenta</h1>
                <p className="text-gray-500">Gestiona tu información personal y preferencias.</p>
            </div>

            <ProfileForm initialData={data} />
        </div>
    );
}
