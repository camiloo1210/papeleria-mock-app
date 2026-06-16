// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { ForgotPasswordForm } from "@/features/auth/ui/components/forgot-password-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
