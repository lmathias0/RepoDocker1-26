const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Générateur de 50+ articles réalistes pour une boutique de mode/design
const generateProducts = () => {
    const categories = ['Manteaux', 'Pantalons', 'Maille', 'Accessoires', 'Chaussures'];
    const adjectives = ['Oversize', 'Minimaliste', 'Vintage', 'Structuré', 'Brut', 'Cachemire', 'Satiné', 'Technique'];
    const items = ['Manteau', 'Pantalon', 'Sweat', 'Blazer', 'Chemise', 'Bonnet', 'Écharpe', 'Sneakers', 'Sac', 'T-Shirt', 'Cardigan', 'Veste'];
    
    // Images Unsplash de haute qualité orientées mode/lifestyle
    const images = [
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80",
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80",
        "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80",
        "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&q=80",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
        "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"
    ];

    const products = [];
    for (let i = 1; i <= 52; i++) {
        const cat = categories[i % categories.length];
        const name = `${items[i % items.length]} ${adjectives[i % adjectives.length]} #${i}`;
        const price = parseFloat((Math.random() * (250 - 35) + 35).toFixed(2));
        const image = images[i % images.length];
        const isSale = i % 5 === 0; // 1 produit sur 5 est en solde
        const oldPrice = isSale ? parseFloat((price * 1.3).toFixed(2)) : null;

        products.push([name, price, image, cat, isSale, oldPrice, `Pièce d'exception conçue pour durer. Confection soignée, matières nobles et coupe intemporelle.`]);
    }
    return products;
};

async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                image TEXT NOT NULL,
                category VARCHAR(100) NOT NULL,
                is_sale BOOLEAN DEFAULT FALSE,
                old_price DECIMAL(10, 2),
                description TEXT
            );
        `);

        const res = await pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(res.rows[0].count) === 0) {
            console.log("Injection de 52 articles dans la base de données...");
            const products = generateProducts();
            for (const p of products) {
                await pool.query(
                    'INSERT INTO products (name, price, image, category, is_sale, old_price, description) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    p
                );
            }
            console.log("52 articles injectés avec succès !");
        }
    } catch (err) {
        console.error("Erreur init DB :", err);
    }
}

setTimeout(initDatabase, 3000);

// Route pour récupérer tous les produits (avec filtres optionnels de recherche/tri)
app.get('/api/produits', async (req, res) => {
    try {
        const { search, category, sort, sale } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (search) {
            query += ` AND name ILIKE $${paramIndex}`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category && category !== 'Tous') {
            query += ` AND category = $${paramIndex}`;
            params.push(category);
            paramIndex++;
        }

        if (sale === 'true') {
            query += ` AND is_sale = TRUE`;
        }

        // Tri
        if (sort === 'asc') {
            query += ' ORDER BY price ASC';
        } else if (sort === 'desc') {
            query += ' ORDER BY price DESC';
        } else {
            query += ' ORDER BY id ASC';
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Route pour récupérer un seul produit et ses recommandations (même catégorie)
app.get('/api/produits/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const productRes = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        
        if (productRes.rows.length === 0) {
            return res.status(404).json({ error: "Produit non trouvé" });
        }

        const product = productRes.rows[0];

        // Récupérer 4 recommandations de la même catégorie (hors produit actuel)
        const recoRes = await pool.query(
            'SELECT * FROM products WHERE category = $1 AND id != $2 LIMIT 4',
            [product.category, id]
        );

        res.json({
            product,
            recommendations: recoRes.rows
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend opérationnel sur le port ${PORT}`);
});