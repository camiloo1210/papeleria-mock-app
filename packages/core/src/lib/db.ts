export interface LocalProduct {
    id?: number;
    uuid: string;
    [key: string]: any;
}

export const db = {
    products: {
        get: async () => null,
        put: async () => {},
        toArray: async () => []
    }
};
