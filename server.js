import express        from 'express';
import cors           from 'cors';
import dotenv         from 'dotenv';
import productRoutes  from './src/routes/productRoutes.js';
import checkoutRoutes from './src/routes/checkoutRoutes.js';
import orderRoutes    from './src/routes/orderRoutes.js';
import authRoutes     from './src/routes/authRoutes.js';
import shippingRoutes from './src/routes/shippingRoutes.js';
import paymentRoutes  from './src/routes/paymentRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

app.use('/products',  productRoutes);
app.use('/checkout',  checkoutRoutes);
app.use('/orders',    orderRoutes);
app.use('/auth',      authRoutes);
app.use('/shipping',  shippingRoutes);
app.use('/payment',   paymentRoutes);
app.use('/categories', categoryRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});