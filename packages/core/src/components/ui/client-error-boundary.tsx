'use client';

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ClientErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-gray-900">
                    <div className="rounded-lg border border-red-200 bg-white p-8 shadow-xl dark:border-red-900 dark:bg-gray-800 max-w-lg w-full">
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                            Application Error
                        </h1>
                        <p className="mb-6 text-gray-600 dark:text-gray-300">
                            Algo salió mal en el cliente (navegador).
                        </p>
                        <div className="mb-6 overflow-auto rounded bg-gray-100 p-4 text-left text-xs font-mono text-red-600 dark:bg-gray-950 dark:text-red-400 max-h-48 break-words whitespace-pre-wrap">
                            {this.state.error?.toString()}
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={() => window.location.reload()}
                                className=""
                            >
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Recargar Página
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    // Clear storage attempt
                                    sessionStorage.clear();
                                    localStorage.removeItem('theme-preference');
                                    window.location.reload();
                                }}
                            >
                                Limpiar y Recargar
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
