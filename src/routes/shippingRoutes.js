import express                          from 'express';
import { getAllRates, calcularFrete }   from '../controllers/shippingController.js';

const router = express.Router();

router.get('/',          getAllRates);
router.get('/:estado',   calcularFrete);

export default router;