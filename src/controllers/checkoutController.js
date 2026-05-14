import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSession = async (req, res) => {
  try {
    const { items } = req.body;

    const line_items = items.map(item => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name:        item.name,
          description: item.description,
          images:      [item.image_url],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode:        'payment',
      success_url: `${process.env.FRONTEND_URL}/?success=true`,
      cancel_url:  `${process.env.FRONTEND_URL}/?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro no Stripe:', error);
    res.status(500).json({ error: 'Erro ao criar sessão de pagamento' });
  }
};