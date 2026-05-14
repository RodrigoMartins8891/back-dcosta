import express from 'express';
import uploadCloud from '../config/uploadCloud.js';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct
} from '../controllers/productController.js';

const router = express.Router();

router.get('/',       getAllProducts);
router.post('/',      uploadCloud.single('image'), createProduct);
router.put('/:id',    updateProduct);
router.put('/:id/stock', updateProductStock);
router.delete('/:id', deleteProduct);

export default router;