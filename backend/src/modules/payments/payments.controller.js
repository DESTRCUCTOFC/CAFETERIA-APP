import Stripe from 'stripe';
import { env } from '../../config/env.js'; // Tu estructura de configuración


const stripe = new Stripe(env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY);

export const pay = async (req, res) => {
    try {
        const { amount, customerEmail } = req.body;
        if (!amount) {
            return res.status(400).json({ message: 'El monto es requerido.' });
        }
        const montoEnPesosCompletos = Math.round(amount) * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: montoEnPesosCompletos,
            currency: 'mxn',
            receipt_email: customerEmail,
            metadata: { proyecto: 'cafeteria_app' },
            automatic_payment_methods: { enabled: true },
        });

        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Error en la función pay:', error);
        return res.status(500).json({
            success: false,
            message: 'Hubo un error al procesar el pago con Stripe.',
            error: error.message
        });
    }
};