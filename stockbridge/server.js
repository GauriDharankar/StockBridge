require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let pool;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stockbridge',
    waitForConnections: true,
    connectionLimit: 5
  });
} catch (err) { console.error('Database configuration error:', err.message); }

async function query(sql, params = []) {
  if (!pool) throw new Error('Database pool unavailable. Check .env configuration.');
  return pool.execute(sql, params);
}
const validListing = (b) => b && typeof b.title === 'string' && b.title.trim() &&
  typeof b.category === 'string' && b.category.trim() && Number(b.quantity) > 0 &&
  Number(b.price) >= 0 && typeof b.location === 'string' && b.location.trim() &&
  typeof b.seller === 'string' && b.seller.trim();

app.get('/api/health', async (_req, res) => {
  try { await query('SELECT 1'); res.json({ status: 'ok', database: 'connected' }); }
  catch (e) { res.status(503).json({ status: 'degraded', message: e.message }); }
});

app.get('/api/listings', async (req, res) => {
  try {
    const { q = '', category = '', sort = 'newest' } = req.query;
    const order = ({ price_asc: 'price ASC', price_desc: 'price DESC', quantity_desc: 'quantity DESC', newest: 'created_at DESC' })[sort] || 'created_at DESC';
    const sql = `SELECT * FROM listings WHERE status <> 'Closed' AND (title LIKE ? OR description LIKE ? OR seller LIKE ? OR location LIKE ?) AND (? = '' OR category = ?) ORDER BY ${order}`;
    const term = `%${String(q).slice(0, 100)}%`;
    const [rows] = await query(sql, [term, term, term, term, category, category]);
    res.json(rows);
  } catch (e) { res.status(503).json({ error: 'Could not load listings. Check MySQL setup.', detail: e.message }); }
});

