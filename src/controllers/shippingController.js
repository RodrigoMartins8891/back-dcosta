import db from '../config/db.js';

// ─── Listar todas as taxas ────────────────────────────────────────────────────
export const getAllRates = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM shipping_rates ORDER BY nome_estado');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─── Calcular frete por estado ────────────────────────────────────────────────
export const calcularFrete = async (req, res) => {
  const { estado } = req.params;

  try {
    const [[rate]] = await db.query(
      'SELECT * FROM shipping_rates WHERE estado = ?',
      [estado.toUpperCase()]
    );

    if (!rate) {
      return res.status(404).json({ error: 'Estado não encontrado.' });
    }

    res.json({
      estado:     rate.estado,
      nome:       rate.nome_estado,
      valor:      parseFloat(rate.valor),
      prazo_dias: rate.prazo_dias,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};