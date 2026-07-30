// api/menu.js
// Esta función corre en Vercel (no en el navegador) y es la única que
// se conecta a la base de datos Neon. El navegador nunca ve la contraseña
// de la base de datos, solo habla con esta función a través de /api/menu.

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === "GET") {
    try {
      const categories = await sql`
        SELECT id, name, icon FROM categories ORDER BY sort_order ASC, id ASC
      `;
      const items = await sql`
        SELECT id, category_id, name, description, price, image
        FROM items ORDER BY sort_order ASC
      `;
      const configRows = await sql`SELECT key, value FROM config`;
      const config = Object.fromEntries(configRows.map((r) => [r.key, r.value]));

      const menu = categories.map((cat) => ({
        category: cat.name,
        icon: cat.icon || "generico",
        items: items
          .filter((it) => it.category_id === cat.id)
          .map((it) => ({
            id: it.id,
            name: it.name,
            desc: it.description || "",
            price: it.price,
            image: it.image || "",
          })),
      }));

      res.status(200).json({ menu, deliveryNote: config.delivery_note || "" });
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const body = req.body;
      const savedPinRows = await sql`SELECT value FROM config WHERE key = 'pin'`;
      const savedPin = savedPinRows[0]?.value;

      if (String(body.pin) !== String(savedPin)) {
        res.status(401).json({ ok: false, error: "PIN incorrecto" });
        return;
      }

      // Borra todo y reescribe (simple y suficiente para un menú chico)
      await sql`DELETE FROM items`;
      await sql`DELETE FROM categories`;

      let catSort = 0;
      for (const cat of body.menu || []) {
        catSort++;
        const [{ id: catId }] = await sql`
          INSERT INTO categories (name, icon, sort_order)
          VALUES (${cat.category}, ${cat.icon || "generico"}, ${catSort})
          RETURNING id
        `;
        let itemSort = 0;
        for (const item of cat.items) {
          itemSort++;
          await sql`
            INSERT INTO items (id, category_id, name, description, price, image, sort_order)
            VALUES (${item.id}, ${catId}, ${item.name}, ${item.desc || ""}, ${Number(item.price) || 0}, ${item.image || ""}, ${itemSort})
            ON CONFLICT (id) DO UPDATE SET
              category_id = EXCLUDED.category_id,
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              price = EXCLUDED.price,
              image = EXCLUDED.image,
              sort_order = EXCLUDED.sort_order
          `;
        }
      }

      if (body.deliveryNote !== undefined) {
        await sql`
          INSERT INTO config (key, value) VALUES ('delivery_note', ${body.deliveryNote})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `;
      }

      res.status(200).json({ ok: true });
    } catch (err) {
      res.status(500).json({ ok: false, error: String(err) });
    }
    return;
  }

  res.status(405).json({ error: "Método no permitido" });
}
