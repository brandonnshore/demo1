"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOrders = exports.updateOrderProductionStatus = exports.updateOrderPaymentStatus = exports.getOrderItems = exports.getOrderByNumber = exports.getOrderById = exports.createOrder = void 0;
const database_1 = __importDefault(require("../config/database"));
const errorHandler_1 = require("../middleware/errorHandler");
const createOrder = async (orderData) => {
    const client = await database_1.default.connect();
    try {
        await client.query('BEGIN');
        // Create or get customer
        let customer;
        const customerResult = await client.query('SELECT * FROM customers WHERE email = $1', [orderData.customer.email]);
        if (customerResult.rows.length > 0) {
            customer = customerResult.rows[0];
        }
        else {
            const newCustomerResult = await client.query(`INSERT INTO customers (email, name, phone, addresses)
         VALUES ($1, $2, $3, $4)
         RETURNING *`, [
                orderData.customer.email,
                orderData.customer.name,
                orderData.customer.phone,
                JSON.stringify([orderData.shipping_address])
            ]);
            customer = newCustomerResult.rows[0];
        }
        // Generate order number
        const orderNumber = `RB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        // Create order
        const orderResult = await client.query(`INSERT INTO orders (
        order_number, customer_id, subtotal, tax, shipping, discount, total,
        payment_status, production_status, shipping_address, billing_address, customer_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`, [
            orderNumber,
            customer.id,
            orderData.subtotal,
            orderData.tax || 0,
            orderData.shipping || 0,
            orderData.discount || 0,
            orderData.total,
            'pending',
            'pending',
            JSON.stringify(orderData.shipping_address),
            JSON.stringify(orderData.billing_address || orderData.shipping_address),
            orderData.customer_notes || null
        ]);
        const order = orderResult.rows[0];
        // Create order items
        for (const item of orderData.items) {
            await client.query(`INSERT INTO order_items (
          order_id, variant_id, quantity, unit_price, total_price, custom_spec, production_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
                order.id,
                item.variant_id,
                item.quantity,
                item.unit_price,
                item.total_price,
                JSON.stringify(item.customization),
                'pending'
            ]);
        }
        // Create status history entry
        await client.query(`INSERT INTO order_status_history (order_id, new_status, notes)
       VALUES ($1, $2, $3)`, [order.id, 'pending', 'Order created']);
        await client.query('COMMIT');
        return order;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.createOrder = createOrder;
const getOrderById = async (orderId) => {
    const result = await database_1.default.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
};
exports.getOrderById = getOrderById;
const getOrderByNumber = async (orderNumber) => {
    const result = await database_1.default.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
};
exports.getOrderByNumber = getOrderByNumber;
const getOrderItems = async (orderId) => {
    const result = await database_1.default.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);
    return result.rows;
};
exports.getOrderItems = getOrderItems;
const updateOrderPaymentStatus = async (orderId, status, paymentIntentId) => {
    const fields = ['payment_status = $1'];
    const values = [status, orderId];
    if (paymentIntentId) {
        fields.push('payment_intent_id = $2');
        values.splice(1, 0, paymentIntentId);
        values[values.length - 1] = orderId;
    }
    const result = await database_1.default.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    if (result.rows.length === 0) {
        throw new errorHandler_1.ApiError(404, 'Order not found');
    }
    // Add status history
    await database_1.default.query(`INSERT INTO order_status_history (order_id, new_status, notes)
     VALUES ($1, $2, $3)`, [orderId, `payment_${status}`, `Payment status updated to ${status}`]);
    return result.rows[0];
};
exports.updateOrderPaymentStatus = updateOrderPaymentStatus;
const updateOrderProductionStatus = async (orderId, status, trackingNumber) => {
    const fields = ['production_status = $1'];
    const values = [status];
    if (trackingNumber) {
        fields.push('tracking_number = $2');
        values.push(trackingNumber);
    }
    if (status === 'shipped') {
        const shippedField = trackingNumber ? '$3' : '$2';
        fields.push(`shipped_at = ${shippedField}`);
        values.push(new Date());
    }
    values.push(orderId);
    const result = await database_1.default.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
    if (result.rows.length === 0) {
        throw new errorHandler_1.ApiError(404, 'Order not found');
    }
    // Add status history
    await database_1.default.query(`INSERT INTO order_status_history (order_id, new_status, notes)
     VALUES ($1, $2, $3)`, [orderId, status, `Production status updated to ${status}`]);
    return result.rows[0];
};
exports.updateOrderProductionStatus = updateOrderProductionStatus;
const getAllOrders = async (filters) => {
    let query = 'SELECT * FROM orders';
    const conditions = [];
    const values = [];
    let paramCount = 1;
    if (filters?.payment_status) {
        conditions.push(`payment_status = $${paramCount}`);
        values.push(filters.payment_status);
        paramCount++;
    }
    if (filters?.production_status) {
        conditions.push(`production_status = $${paramCount}`);
        values.push(filters.production_status);
        paramCount++;
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY created_at DESC';
    const result = await database_1.default.query(query, values);
    return result.rows;
};
exports.getAllOrders = getAllOrders;
//# sourceMappingURL=orderService.js.map