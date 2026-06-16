'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/ui/image-upload';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { TaxId } from '@/features/shared/domain/value-objects/TaxId';
import { CurrencyCode } from '@/features/shared/domain/value-objects/CurrencyCode';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> currency (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { GetSupportedCurrenciesUseCase } from '@/features/currency/application/get-supported-currencies.use-case';
import { useBrandTheme } from '@/features/shared/theme/theme-provider';

interface BusinessEditFormProps {
    initialData: {
        id?: number;
        legalName: string;
        tradeName: string;
        taxId: TaxId | string;
        taxpayerType: string;
        logoUrl: string;
        brandColor?: string;
        currency?: CurrencyCode | string;
        timezone?: string;
        status?: boolean;
        subscriptionStatus?: string;
        planId?: number;
        acceptsSuppliers?: boolean;
        categories?: string[];
    };
    availableCategories: {
        id: number;
        name: string;
        slug: string;
    }[];
    onSubmit: (data: {
        legalName: string;
        tradeName: string;
        taxId: TaxId;
        taxpayerType: string;
        logoUrl: string;
        brandColor?: string;
        currency: CurrencyCode;
        timezone?: string;
        planId?: number;
        status?: boolean;
        subscriptionStatus?: string;
        acceptsSuppliers?: boolean;
        categories?: string[];
    }) => Promise<void>;
    onDelete?: () => Promise<void>;
}

const COMMON_TIMEZONES = [
    "America/Guayaquil",
    "America/Bogota",
    "America/Lima",
    "America/New_York",
    "UTC"
];

const SUBSCRIPTION_STATUSES = [
    { value: 'active', label: 'Activo', color: 'bg-green-100 text-green-800' },
    { value: 'suspended', label: 'Suspendido', color: 'bg-orange-100 text-orange-800' },
    { value: 'cancelled', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
    { value: 'trial', label: 'Prueba', color: 'bg-blue-100 text-blue-800' },
];

const TAXPAYER_TYPES = [
    "RIMPE Negocio Popular",
    "RIMPE Emprendedor",
    "Régimen General"
];

export default function BusinessEditForm({ initialData, onSubmit, onDelete, availableCategories }: BusinessEditFormProps) {
    const { setBrandColor: setGlobalBrandColor } = useBrandTheme();

    // State
    const [legalName, setLegalName] = useState(initialData.legalName || '');
    const [tradeName, setTradeName] = useState(initialData.tradeName || '');
    const [taxId, setTaxId] = useState(
        typeof initialData.taxId === 'string'
            ? initialData.taxId
            : initialData.taxId?.getValue() || ''
    );
    const [taxpayerType, setTaxpayerType] = useState(initialData.taxpayerType || 'Régimen General');
    const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || '');
    const [brandColor, setBrandColor] = useState(initialData.brandColor || '#000000');
    const [timezone, setTimezone] = useState(initialData.timezone || 'America/Guayaquil');
    const [currency, setCurrency] = useState(
        typeof initialData.currency === 'string'
            ? initialData.currency
            : initialData.currency?.getValue() || 'USD'
    );
    const [planId] = useState(initialData.planId || 1);
    const [status, setStatus] = useState(initialData.status ?? true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(initialData.subscriptionStatus || 'active');
    const [acceptsSuppliers, setAcceptsSuppliers] = useState(initialData.acceptsSuppliers ?? false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData.categories || []);

    const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyCode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchCurrencies = async () => {
            const getSupportedCurrenciesUseCase = new GetSupportedCurrenciesUseCase();
            const currencies = await getSupportedCurrenciesUseCase.execute();
            setSupportedCurrencies(currencies);
        };
        fetchCurrencies();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const dataToSubmit = {
                legalName,
                tradeName,
                taxId: TaxId.create(taxId),
                taxpayerType,
                logoUrl,
                brandColor,
                currency: CurrencyCode.create(currency),
                timezone,
                planId,
                status,
                subscriptionStatus,
                acceptsSuppliers,
                categories: selectedCategories
            };

            await onSubmit(dataToSubmit);

            if (brandColor) {
                setGlobalBrandColor(brandColor);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Esta seguro que desea eliminar este negocio? Esta acción no se puede deshacer.')) {
            return;
        }
        setIsLoading(true);
        try {
            await onDelete?.();
            router.push('/business');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">

            {/* Header / Actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Editar Negocio</h1>
                    <p className="text-muted-foreground">Administra la configuración y el estado de tu empresa.</p>
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Información Principal */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Información Legal y Comercial</CardTitle>
                        <CardDescription>Datos básicos de identificación del negocio ante el SRI y clientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="legalName">Razón Social</Label>
                            <Input
                                id="legalName"
                                value={legalName}
                                onChange={(e) => setLegalName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="tradeName">Nombre Comercial</Label>
                            <Input
                                id="tradeName"
                                value={tradeName}
                                onChange={(e) => setTradeName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="taxId">RUC (13 dígitos)</Label>
                            <Input
                                id="taxId"
                                value={taxId}
                                onChange={(e) => setTaxId(e.target.value)}
                                minLength={13}
                                maxLength={13}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="taxpayerType">Tipo de Contribuyente</Label>
                            <Select value={taxpayerType} onValueChange={setTaxpayerType}>
                                <SelectTrigger id="taxpayerType">
                                    <SelectValue placeholder="Seleccione tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TAXPAYER_TYPES.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Configuración Regional & Branding */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración Regional</CardTitle>
                        <CardDescription>Moneda, Zona Horaria y Branding.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Moneda</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger id="currency">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {supportedCurrencies.map((curr) => (
                                        <SelectItem key={curr.getValue()} value={curr.getValue()}>
                                            {curr.getValue()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="timezone">Zona Horaria</Label>
                            <Select value={timezone} onValueChange={setTimezone}>
                                <SelectTrigger id="timezone">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {COMMON_TIMEZONES.map((tz) => (
                                        <SelectItem key={tz} value={tz}>
                                            {tz}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="brandColor">Color de Marca</Label>
                            <div className="flex gap-2 items-center">
                                <div className="relative w-10 h-10 overflow-hidden rounded-full border shadow-sm">
                                    <Input
                                        id="brandColor"
                                        type="color"
                                        className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 p-0 border-none cursor-pointer"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                    />
                                </div>
                                <Input
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="w-28 font-mono"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Logo</Label>
                            <ImageUpload
                                tenantId={initialData.id!}
                                defaultPreviewUrl={logoUrl}
                                onChange={(path: string) => {
                                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                                    const baseUrl = supabaseUrl?.replace(/\/$/, '');
                                    const fullUrl = `${baseUrl}/storage/v1/object/public/business/${path}`;
                                    setLogoUrl(fullUrl);
                                }}
                                onRemove={() => setLogoUrl('')}
                                bucketName="business"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 3. Estado de la Cuenta */}
                <Card>
                    <CardHeader>
                        <CardTitle>Estado de la Cuenta</CardTitle>
                        <CardDescription>Plan de suscripción y acceso.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center justify-between border p-3 rounded-lg">
                            <div className="grid gap-0.5">
                                <Label className="text-base">Estado del Negocio</Label>
                                <p className="text-sm text-muted-foreground">
                                    {status ? 'El negocio está activo y accesible.' : 'El negocio está desactivado.'}
                                </p>
                            </div>
                            <Switch
                                checked={status}
                                onCheckedChange={setStatus}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Suscripción</Label>
                            <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SUBSCRIPTION_STATUSES.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={status.color}>{status.label}</Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Plan Actual</Label>
                            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                                <span className="font-semibold">{planId === 1 ? 'Free Tier' : `Plan Enterprise (${planId})`}</span>
                            </div>
                        </div>

                        <Separator className="my-2" />

                        <div className="pt-2">
                            <Button
                                type="button"
                                variant="destructive"
                                className="w-full"
                                onClick={handleDelete}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Eliminando...' : 'Eliminar Negocio Permanentemente'}
                            </Button>
                        </div>

                    </CardContent>
                </Card>

                {/* 4. Marketplace B2B */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Marketplace B2B</CardTitle>
                        <CardDescription>Controla cómo otros negocios pueden interactuar contigo como proveedor.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="grid gap-1 pr-4">
                                <Label className="text-base font-medium">Aceptar solicitudes de proveedor</Label>
                                <p className="text-sm text-muted-foreground">
                                    Permite que otros negocios te contacten como proveedor y compren tu catálogo al por mayor.
                                    Tu perfil seguirá visible en el marketplace, pero el botón de contacto estará deshabilitado si esta opción está apagada.
                                </p>
                            </div>
                            <Switch
                                checked={acceptsSuppliers}
                                onCheckedChange={setAcceptsSuppliers}
                            />
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3">
                            <Label>Categorías del Negocio</Label>
                            <p className="text-sm text-muted-foreground">
                                Selecciona las categorías que mejor describan tu negocio para aparecer en los filtros del marketplace.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {availableCategories?.map((category) => (
                                    <div key={category.id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`category-${category.id}`}
                                            value={category.slug}
                                            checked={selectedCategories.includes(category.slug)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, category.slug]);
                                                } else {
                                                    setSelectedCategories(selectedCategories.filter(slug => slug !== category.slug));
                                                }
                                            }}
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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}
