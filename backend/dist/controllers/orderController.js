"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = exports.capturePayment = exports.createOrder = void 0;
const orderService_1 = require("../services/orderService");
const errorHandler_1 = require("../middleware/errorHandler");
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16'
});
const createOrder = async (req, res, next) => {
    try {
        const orderData = req.body;
        console.log('[ORDER CREATE] Received order data:', JSON.stringify(orderData, null, 2));
        if (!orderData.customer || !orderData.items || !orderData.shipping_address) {
            throw new errorHandler_1.ApiError(400, 'customer, items, and shipping_address are required');
        }
        console.log('[ORDER CREATE] Creating order service...');
        const order = await (0, orderService_1.createOrder)(orderData);
        console.log('[ORDER CREATE] Order created:', order.id);
        // Create Stripe payment intent
        console.log('[ORDER CREATE] Creating Stripe payment intent...');
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(order.total * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                order_id: order.id,
                order_number: order.order_number
            }
        });
        console.log('[ORDER CREATE] Stripe payment intent created:', paymentIntent.id);
        // Update order with payment intent
        console.log('[ORDER CREATE] Updating order with payment intent...');
        await (0, orderService_1.updateOrderPaymentStatus)(order.id, 'pending', paymentIntent.id);
        console.log('[ORDER CREATE] Order updated successfully');
        console.log('[ORDER CREATE] Preparing response...');
        // Test if order can be stringified
        try {
            JSON.stringify(order);
            console.log('[ORDER CREATE] Order stringified successfully');
        }
        catch (stringifyError) {
            console.error('[ORDER CREATE] Failed to stringify order:', stringifyError);
            throw stringifyError;
        }
        const responseData = {
            success: true,
            data: {
                order,
                client_secret: paymentIntent.client_secret
            }
        };
        console.log('[ORDER CREATE] Sending response...');
        res.status(201).json(responseData);
        console.log('[ORDER CREATE] Response sent successfully');
    }
    catch (error) {
        console.error('[ORDER CREATE ERROR]:', error);
        console.error('[ORDER CREATE ERROR] Stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.error('[ORDER CREATE ERROR] Message:', error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.createOrder = createOrder;
const capturePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { payment_intent_id } = req.body;
        if (!payment_intent_id) {
            throw new errorHandler_1.ApiError(400, 'payment_intent_id is required');
        }
        // Verify payment intent with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        if (paymentIntent.status === 'succeeded') {
            const order = await (0, orderService_1.updateOrderPaymentStatus)(id, 'paid', payment_intent_id);
            res.status(200).json({
                success: true,
                data: { order }
            });
        }
        else {
            throw new errorHandler_1.ApiError(400, 'Payment not completed');
        }
    }
    catch (error) {
        next(error);
    }
};
exports.capturePayment = capturePayment;
const getOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if ID is a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUuid = uuidRegex.test(id);
        let order;
        if (isUuid) {
            // Try to get by UUID first
            order = await (0, orderService_1.getOrderById)(id);
        }
        else {
            // Try to get by order number
            order = await (0, orderService_1.getOrderByNumber)(id);
        }
        if (!order) {
            throw new errorHandler_1.ApiError(404, 'Order not found');
        }
        const items = await (0, orderService_1.getOrderItems)(order.id);
        res.status(200).json({
            success: true,
            data: {
                order,
                items
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrder = getOrder;
//# sourceMappingURL=orderController.js.map