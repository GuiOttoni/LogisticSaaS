import axios from 'axios';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ConfigUpdatePayload {
  basePrice: number;
  surgeMultiplier: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  locationId: string;
}

export interface CreateOrderPayload {
  customerId: string;
  items: { productId: string; quantity: number }[];
}

export const PricingService = {
  getConfig: async () => {
    const res = await api.get('/pricing/config');
    return res.data;
  },
  updateConfig: async (payload: ConfigUpdatePayload) => {
    const res = await api.post('/pricing/config', payload);
    return res.data;
  }
};

export const OrdersService = {
  createOrder: async (payload: { sku_id: string, order_id: string }) => {
    const res = await api.post('/orders/reservations', payload);
    return res.data;
  },
  simulateLoad: async (count: number) => {
    // Generate an array of mock payloads
    const promises = Array.from({ length: count }).map((_, i) =>
      api.post('/orders/reservations', {
        order_id: crypto.randomUUID(),
        sku_id: "SKU-992",
      })
    );
    const results = await Promise.allSettled(promises);
    return results;
  }
};

export interface Product {
  id: string;
  sku: string;
  name: string;
  basePrice: number;
  stockQuantity: number;
  createdAt: string;
}

export const CatalogService = {
  getProducts: async (): Promise<Product[]> => {
    const res = await api.get('/catalog/products');
    return res.data;
  },
  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await api.post('/catalog/products', product);
    return res.data;
  },
  updatePrice: async (id: string, newPrice: number): Promise<Product> => {
    const res = await api.put(`/catalog/products/${id}/price`, { newPrice });
    return res.data;
  },
  updateStock: async (id: string, payload: { changeAmount: number, reason: string }): Promise<Product> => {
    const res = await api.put(`/catalog/products/${id}/stock`, payload);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    const res = await api.delete(`/catalog/products/${id}`);
    return res.data;
  }
};
