'use client';

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface ErrorCardProps {
    title?: string;
    description?: string;
    retry?: () => void;
    home?: boolean;
}

export function ErrorCard({
    title = "Something went wrong",
    description = "We apologize for the inconvenience. An error has occurred while processing your request.",
    retry,
    home = true
}: ErrorCardProps) {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-[400px] w-full p-6">
            <Card className="max-w-[420px] w-full shadow-lg border-destructive/20">
                <CardHeader className="text-center">
                    <div className="mx-auto rounded-full bg-destructive/10 p-3 w-fit mb-4">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <CardTitle className="text-xl font-bold text-destructive">{title}</CardTitle>
                    <CardDescription className="text-center pt-2">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-sm text-muted-foreground">
                    <p>Our team has been notified of this issue.</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                    {retry && (
                        <Button onClick={retry} variant="outline" className="w-full sm:w-auto gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    )}
                    {home && (
                        <Button onClick={() => router.push('/')} variant="default" className="w-full sm:w-auto gap-2">
                            <Home className="h-4 w-4" />
                            Go Home
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
