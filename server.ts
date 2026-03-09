import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import db from './src/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'campus-sticker-secret-key-2026';
const PORT = 3000;

// Setup multer for screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/screenshots';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Setup multer for sticker image uploads
const stickerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/stickers';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `sticker-${Date.now()}-${file.originalname}`);
  },
});
const uploadSticker = multer({ storage: stickerStorage });

// Setup multer for ad video uploads
const adStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/ads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `ad-${Date.now()}-${file.originalname}`);
  },
});
const uploadAd = multer({ storage: adStorage });

async function startServer() {
  try {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());
  // Ensure admin exists with correct password
  const adminEmail = 'super_admin@moti';
  const adminPassword = 'VibeStickers@1121';
  let admin: any = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  
  if (!admin) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    db.prepare('INSERT INTO users (email, password, role, referral_code, security_key) VALUES (?, ?, ?, ?, ?)').run(
      adminEmail, hashed, 'super_admin', 'ADMIN001', adminPassword
    );
    console.log('Super Admin user created');
  } else {
    // Always ensure role is super_admin and password matches the latest requested one
    const hashed = await bcrypt.hash(adminPassword, 10);
    db.prepare('UPDATE users SET role = ?, password = ?, security_key = ? WHERE id = ?').run('super_admin', hashed, adminPassword, admin.id);
    console.log('Admin credentials updated');
  }
  app.use('/uploads', express.static('uploads'));

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Restricted Admin access' });
    }
    next();
  };

  const isSuperAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: Restricted Super Admin access' });
    }
    next();
  };

  // --- AUTH ROUTES ---
  app.post('/api/auth/register', async (req, res) => {
    let { email, password, referralCode, campus, name, phoneNumber } = req.body;
    
    // Phone number validation
    if (!phoneNumber || !/^\d+$/.test(phoneNumber) || phoneNumber.length < 10) {
      return res.status(400).json({ error: 'Phone number must be at least 10 digits and contain only numbers.' });
    }

    if (email && !email.includes('@')) {
      email = `${email}@vstick`;
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newReferralCode = 'VST' + Math.random().toString(36).substring(2, 7).toUpperCase();
      
      const result = db.prepare('INSERT INTO users (email, password, referral_code, referred_by, campus, name, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        email, hashedPassword, newReferralCode, referralCode || null, campus || 'AASTU', name || null, phoneNumber
      );
      
      res.json({ success: true, userId: result.lastInsertRowid });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed: users.email')) {
        const username = email.split('@')[0];
        const suggested = username + Math.floor(Math.random() * 1000);
        return res.status(400).json({ 
          error: `The username "${username}" is already taken. Please use a different username. How about "${suggested}"?`,
          suggestion: suggested
        });
      }
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    let { email, password } = req.body;
    // If it's a username without @, append @vstick
    if (email && !email.includes('@')) {
      email = `${email}@vstick`;
    }
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Email not found' });
    }
    
    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = password === user.password;
    }

    if (!isMatch && password === user.password) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        nickname: user.nickname,
        store_credit: user.store_credit, 
        referral_code: user.referral_code 
      } 
    });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, (req: any, res) => {
    const user: any = db.prepare('SELECT id, email, role, nickname, store_credit, referral_code, campus FROM users WHERE id = ?').get(req.user.id);
    res.json({ user });
  });

  app.post('/api/auth/nickname', authenticate, (req: any, res) => {
    const { nickname } = req.body;
    if (!nickname || nickname.length < 2) {
      return res.status(400).json({ error: 'Nickname must be at least 2 characters' });
    }
    db.prepare('UPDATE users SET nickname = ? WHERE id = ?').run(nickname, req.user.id);
    res.json({ success: true, nickname });
  });

  app.post('/api/auth/change-password', authenticate, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    console.log(`Password change request for user ${req.user.id}`);
    const user: any = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      console.error('User not found for password change');
      return res.status(404).json({ error: 'User not found' });
    }

    let isMatch = false;
    try {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } catch (e) {
      console.warn('Bcrypt compare failed, trying plain text fallback');
      isMatch = currentPassword === user.password;
    }

    if (!isMatch && currentPassword === user.password) {
      isMatch = true;
    }

    if (!isMatch) {
      console.warn(`Incorrect current password for user ${req.user.id}`);
      return res.status(401).json({ error: 'Current password incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);
    console.log(`Password updated successfully for user ${req.user.id}`);
    res.json({ success: true });
  });

  app.get('/api/leaderboard', (req, res) => {
    // Weekly referral leaderboard
    const leaderboard = db.prepare(`
      SELECT u.nickname, u.email, COUNT(r.id) as referral_count
      FROM users u
      LEFT JOIN referrals r ON u.id = r.inviter_id AND r.created_at >= date('now', '-7 days')
      GROUP BY u.id
      HAVING referral_count > 0
      ORDER BY referral_count DESC
      LIMIT 10
    `).all();
    res.json(leaderboard);
  });

  app.get('/api/stickers/trending', (req, res) => {
    const trending = db.prepare(`
      SELECT s.*, c.title as category_title 
      FROM stickers s 
      LEFT JOIN categories c ON s.category_id = c.id 
      WHERE s.is_active = 1 
      ORDER BY s.views DESC, s.orders_count DESC 
      LIMIT 8
    `).all();
    res.json(trending);
  });

  app.post('/api/admin/users/:id/promote', authenticate, isSuperAdmin, (req, res) => {
    const { role, securityKey } = req.body;
    if (!['user', 'admin', 'reseller'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (role === 'admin' && !securityKey) {
      return res.status(400).json({ error: 'Security key is required for admin promotion' });
    }
    db.prepare('UPDATE users SET role = ?, security_key = ? WHERE id = ?').run(role, securityKey || null, req.params.id);
    res.json({ success: true });
  });

  app.post('/api/auth/admin-verify', authenticate, (req: any, res) => {
    const { securityKey } = req.body;
    const user: any = db.prepare('SELECT security_key, role FROM users WHERE id = ?').get(req.user.id);
    
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (user.security_key !== securityKey) {
      return res.status(401).json({ error: 'Invalid security key' });
    }

    res.json({ success: true });
  });

  // --- STICKER ROUTES ---
  app.get('/api/stickers', (req, res) => {
    const { category, search, sort, megaOnly } = req.query;
    let query = 'SELECT s.*, c.title as category_title FROM stickers s LEFT JOIN categories c ON s.category_id = c.id WHERE s.is_active = 1';
    const params: any[] = [];

    if (category) {
      query += ' AND s.category_id = ?';
      params.push(category);
    }
    if (megaOnly === 'true') {
      query += ' AND s.is_mega_eligible = 1';
    }
    if (search) {
      query += ' AND (s.title LIKE ? OR s.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (sort === 'most_viewed') query += ' ORDER BY s.views DESC';
    else if (sort === 'most_ordered') query += ' ORDER BY s.orders_count DESC';
    else query += ' ORDER BY s.id DESC';

    const stickers = db.prepare(query).all(...params);
    res.json(stickers);
  });

  app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  });

  app.get('/api/stickers/:id', (req, res) => {
    db.prepare('UPDATE stickers SET views = views + 1 WHERE id = ?').run(req.params.id);
    const sticker = db.prepare('SELECT s.*, c.title as category_title FROM stickers s LEFT JOIN categories c ON s.category_id = c.id WHERE s.id = ?').get(req.params.id);
    res.json(sticker);
  });

  // --- ORDER ROUTES ---
  app.post('/api/orders', authenticate, (req: any, res) => {
    const { packageType, stickerIds, paymentMethod, useCredit, customizations, pickupLocation } = req.body;
    const userId = req.user.id;
    
    // Pricing logic
    let totalAmount = 0;
    let depositAmount = 0;
    if (packageType === 'regular') {
      if (stickerIds.length < 20) {
        totalAmount = stickerIds.length * 14.50;
      } else {
        totalAmount = 250 + (stickerIds.length - 20) * 14.50;
      }
      depositAmount = Math.min(100, totalAmount);
    } else if (packageType === 'mega') {
      if (stickerIds.length < 20 || stickerIds.length > 50) return res.status(400).json({ error: 'Mega Pack requires between 20 and 50 unique designs' });
      totalAmount = 2500;
      depositAmount = 2500;
    } else if (packageType === 'custom') {
      totalAmount = req.body.totalAmount || 0;
      depositAmount = totalAmount * 0.5;
    }

    const orderId = `VST-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const user: any = db.prepare('SELECT store_credit FROM users WHERE id = ?').get(userId);
    let creditUsed = 0;
    if (useCredit && user.store_credit > 0) {
      creditUsed = Math.min(user.store_credit, totalAmount);
      db.prepare('UPDATE users SET store_credit = store_credit - ? WHERE id = ?').run(creditUsed, userId);
    }

    const remainingBalance = totalAmount - creditUsed;

    db.prepare(`
      INSERT INTO orders (id, user_id, package_type, total_amount, deposit_amount, amount_paid, remaining_balance, payment_method, pickup_location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(orderId, userId, packageType, totalAmount, depositAmount, creditUsed, remainingBalance, paymentMethod, pickupLocation || null);

    const insertItem = db.prepare('INSERT INTO order_items (order_id, sticker_id, quantity, customization_text) VALUES (?, ?, ?, ?)');
    stickerIds.forEach((sid: string) => {
      const customization = customizations ? customizations[sid] : null;
      insertItem.run(orderId, sid, packageType === 'mega' ? 5 : 1, customization);
      db.prepare('UPDATE stickers SET orders_count = orders_count + 1 WHERE id = ?').run(sid);
    });

    res.json({ success: true, orderId });
  });

  app.get('/api/my-orders', authenticate, (req: any, res) => {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id) as any[];
    
    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, s.title, s.image_path 
        FROM order_items oi 
        JOIN stickers s ON oi.sticker_id = s.id 
        WHERE oi.order_id = ?
      `).all(order.id);
      return { ...order, items };
    });
    
    res.json(ordersWithItems);
  });

  app.post('/api/orders/:id/upload-screenshot', authenticate, upload.single('screenshot'), (req: any, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    db.prepare('UPDATE orders SET screenshot_path = ?, order_status = \'pending_verification\', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(
      req.file.path, req.params.id, req.user.id
    );
    res.json({ success: true });
  });

  app.post('/api/orders/:id/cancel', authenticate, (req: any, res) => {
    const order: any = db.prepare('SELECT order_status FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    const blockedStatuses = ['printing', 'printed'];
    if (blockedStatuses.includes(order.order_status)) {
      return res.status(400).json({ error: 'Cannot request cancellation. The order is already being printed or is finished.' });
    }
    
    if (order.order_status === 'cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled.' });
    }
    
    db.prepare('UPDATE orders SET order_status = \'cancelled\', cancellation_note = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Order cancelled successfully. Please send your refund details through the feedback section.' });
  });

  // --- REFERRAL ROUTES ---
  app.get('/api/referrals/stats', authenticate, (req: any, res) => {
    const user: any = db.prepare('SELECT referral_code, store_credit FROM users WHERE id = ?').get(req.user.id);
    const referrals = db.prepare('SELECT COUNT(*) as count FROM users WHERE referred_by = ?').get(user.referral_code) as any;
    
    // Get detailed referred orders
    const referredOrders = db.prepare(`
      SELECT o.id, o.order_status, o.package_type, o.created_at, u.email as user_email, o.payment_status, o.referral_cashed_out,
             (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as sticker_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE u.referred_by = ?
      ORDER BY o.created_at DESC
    `).all(user.referral_code) as any[];

    // Eligible orders are those that are verified and NOT yet cashed out
    // Both mega packs and normal orders (>= 20 stickers) count
    const eligibleOrders = referredOrders.filter(o => 
      o.payment_status === 'verified' && 
      o.referral_cashed_out === 0 &&
      (o.package_type === 'mega' || o.sticker_count >= 20)
    );

    res.json({
      referralCode: user.referral_code,
      totalReferred: referrals.count,
      ordersMade: eligibleOrders.length,
      eligibleOrdersCount: eligibleOrders.length,
      creditEarned: user.store_credit,
      referredOrders
    });
  });

  // --- ADMIN ROUTES ---
  app.get('/api/admin/orders', authenticate, isAdmin, (req, res) => {
    const orders = db.prepare(`
      SELECT o.*, u.email, u.name, u.phone_number 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `).all() as any[];

    const ordersWithItems = orders.map(order => {
      const items = db.prepare(`
        SELECT oi.*, s.title, s.image_path 
        FROM order_items oi 
        JOIN stickers s ON oi.sticker_id = s.id 
        WHERE oi.order_id = ?
      `).all(order.id) as any[];
      return {
        ...order,
        items,
        sticker_ids: items.map(i => i.sticker_id).join(', ')
      };
    });

    res.json(ordersWithItems);
  });

  app.post('/api/admin/orders/:id/status', authenticate, isAdmin, (req, res) => {
    const { status } = req.body;
    const validStatuses = ['pending_payment', 'pending_verification', 'verified_deposit', 'printing', 'printed', 'ready', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order: any = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (status === 'verified_deposit' && order.order_status !== 'verified_deposit') {
      // If verifying deposit, update amount_paid if it's currently less than deposit
      const newAmountPaid = Math.max(order.amount_paid, order.deposit_amount);
      const newRemainingBalance = order.total_amount - newAmountPaid;
      db.prepare('UPDATE orders SET order_status = ?, amount_paid = ?, remaining_balance = ?, payment_status = \'verified\', updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(status, newAmountPaid, newRemainingBalance, req.params.id);
    } else {
      db.prepare('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    }
    
    res.json({ success: true });
  });

  app.delete('/api/admin/orders/:id', authenticate, isAdmin, (req, res) => {
    const order: any = db.prepare('SELECT id FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
    db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Order permanently deleted.' });
  });

  app.post('/api/admin/orders/:id/verify-payment', authenticate, isAdmin, (req, res) => {
    const { amountPaid, orderStatus } = req.body;
    const order: any = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    
    db.prepare('UPDATE orders SET amount_paid = amount_paid + ?, payment_status = \'verified\', order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      amountPaid, orderStatus || 'printing', req.params.id
    );

    // Handle Referral Commission on first order verification
    const user: any = db.prepare('SELECT * FROM users WHERE id = ?').get(order.user_id);
    if (user.referred_by) {
      const inviter: any = db.prepare('SELECT * FROM users WHERE referral_code = ?').get(user.referred_by);
      if (inviter) {
        const existingReferral = db.prepare('SELECT * FROM referrals WHERE invitee_id = ?').get(user.id);
        if (!existingReferral) {
          const commission = inviter.role === 'reseller' ? 50 : 25; // Higher for resellers
          db.prepare('INSERT INTO referrals (inviter_id, invitee_id, order_id, commission_amount, status) VALUES (?, ?, ?, ?, ?)').run(
            inviter.id, user.id, order.id, commission, 'completed'
          );
          db.prepare('UPDATE users SET store_credit = store_credit + ? WHERE id = ?').run(commission, inviter.id);
        }
      }
    }

    // Handle Reseller Activation
    if (order.package_type === 'mega' && (orderStatus === 'printed' || orderStatus === 'ready')) {
      db.prepare("UPDATE users SET role = 'reseller' WHERE id = ?").run(order.user_id);
    }

    res.json({ success: true });
  });

  app.post('/api/admin/users/:id/topup-ads', authenticate, isAdmin, (req, res) => {
    const { amount } = req.body;
    db.prepare('UPDATE users SET ads_balance = ads_balance + ? WHERE id = ?').run(amount, req.params.id);
    res.json({ success: true });
  });

  app.post('/api/feedback', (req: any, res) => {
    const { message, rating } = req.body;
    const token = req.cookies.token;
    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
      } catch (err) {}
    }
    
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    db.prepare('INSERT INTO feedback (user_id, message, rating) VALUES (?, ?, ?)').run(userId, message, rating || null);
    res.json({ success: true });
  });

  app.get('/api/admin/feedback', authenticate, isAdmin, (req, res) => {
    const feedback = db.prepare(`
      SELECT f.*, u.email as user_email 
      FROM feedback f 
      LEFT JOIN users u ON f.user_id = u.id 
      ORDER BY f.created_at DESC
    `).all();
    res.json(feedback);
  });

  app.get('/api/admin/analytics', authenticate, isAdmin, (req, res) => {
    const totalRevenue = db.prepare('SELECT SUM(amount_paid) as total FROM orders').get() as any;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const activeResellers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'reseller'").get() as any;
    const topStickers = db.prepare('SELECT title, orders_count FROM stickers ORDER BY orders_count DESC LIMIT 5').all();
    
    const topCategory = db.prepare(`
      SELECT c.title, SUM(s.orders_count) as total_orders
      FROM categories c
      JOIN stickers s ON c.id = s.category_id
      GROUP BY c.id
      ORDER BY total_orders DESC
      LIMIT 1
    `).get() as any;

    const referralStats = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL) as total_referred,
        (SELECT COUNT(*) FROM users) as total_users
    `).get() as any;

    const paymentRatio = db.prepare(`
      SELECT 
        SUM(CASE WHEN amount_paid >= total_amount THEN 1 ELSE 0 END) as full_paid,
        SUM(CASE WHEN amount_paid < total_amount AND amount_paid > 0 THEN 1 ELSE 0 END) as deposit_only,
        COUNT(*) as total
      FROM orders
    `).get() as any;

    res.json({
      totalRevenue: totalRevenue.total || 0,
      totalOrders: totalOrders.count,
      activeResellers: activeResellers.count,
      topStickers,
      topCategory: topCategory?.title || 'N/A',
      referralConversion: referralStats.total_users > 0 ? ((referralStats.total_referred / referralStats.total_users) * 100).toFixed(1) : 0,
      paymentRatio: {
        full: paymentRatio.total > 0 ? ((paymentRatio.full_paid / paymentRatio.total) * 100).toFixed(1) : 0,
        deposit: paymentRatio.total > 0 ? ((paymentRatio.deposit_only / paymentRatio.total) * 100).toFixed(1) : 0
      }
    });
  });

  app.get('/api/admin/users', authenticate, isAdmin, (req, res) => {
    const users = db.prepare(`
      SELECT 
        u.id, u.email, u.name, u.phone_number, u.role, u.store_credit, u.referral_code, u.campus, u.created_at, u.ads_balance,
        (SELECT COUNT(*) FROM users WHERE referred_by = u.referral_code) as referral_count,
        (SELECT COUNT(*) FROM orders o JOIN users u2 ON o.user_id = u2.id 
         WHERE u2.referred_by = u.referral_code AND o.package_type = 'mega' AND o.payment_status = 'verified' AND o.referral_cashed_out = 0) as referred_mega_orders,
        (SELECT COUNT(*) FROM orders o JOIN users u2 ON o.user_id = u2.id 
         WHERE u2.referred_by = u.referral_code AND (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) >= 20 AND o.payment_status = 'verified' AND o.referral_cashed_out = 0) as referred_normal_orders
      FROM users u 
      ORDER BY u.created_at DESC
    `).all();
    res.json(users);
  });

  app.post('/api/admin/users/:id/cash-out', authenticate, isAdmin, (req, res) => {
    const user: any = db.prepare('SELECT referral_code FROM users WHERE id = ?').get(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Mark all eligible referred orders as cashed out
    const result = db.prepare(`
      UPDATE orders 
      SET referral_cashed_out = 1 
      WHERE id IN (
        SELECT o.id 
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE u.referred_by = ? 
        AND o.payment_status = 'verified' 
        AND o.referral_cashed_out = 0
        AND (o.package_type = 'mega' OR (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) >= 20)
      )
    `).run(user.referral_code);

    res.json({ success: true, cashedOutCount: result.changes });
  });

  app.post('/api/admin/orders/clear-old', authenticate, isAdmin, (req, res) => {
    const { days } = req.body;
    const daysToKeep = days || 30;
    
    // Delete items first due to foreign key constraints
    db.prepare(`
      DELETE FROM order_items 
      WHERE order_id IN (SELECT id FROM orders WHERE created_at < datetime('now', '-' || ? || ' days'))
    `).run(daysToKeep);
    
    const result = db.prepare(`
      DELETE FROM orders 
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `).run(daysToKeep);
    
    res.json({ success: true, deletedCount: result.changes });
  });

  // Settings Management
  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsMap = (settings as any[]).reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    res.json(settingsMap);
  });

  app.post('/api/admin/settings', authenticate, isSuperAdmin, (req, res) => {
    const { settings } = req.body; // Expecting { key: value, ... }
    const update = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    
    const transaction = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        update.run(key, value);
      }
    });

    transaction(settings);
    res.json({ success: true });
  });

  // Category Management
  app.post('/api/admin/clear-old-orders', authenticate, isAdmin, (req, res) => {
    try {
      // Delete orders that are 'printed' or 'ready' and older than 1 month
      const result = db.prepare(`
        DELETE FROM orders 
        WHERE (order_status = 'printed' OR order_status = 'ready' OR order_status = 'cancelled')
        AND updated_at < datetime('now', '-1 month')
      `).run();
      
      res.json({ success: true, message: `${result.changes} old orders cleared.` });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to clear old orders: ' + err.message });
    }
  });

  app.post('/api/admin/categories', authenticate, isAdmin, (req, res) => {
    const { title } = req.body;
    db.prepare('INSERT INTO categories (title) VALUES (?)').run(title);
    res.json({ success: true });
  });

  app.delete('/api/admin/categories/:id', authenticate, isAdmin, (req, res) => {
    db.prepare('UPDATE stickers SET category_id = NULL WHERE category_id = ?').run(req.params.id);
    db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Sticker Management
  app.post('/api/admin/stickers', authenticate, isAdmin, uploadSticker.single('stickerImage'), (req: any, res) => {
    const { id, title, category_id, price, is_mega_eligible, tags, type } = req.body;
    const image_path = req.file ? req.file.path : req.body.image_path;
    
    const formattedId = id.startsWith('#') ? id : `#${id}`;

    try {
      db.prepare(`
        INSERT INTO stickers (id, title, category_id, price, is_mega_eligible, tags, image_path, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(formattedId, title, category_id, price, is_mega_eligible === '1' || is_mega_eligible === true ? 1 : 0, tags, image_path, type || 'sticker');
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/admin/stickers/:id', authenticate, isAdmin, (req, res) => {
    db.prepare('DELETE FROM stickers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- AD ROUTES ---
  app.get('/api/ads', (req, res) => {
    const ads = db.prepare('SELECT * FROM ads WHERE is_active = 1 ORDER BY created_at DESC').all();
    res.json(ads);
  });

  app.post('/api/admin/ads', authenticate, isAdmin, uploadAd.single('adVideo'), (req: any, res) => {
    const { title, destination_url, video_url: bodyVideoUrl } = req.body;
    const video_url = req.file ? `/uploads/ads/${req.file.filename}` : bodyVideoUrl;
    
    if (!title) return res.status(400).json({ error: 'Title is required' });

    db.prepare('INSERT INTO ads (title, video_url, destination_url) VALUES (?, ?, ?)').run(
      title, video_url, destination_url
    );
    res.json({ success: true });
  });

  app.delete('/api/admin/ads/:id', authenticate, isAdmin, (req, res) => {
    db.prepare('DELETE FROM ads WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- CAMPUS & PICKUP ROUTES ---
  app.get('/api/campuses', (req, res) => {
    const campuses = db.prepare('SELECT * FROM campuses WHERE is_active = 1').all();
    res.json(campuses);
  });

  app.get('/api/campuses/:id/pickup-points', (req, res) => {
    const points = db.prepare('SELECT * FROM pickup_points WHERE campus_id = ? AND is_active = 1').all(req.params.id);
    res.json(points);
  });

  app.get('/api/admin/campuses', authenticate, isAdmin, (req, res) => {
    const campuses = db.prepare('SELECT * FROM campuses').all() as any[];
    const campusesWithPoints = campuses.map(campus => {
      const points = db.prepare('SELECT * FROM pickup_points WHERE campus_id = ?').all(campus.id);
      return { ...campus, points };
    });
    res.json(campusesWithPoints);
  });

  app.post('/api/admin/campuses', authenticate, isAdmin, (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Campus name is required' });
    try {
      db.prepare('INSERT INTO campuses (name) VALUES (?)').run(name);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/admin/campuses/:id', authenticate, isAdmin, (req, res) => {
    const { name, is_active } = req.body;
    db.prepare('UPDATE campuses SET name = ?, is_active = ? WHERE id = ?').run(name, is_active ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/admin/campuses/:id', authenticate, isAdmin, (req, res) => {
    db.prepare('DELETE FROM pickup_points WHERE campus_id = ?').run(req.params.id);
    db.prepare('DELETE FROM campuses WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/admin/pickup-points', authenticate, isAdmin, (req, res) => {
    const { campus_id, name } = req.body;
    if (!campus_id || !name) return res.status(400).json({ error: 'Campus ID and point name are required' });
    db.prepare('INSERT INTO pickup_points (campus_id, name) VALUES (?, ?)').run(campus_id, name);
    res.json({ success: true });
  });

  app.delete('/api/admin/pickup-points/:id', authenticate, isAdmin, (req, res) => {
    db.prepare('DELETE FROM pickup_points WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
  } catch (err) {
    console.error('Server initialization error:', err);
    throw err;
  }
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
