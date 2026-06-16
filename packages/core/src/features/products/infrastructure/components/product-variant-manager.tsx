"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, RefreshCw, X, AlertCircle } from "lucide-react"
import { ProductVariantPrimitives } from "@/features/products/domain/product-variant.entity"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

import { ImageUpload } from "@/components/ui/image-upload"; // Import

interface ProductVariantManagerProps {
    value?: ProductVariantPrimitives[];
    onChange: (variants: ProductVariantPrimitives[]) => void;
    basePrice: string;
    baseCost: string;
    baseSku: string;
    tenantId: number; // Added
}

interface AttributeDef {
    name: string;
    values: string[]; // e.g., ["S", "M", "L"]
}

export function ProductVariantManager({ value = [], onChange, basePrice, baseCost, baseSku, tenantId }: ProductVariantManagerProps) {
    const { toast } = useToast();
    const [attributes, setAttributes] = useState<AttributeDef[]>([]);
    const [variants, setVariants] = useState<ProductVariantPrimitives[]>(value);

    // Temp inputs for adding attribute
    const [newAttrName, setNewAttrName] = useState("");
    // const [newAttrValue, setNewAttrValue] = useState("");

    // Reverse Engineering: Restore attributes from existing variants on mount
    useEffect(() => {
        if (value.length > 0 && attributes.length === 0) {
            const restoredAttrs: Record<string, Set<string>> = {};

            value.forEach(v => {
                Object.entries(v.attributes).forEach(([key, val]) => {
                    if (!restoredAttrs[key]) {
                        restoredAttrs[key] = new Set();
                    }
                    restoredAttrs[key].add(val);
                });
            });

            const attrsArray: AttributeDef[] = Object.entries(restoredAttrs).map(([name, valuesSet]) => ({
                name,
                values: Array.from(valuesSet)
            }));

            if (attrsArray.length > 0) {
                setAttributes(attrsArray);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount


    const addAttribute = () => {
        if (!newAttrName) return;
        setAttributes([...attributes, { name: newAttrName, values: [] }]);
        setNewAttrName("");
    };

    const removeAttribute = (index: number) => {
        const newAttrs = [...attributes];
        newAttrs.splice(index, 1);
        setAttributes(newAttrs);
    };

    const addValueToAttribute = (attrIndex: number, val: string) => {
        if (!val) return;
        const newAttrs = [...attributes];
        if (!newAttrs[attrIndex].values.includes(val)) {
            newAttrs[attrIndex].values.push(val);
        }
        setAttributes(newAttrs);
    };

    const removeValueFromAttribute = (attrIndex: number, valIndex: number) => {
        const newAttrs = [...attributes];
        newAttrs[attrIndex].values.splice(valIndex, 1);
        setAttributes(newAttrs);
    };

    const generateVariants = () => {
        if (attributes.length === 0) return;

        const cartesian = (args: string[][]): string[][] => {
            const r: string[][] = [];
            const max = args.length - 1;
            function helper(arr: string[], i: number) {
                for (let j = 0, l = args[i].length; j < l; j++) {
                    const a = arr.slice(0); // clone arr
                    a.push(args[i][j]);
                    if (i === max)
                        r.push(a);
                    else
                        helper(a, i + 1);
                }
            }
            helper([], 0);
            return r;
        };

        const values = attributes.map(a => a.values);
        if (values.some(v => v.length === 0)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Asegúrate de que todos los atributos tengan al menos un valor."
            });
            return;
        }

        const combinations = cartesian(values);

        const newVariants: ProductVariantPrimitives[] = combinations.map((combination) => {
            const variantAttrs: Record<string, string> = {};
            let suffix = "";
            combination.forEach((val, i) => {
                variantAttrs[attributes[i].name] = val;
                suffix += `-${val}`;
            });

            // Smart Merge: Find existing variant with SAME attributes
            const existing = variants.find(v => {
                const vAttrs = v.attributes;
                if (Object.keys(vAttrs).length !== Object.keys(variantAttrs).length) return false;
                return Object.entries(variantAttrs).every(([k, val]) => vAttrs[k] === val);
            });

            if (existing) {
                return existing; // Keep existing ID, stock, price, etc.
            }

            // Create new
            return {
                id: "", // New variant
                product_id: "",
                sku: `${baseSku}${suffix}`.toUpperCase(),
                price: Number(basePrice) || 0,
                cost: Number(baseCost) || 0,
                stock: 0,
                attributes: variantAttrs,
                status: 'active',
                image_path: null
            };
        });

        setVariants(newVariants);
        onChange(newVariants);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateVariant = (index: number, field: keyof ProductVariantPrimitives, val: any) => {
        const newVars = [...variants];
        newVars[index] = { ...newVars[index], [field]: val };
        setVariants(newVars);
        onChange(newVars);
    };

    const removeVariant = (index: number) => {
        const newVars = [...variants];
        newVars.splice(index, 1);
        setVariants(newVars);
        onChange(newVars);
    };

    return (
        <div className="space-y-6">
            <Card className="border-muted/60 shadow-sm">
                <CardHeader className="bg-muted/5 border-b pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary" />
                        Configurador de Matriz
                    </CardTitle>
                    <CardDescription>
                        Define atributos (ej: Talla, Color) y sus valores para generar las combinaciones.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    {/* Define Attributes */}
                    <div className="grid gap-4">
                        {attributes.map((attr, idx) => (
                            <div key={idx} className="flex flex-col gap-2 p-4 bg-background rounded-lg border shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-semibold text-sm">{attr.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttribute(idx)} type="button">
                                        <Trash2 className="h-4 w-4 text-destructive/70 hover:text-destructive" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    {attr.values.map((val, vIdx) => (
                                        <Badge key={vIdx} variant="secondary" className="px-2 py-1 text-xs font-normal border-2 border-transparent hover:border-primary/20 transition-colors cursor-default">
                                            {val}
                                            <button type="button" onClick={() => removeValueFromAttribute(idx, vIdx)} className="ml-1.5 text-muted-foreground hover:text-foreground">
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}

                                    <Input
                                        className="h-8 w-24 text-xs"
                                        placeholder="+ Valor"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addValueToAttribute(idx, e.currentTarget.value);
                                                e.currentTarget.value = "";
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if (e.target.value) {
                                                addValueToAttribute(idx, e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex items-center gap-2 mt-2">
                            <Input
                                placeholder="Nuevo Atributo (ej: Material)"
                                value={newAttrName}
                                onChange={(e) => setNewAttrName(e.target.value)}
                                className="max-w-xs"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addAttribute();
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                                <Plus className="h-4 w-4 mr-2" /> Agregar
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t mt-4">
                        <Button
                            type="button"
                            onClick={generateVariants}
                            className="w-full sm:w-auto bg-primary/90 hover:bg-primary text-primary-foreground"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {variants.length > 0 ? "Actualizar Matriz (Mantener Precios)" : "Generar Variantes"}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                            * Al actualizar, se conservarán los precios y stock de las variantes existentes que coincidan.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Variants Table */}
            {variants.length > 0 && (
                <div className="border rounded-md overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="w-[180px]">Variante</TableHead>
                                <TableHead>Imagen</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="w-[120px]">Precio</TableHead>
                                <TableHead className="w-[120px]">Costo</TableHead>
                                <TableHead className="w-[100px]">Stock</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {variants.map((v, idx) => (
                                <TableRow key={idx} className="hover:bg-muted/5">
                                    <TableCell className="font-medium text-xs">
                                        <div className="flex flex-wrap gap-1">
                                            {Object.entries(v.attributes).map(([k, val]) => (
                                                <Badge key={k} variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                    <span className="opacity-70 mr-1">{k}:</span>{val}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <ImageUpload
                                            tenantId={tenantId}
                                            value={v.image_path}
                                            onChange={(path) => updateVariant(idx, 'image_path', path)}
                                            onRemove={() => updateVariant(idx, 'image_path', null)}
                                            className="h-8 w-8"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={v.sku}
                                            onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                            className="h-8 text-xs font-mono"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={v.price}
                                            onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                                            className="h-8 w-24 text-right"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={v.cost}
                                            onChange={(e) => updateVariant(idx, 'cost', Number(e.target.value))}
                                            className="h-8 w-24 text-right"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={v.stock}
                                            onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                                            className="h-8 w-20 text-right"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" type="button" onClick={() => removeVariant(idx)}>
                                            <Trash2 className="h-4 w-4 text-destructive/50 hover:text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
            {variants.length === 0 && attributes.length > 0 && (
                <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertTitle>¡Atención!</AlertTitle>
                    <AlertDescription>
                        Has definido atributos pero no has generado las variantes. Haz clic en el botón <strong>Generar Variantes</strong> arriba para guardarlos.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    )
}
