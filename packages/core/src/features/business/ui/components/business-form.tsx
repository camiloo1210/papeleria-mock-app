'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { TaxId } from '@/features/shared/domain/value-objects/TaxId';
import { CurrencyCode } from '@/features/shared/domain/value-objects/CurrencyCode';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> currency (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { GetSupportedCurrenciesUseCase } from '@/features/currency/application/get-supported-currencies.use-case';
import { BusinessProps } from '@/features/business/domain/business.entity';

interface BusinessFormProps {
    initialData?: BusinessProps;
    onSubmit: (data: {
        legalName: string;
        tradeName: string;
        taxId: TaxId;
        taxpayerType: string;
        logoUrl: string;
        brandColor?: string;
        currency: CurrencyCode;
        // New fields for initial admin user
        first_name?: string;
        last_name?: string;
        email?: string;
        password?: string;
    }) => Promise<void>;
    isEditMode?: boolean;
    onDelete?: () => Promise<void>;
}

import { useBrandTheme } from '@/features/shared/theme/theme-provider';

export default function BusinessForm({ initialData, onSubmit, isEditMode = false, onDelete }: BusinessFormProps) {
    const { setBrandColor: setGlobalBrandColor } = useBrandTheme();
    const [legalName, setLegalName] = useState(initialData?.legalName || '');
    const [tradeName, setTradeName] = useState(initialData?.tradeName || '');

    // Fix: Handle both string (from toPrimitives) and ValueObject (if passed directly)
    const [taxId, setTaxId] = useState(
        typeof initialData?.taxId === 'string'
            ? initialData.taxId
            : initialData?.taxId?.getValue() || ''
    );

    const [taxpayerType, setTaxpayerType] = useState(initialData?.taxpayerType || '');
    const [logoUrl, setLogoUrl] = useState(initialData?.logoUrl || '');
    const [brandColor, setBrandColor] = useState(initialData?.brandColor || '#000000');

    // Fix: Handle both string and ValueObject for currency
    const [currency, setCurrency] = useState(
        typeof initialData?.currency === 'string'
            ? initialData.currency
            : initialData?.currency?.getValue() || 'USD'
    );

    const [supportedCurrencies, setSupportedCurrencies] = useState<CurrencyCode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // New state for initial admin user
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const fetchCurrencies = async () => {
            const getSupportedCurrenciesUseCase = new GetSupportedCurrenciesUseCase();
            const currencies = await getSupportedCurrenciesUseCase.execute();
            setSupportedCurrencies(currencies);
        };
        fetchCurrencies();
    }, []);

    // ... (handleSubmit start)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const dataToSubmit: Parameters<BusinessFormProps['onSubmit']>[0] = {
                // ...
                legalName,
                tradeName,
                taxId: TaxId.create(taxId),
                taxpayerType,
                logoUrl,
                brandColor,
                currency: CurrencyCode.create(currency),
            };

            if (!isEditMode) {
                // ...
                dataToSubmit.first_name = firstName;
                dataToSubmit.last_name = lastName;
                dataToSubmit.email = email;
                dataToSubmit.password = password;
            }

            await onSubmit(dataToSubmit);

            if (brandColor) {
                setGlobalBrandColor(brandColor);
            }

            router.push('/business'); // Redirect to business list after submission
        } catch (error) {
            console.error(error);
            // TODO: Show error message to user
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this business?')) {
            return;
        }
        setIsLoading(true);
        try {
            await onDelete?.();
            router.push('/business'); // Redirect to business list after deletion
        } catch (error) {
            console.error(error);
            // TODO: Show error message to user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>{isEditMode ? 'Edit Business' : 'Create New Business'}</CardTitle>
                <CardDescription>
                    {isEditMode ? 'Update the details of your business.' : 'Enter the details for your new business and the initial administrator.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="legalName">Legal Name</Label>
                        <Input
                            id="legalName"
                            type="text"
                            placeholder="Legal Name"
                            value={legalName}
                            onChange={(e) => setLegalName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="tradeName">Trade Name</Label>
                        <Input
                            id="tradeName"
                            type="text"
                            placeholder="Trade Name"
                            value={tradeName}
                            onChange={(e) => setTradeName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="taxId">Tax ID (RUC)</Label>
                        <Input
                            id="taxId"
                            type="text"
                            placeholder="Tax ID (RUC)"
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="taxpayerType">Taxpayer Type</Label>
                        <Input
                            id="taxpayerType"
                            type="text"
                            placeholder="Taxpayer Type"
                            value={taxpayerType}
                            onChange={(e) => setTaxpayerType(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="logoUrl">Logo URL</Label>
                            <Input
                                id="logoUrl"
                                type="text"
                                placeholder="Logo URL"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2 w-24">
                            <Label htmlFor="brandColor">Brand Color</Label>
                            <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden cursor-pointer relative">
                                <Input
                                    id="brandColor"
                                    type="color"
                                    className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 p-0 border-none cursor-pointer appearance-none bg-transparent"
                                    value={brandColor}
                                    onChange={(e) => setBrandColor(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger id="currency">
                                <SelectValue placeholder="Select a currency" />
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

                    {!isEditMode && (
                        <>
                            <h3 className="text-lg font-semibold mt-4">Administrator Details</h3>
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    placeholder="First Name"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    placeholder="Last Name"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Administrator Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Administrator Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (isEditMode ? 'Update Business' : 'Create Business')}
                    </Button>
                    {isEditMode && onDelete && (
                        <Button type="button" variant="destructive" className="w-full" onClick={handleDelete} disabled={isLoading}>
                            {isLoading ? 'Deleting...' : 'Delete Business'}
                        </Button>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}