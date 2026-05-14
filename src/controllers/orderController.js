import db from '../config/db.js';
import { enviarEmailStatus } from '../services/emailService.js';
import { MercadoPagoConfig, Preference } from "mercadopago";

export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders ORDER BY data DESC, created_at DESC'
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.itens = items.map((i) => ({
        pecaId: i.product_id,
        qty: i.qty,
        preco: parseFloat(i.preco),
        nome: i.name,
      }));
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Pedidos do usuário logado ────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );

    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.itens = items.map((i) => ({
        pecaId: i.product_id,
        qty: i.qty,
        preco: parseFloat(i.preco),
        nome: i.name,
        image_url: i.image_url,
      }));
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createOrder = async (req, res) => {
  const { cliente, data, pagamento, frete, status, nf, itens, user_id, estado, frete_valor } = req.body;

  if (!cliente || !itens || !itens.length) {
    return res.status(400).json({ error: 'Cliente e itens são obrigatórios.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const item of itens) {
      const [[product]] = await conn.query(
        'SELECT stock_quantity FROM products WHERE id = ?',
        [item.pecaId]
      );
      if (!product) throw new Error(`Produto ID ${item.pecaId} não encontrado.`);
      if (product.stock_quantity < item.qty) throw new Error(`Estoque insuficiente para o produto ID ${item.pecaId}.`);
    }

    const [result] = await conn.query(
      `INSERT INTO orders (cliente, data, pagamento, frete, status, nf, user_id, estado, frete_valor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [cliente, data || new Date(), pagamento, frete, status || 'Pendente',
        nf || null, user_id || null, estado || null, frete_valor || null]
    );
    const orderId = result.insertId;

    for (const item of itens) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, qty, preco) VALUES (?, ?, ?, ?)',
        [orderId, item.pecaId, item.qty, item.preco]
      );
      await conn.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.qty, item.pecaId]
      );
    }

    await conn.commit();

    // Envia email de confirmação se tiver user_id
    if (user_id) {
      try {
        const [[user]] = await db.query('SELECT nome, email FROM users WHERE id = ?', [user_id]);
        if (user) {
          await enviarEmailStatus({ id: orderId, status: 'Pendente', nf: null }, user.email, user.nome);
        }
      } catch (emailErr) {
        console.error('Erro ao enviar email:', emailErr.message);
      }
    }

    res.status(201).json({ id: orderId, message: 'Pedido criado com sucesso!' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    conn.release();
  }
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const { nf, status } = req.body;

  try {
    const fields = [];
    const values = [];

    if (nf !== undefined) { fields.push('nf = ?'); values.push(nf); }
    if (status !== undefined) { fields.push('status = ?'); values.push(status); }

    if (!fields.length) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    values.push(id);
    await db.query(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`, values);

    // Envia email se status mudou
    if (status) {
      try {
        const [[order]] = await db.query(
          'SELECT o.*, u.nome, u.email FROM orders o LEFT JOIN users u ON u.id = o.user_id WHERE o.id = ?',
          [id]
        );
        if (order?.email) {
          await enviarEmailStatus(order, order.email, order.nome);
        }
      } catch (emailErr) {
        console.error('Erro ao enviar email:', emailErr.message);
      }
    }

    res.json({ message: 'Pedido atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pedido não encontrado.' });
    }
    res.json({ message: 'Pedido removido com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

export const retryPayment = async (req, res) => {
  try {

    const orderId = req.params.id;

    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    const order = orders[0];

    const [items] = await db.query(`
      SELECT oi.*, p.name
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `, [orderId]);

    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          ...items.map((item) => ({
            title: String(item.name),
            quantity: Number(item.qty),
            unit_price: Number(item.preco),
            currency_id: "BRL",
          })),

          {
            title: "Frete",
            quantity: 1,
            unit_price: Number(order.frete_valor || 0),
            currency_id: "BRL",
          }
        ],

        back_urls: {
          success: "http://localhost:5173/?success=true",
          failure: "http://localhost:5173/?failure=true",
          pending: "http://localhost:5173/?pending=true",
        },
      },
    });

    res.json({
      init_point: response.init_point,
    });

  } catch (error) {

    console.error("ERRO RETRY PAYMENT:");
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};