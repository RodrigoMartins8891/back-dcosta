import db from '../config/db.js';

export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { name, description, price, category, stock_quantity } = req.body;

  const image_url = req.file
    ? req.file.path
    : 'https://via.placeholder.com/300';

  try {
    // Busca o ID da categoria pelo nome
    let category_id = null;
    if (category) {
      const [[cat]] = await db.query(
        'SELECT id FROM categories WHERE name = ?',
        [category]
      );
      category_id = cat ? cat.id : null;
    }

    await db.query(
      'INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', price, category_id, image_url, stock_quantity || 0]
    );
    res.status(201).json({ message: 'Produto criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    category,
    stock_quantity,
    min_stock
  } = req.body;

  try {
    // Busca categoria apenas se enviada
    let category_id;

    if (category) {
      const [[cat]] = await db.query(
        'SELECT id FROM categories WHERE name = ?',
        [category]
      );

      category_id = cat ? cat.id : null;
    }

    const [result] = await db.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        category_id = COALESCE(?, category_id),
        stock_quantity = COALESCE(?, stock_quantity),
        min_stock = COALESCE(?, min_stock)
      WHERE id = ?`,
      [
        name,
        description,
        price,
        category_id,
        stock_quantity,
        min_stock,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Produto não encontrado.'
      });
    }

    res.json({
      message: 'Produto atualizado com sucesso!'
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
};

export const updateProductStock = async (req, res) => {
  const { id } = req.params;
  const { stock_quantity, price } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE products SET stock_quantity = ?, price = ? WHERE id = ?',
      [stock_quantity, price, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json({ message: 'Estoque e preço atualizados com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    res.json({ message: 'Produto removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Não é possível deletar um produto que já possui vendas registradas.' });
  }
};