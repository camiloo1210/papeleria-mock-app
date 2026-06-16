// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { MfaChallengeForm } from "@/features/auth/ui/mfa/MfaChallengeForm";

export default function MfaChallengePage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center">
            <MfaChallengeForm />
        </div>
    );
}
