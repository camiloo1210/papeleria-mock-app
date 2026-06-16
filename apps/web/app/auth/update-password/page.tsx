// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { UpdatePasswordForm } from "@/features/auth/ui/components/update-password-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
