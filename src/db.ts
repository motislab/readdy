import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('marketplace.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'reseller', 'admin', 'super_admin'
    referral_code TEXT UNIQUE NOT NULL,
    referred_by TEXT,
    store_credit REAL DEFAULT 0,
    campus TEXT DEFAULT 'AASTU',
    name TEXT,
    phone_number TEXT,
    security_key TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    message TEXT NOT NULL,
    rating INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    is_featured INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS stickers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category_id INTEGER,
    price REAL DEFAULT 14.50,
    views INTEGER DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    is_mega_eligible INTEGER DEFAULT 1,
    tags TEXT,
    image_path TEXT,
    type TEXT DEFAULT 'sticker', -- 'sticker', 'custom'
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY, -- VST-YYYY-XXXX
    user_id INTEGER NOT NULL,
    package_type TEXT NOT NULL, -- 'regular', 'mega', 'custom'
    total_amount REAL NOT NULL,
    deposit_amount REAL DEFAULT 0,
    amount_paid REAL DEFAULT 0,
    remaining_balance REAL NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    order_status TEXT DEFAULT 'pending_payment', -- 'pending_payment', 'pending_verification', 'printing', 'printed', 'ready', 'cancelled'
    referral_applied INTEGER DEFAULT 0,
    screenshot_path TEXT,
    notes TEXT,
    cancellation_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    order_id TEXT NOT NULL,
    sticker_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    customization_text TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (sticker_id) REFERENCES stickers(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inviter_id INTEGER NOT NULL,
    invitee_id INTEGER NOT NULL,
    order_id TEXT,
    commission_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inviter_id) REFERENCES users(id),
    FOREIGN KEY (invitee_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    video_url TEXT,
    destination_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS campuses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS pickup_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campus_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY (campus_id) REFERENCES campuses(id)
  );
`);

// Migration: Add nickname and campus columns if they don't exist
const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
const columnNames = tableInfo.map(info => info.name);

if (!columnNames.includes('nickname')) {
  db.exec("ALTER TABLE users ADD COLUMN nickname TEXT");
}
if (!columnNames.includes('campus')) {
  db.exec("ALTER TABLE users ADD COLUMN campus TEXT DEFAULT 'AASTU'");
}
if (!columnNames.includes('ads_balance')) {
  db.exec("ALTER TABLE users ADD COLUMN ads_balance REAL DEFAULT 0");
}
if (!columnNames.includes('name')) {
  db.exec("ALTER TABLE users ADD COLUMN name TEXT");
}
if (!columnNames.includes('phone_number')) {
  db.exec("ALTER TABLE users ADD COLUMN phone_number TEXT");
}
if (!columnNames.includes('security_key')) {
  db.exec("ALTER TABLE users ADD COLUMN security_key TEXT");
}

const stickerInfo = db.prepare("PRAGMA table_info(stickers)").all() as any[];
const stickerColumns = stickerInfo.map(info => info.name);
if (!stickerColumns.includes('type')) {
  db.exec("ALTER TABLE stickers ADD COLUMN type TEXT DEFAULT 'sticker'");
}

const orderItemInfo = db.prepare("PRAGMA table_info(order_items)").all() as any[];
const orderItemColumns = orderItemInfo.map(info => info.name);
if (!orderItemColumns.includes('customization_text')) {
  db.exec("ALTER TABLE order_items ADD COLUMN customization_text TEXT");
}

const orderInfo = db.prepare("PRAGMA table_info(orders)").all() as any[];
const orderColumns = orderInfo.map(info => info.name);
if (!orderColumns.includes('cancellation_note')) {
  db.exec("ALTER TABLE orders ADD COLUMN cancellation_note TEXT");
}
if (!orderColumns.includes('updated_at')) {
  db.exec("ALTER TABLE orders ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
}
if (!orderColumns.includes('referral_cashed_out')) {
  db.exec("ALTER TABLE orders ADD COLUMN referral_cashed_out INTEGER DEFAULT 0");
}
if (!orderColumns.includes('pickup_location')) {
  db.exec("ALTER TABLE orders ADD COLUMN pickup_location TEXT");
}

const categoryInfo = db.prepare("PRAGMA table_info(categories)").all() as any[];
const categoryColumns = categoryInfo.map(info => info.name);
if (!categoryColumns.includes('emoji')) {
  db.exec("ALTER TABLE categories ADD COLUMN emoji TEXT DEFAULT '✨'");
  // Set default emojis for existing categories
  db.exec(`
    UPDATE categories SET emoji = '🎨' WHERE title = 'Anime';
    UPDATE categories SET emoji = '💻' WHERE title = 'Tech';
    UPDATE categories SET emoji = '😂' WHERE title = 'Memes';
    UPDATE categories SET emoji = '✨' WHERE title = 'Minimalist';
    UPDATE categories SET emoji = '🎓' WHERE title = 'Campus Life';
  `);
}

// Seed initial data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
if (userCount.count === 0) {
  // Admin user (password: VibeStickers1121, security_key: VibeStickers@1121)
  db.prepare('INSERT INTO users (email, password, role, referral_code, security_key) VALUES (?, ?, ?, ?, ?)').run(
    'super_admin@moti',
    '$2a$10$6v7p.X9mY7.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X', // Placeholder
    'super_admin',
    'ADMIN001',
    'VibeStickers@1121'
  );

  // Seed categories
  const categories = ['Anime', 'Tech', 'Memes', 'Minimalist', 'Campus Life'];
  const insertCat = db.prepare('INSERT INTO categories (title, is_featured) VALUES (?, ?)');
  categories.forEach(cat => insertCat.run(cat, 1));

  // Seed some stickers
  const insertSticker = db.prepare('INSERT INTO stickers (id, title, category_id, tags, image_path, is_mega_eligible) VALUES (?, ?, ?, ?, ?, ?)');
  for (let i = 1; i <= 20; i++) {
    insertSticker.run(`#S-${i.toString().padStart(3, '0')}`, `Sticker ${i}`, (i % 5) + 1, 'cool,sticker,campus', `https://picsum.photos/seed/sticker${i}/400/400`, 1);
  }

  // Seed settings
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('terms', 'Standard terms and conditions apply.');
  insertSetting.run('privacy', 'Your privacy is important to us.');
  insertSetting.run('telegram_link', 'https://t.me/vsticker_aastu');
  insertSetting.run('contact_email', 'esuyalew.workneh@aastustudent.edu.et');
  insertSetting.run('bank_name', 'Esuyalew Workneh');
  insertSetting.run('cbe_account', '1000366254227');
  insertSetting.run('boa_account', '251507929');
  insertSetting.run('telebirr_account', '0991349404');
  insertSetting.run('dashin_account', '5080646857011');
  insertSetting.run('marquee_text', 'Limited Edition • Vibe Only • Premium Quality • Custom Designs • Fast Delivery');

  // Seed initial campuses
  const initialCampuses = ['AASTU', 'AAU (5 Kilo)', 'AAU (6 Kilo)', 'ASTU'];
  const insertCampus = db.prepare('INSERT INTO campuses (name) VALUES (?)');
  const insertPickup = db.prepare('INSERT INTO pickup_points (campus_id, name) VALUES (?, ?)');
  
  initialCampuses.forEach(name => {
    const res = insertCampus.run(name);
    const campusId = res.lastInsertRowid;
    insertPickup.run(campusId, 'Main Gate');
    insertPickup.run(campusId, 'Library Cafe');
  });
}

export default db;
