import express                                                     from 'express';
import { getAllOrders, getMyOrders, createOrder, updateOrder, deleteOrder, retryPayment } from '../controllers/orderController.js';
import { authMiddleware }                                          from '../middleware/auth.js';

const router = express.Router();

router.get('/',        getAllOrders);
router.get('/my',      authMiddleware, getMyOrders);  // pedidos do usuário logado
router.post('/',       createOrder);
router.put('/:id',     updateOrder);
router.delete('/:id',  deleteOrder);
router.post('/:id/retry-payment', retryPayment);

export default router;