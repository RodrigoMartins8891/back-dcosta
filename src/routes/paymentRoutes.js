import express from "express";
import { MercadoPagoConfig, Preference } from "mercadopago";

const router = express.Router();
console.log(process.env.MP_ACCESS_TOKEN);
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

router.post("/create-payment", async (req, res) => {
  try {

    console.log(req.body);

    const { items } = req.body;

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: items.map((item) => ({
          title: String(item.name),
          quantity: Number(item.quantity),
          unit_price: Number(item.price),
          currency_id: "BRL",
        })),

        back_urls: {
          success: "http://localhost:5173/?success=true",
          failure: "http://localhost:5173/?failure=true",
          pending: "http://localhost:5173/?pending=true",
        },

       
      },
    });

    console.log(response);

    res.json({
      init_point: response.init_point,
    });

  } catch (error) {

    console.error("ERRO MERCADO PAGO:");
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;