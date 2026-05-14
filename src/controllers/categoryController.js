import db from '../config/db.js';

export const getCategories = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT * FROM categories
      ORDER BY name
    `);

    res.json(rows);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }
};