app.post('/api/listings', async (req, res) => {
  if (!validListing(req.body)) return res.status(400).json({ error: 'Complete all required fields. Quantity must be positive and price cannot be negative.' });
  const b = req.body;
  try {
    const [result] = await query('INSERT INTO listings (title,category,quantity,unit,price,location,seller,description) VALUES (?,?,?,?,?,?,?,?)',
      [b.title.trim(), b.category, Number(b.quantity), (b.unit || 'units').trim(), Number(b.price), b.location.trim(), b.seller.trim(), (b.description || '').trim()]);
    const [rows] = await query('SELECT * FROM listings WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(503).json({ error: 'Could not save listing. Check MySQL setup.', detail: e.message }); }
});

app.patch('/api/listings/:id', async (req, res) => {
  if (!validListing(req.body)) return res.status(400).json({ error: 'Please provide valid listing details.' });
  const b = req.body;
  try {
    const [result] = await query('UPDATE listings SET title=?,category=?,quantity=?,unit=?,price=?,location=?,seller=?,description=? WHERE id=?',
      [b.title.trim(), b.category, Number(b.quantity), (b.unit || 'units').trim(), Number(b.price), b.location.trim(), b.seller.trim(), (b.description || '').trim(), Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Listing not found.' });
    const [rows] = await query('SELECT * FROM listings WHERE id=?', [Number(req.params.id)]); res.json(rows[0]);
  } catch (e) { res.status(503).json({ error: 'Could not update listing.', detail: e.message }); }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const [result] = await query("UPDATE listings SET status='Closed' WHERE id=?", [Number(req.params.id)]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Listing not found.' });
    res.json({ message: 'Listing closed successfully.' });
  } catch (e) { res.status(503).json({ error: 'Could not close listing.', detail: e.message }); }
});

app.post('/api/inquiries', async (req, res) => {
  const { listing_id, buyer_name, buyer_email, message = '' } = req.body || {};
  if (!Number(listing_id) || !String(buyer_name || '').trim() || !/^\S+@\S+\.\S+$/.test(buyer_email || ''))
    return res.status(400).json({ error: 'Enter your name and a valid email address.' });
  try {
    const [result] = await query('INSERT INTO inquiries (listing_id,buyer_name,buyer_email,message) VALUES (?,?,?,?)', [Number(listing_id), buyer_name.trim(), buyer_email.trim(), message.trim()]);
    res.status(201).json({ id: result.insertId, message: 'Inquiry submitted.' });
  } catch (e) { res.status(503).json({ error: 'Could not save inquiry. Check MySQL setup.', detail: e.message }); }
});


app.post('/api/registrations', async (req, res) => {
  const b = req.body || {};
  const email = String(b.email || '').trim();
  if (!String(b.full_name || '').trim() || !/^\S+@\S+\.\S+$/.test(email) || !String(b.academic_year || '').trim() || !String(b.department || '').trim() || !String(b.interest || '').trim()) {
    return res.status(400).json({ error: 'Complete all required fields with a valid email address.' });
  }
  try {
    const [result] = await query('INSERT INTO registrations (full_name,email,academic_year,department,interest) VALUES (?,?,?,?,?)', [String(b.full_name).trim(), email, b.academic_year, b.department, b.interest]);
    res.status(201).json({ id: result.insertId, message: 'Registration saved.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'This email is already registered.' });
    res.status(503).json({ error: 'Could not save registration. Check MySQL setup.', detail: e.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { q = '', category = '', from = '', sort = 'date_asc' } = req.query;
    const order = ({ date_asc: 'event_date ASC', date_desc: 'event_date DESC', title_asc: 'title ASC' })[sort] || 'event_date ASC';
    const term = `%${String(q).slice(0, 100)}%`;
    const [rows] = await query(`SELECT * FROM events WHERE (title LIKE ? OR description LIKE ? OR location LIKE ?) AND (? = '' OR category = ?) AND (? = '' OR event_date >= ?) ORDER BY ${order}`, [term, term, term, category, category, from, from]);
    res.json(rows);
  } catch (e) { res.status(503).json({ error: 'Could not load events. Check MySQL setup.', detail: e.message }); }
});

app.post('/api/events', async (req, res) => {
  const b = req.body || {};
  if (!String(b.title || '').trim() || !['Workshop','Networking','Showcase','Webinar'].includes(b.category) || !/^\d{4}-\d{2}-\d{2}$/.test(b.event_date || '') || !String(b.location || '').trim()) return res.status(400).json({ error: 'Provide a title, valid category, date and location.' });
  try {
    const [r] = await query('INSERT INTO events (title,category,event_date,location,description) VALUES (?,?,?,?,?)', [b.title.trim(), b.category, b.event_date, b.location.trim(), String(b.description || '').trim()]);
    const [rows] = await query('SELECT * FROM events WHERE id=?', [r.insertId]); res.status(201).json(rows[0]);
  } catch (e) { res.status(503).json({ error: 'Could not create event.', detail: e.message }); }
});
app.patch('/api/events/:id', async (req, res) => {
  const b = req.body || {};
  if (!String(b.title || '').trim() || !['Workshop','Networking','Showcase','Webinar'].includes(b.category) || !/^\d{4}-\d{2}-\d{2}$/.test(b.event_date || '') || !String(b.location || '').trim()) return res.status(400).json({ error: 'Provide a title, valid category, date and location.' });
  try { const [r] = await query('UPDATE events SET title=?,category=?,event_date=?,location=?,description=? WHERE id=?', [b.title.trim(), b.category, b.event_date, b.location.trim(), String(b.description || '').trim(), Number(req.params.id)]); if (!r.affectedRows) return res.status(404).json({error:'Event not found.'}); const [rows] = await query('SELECT * FROM events WHERE id=?',[Number(req.params.id)]); res.json(rows[0]); }
  catch(e) { res.status(503).json({error:'Could not update event.',detail:e.message}); }
});
app.delete('/api/events/:id', async (req, res) => { try { const [r] = await query('DELETE FROM events WHERE id=?',[Number(req.params.id)]); if (!r.affectedRows) return res.status(404).json({error:'Event not found.'}); res.json({message:'Event deleted.'}); } catch(e) { res.status(503).json({error:'Could not delete event.',detail:e.message}); } });

app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.listen(PORT, () => console.log(`StockBridge running at http://localhost:${PORT}`));
