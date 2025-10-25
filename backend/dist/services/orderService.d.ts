import { Order, OrderItem } from '../models/types';
export declare const createOrder: (orderData: any) => Promise<Order>;
export declare const getOrderById: (orderId: string) => Promise<Order | null>;
export declare const getOrderByNumber: (orderNumber: string) => Promise<Order | null>;
export declare const getOrderItems: (orderId: string) => Promise<OrderItem[]>;
export declare const updateOrderPaymentStatus: (orderId: string, status: string, paymentIntentId?: string) => Promise<Order>;
export declare const updateOrderProductionStatus: (orderId: string, status: string, trackingNumber?: string) => Promise<Order>;
export declare const getAllOrders: (filters?: any) => Promise<Order[]>;
//# sourceMappingURL=orderService.d.ts.map