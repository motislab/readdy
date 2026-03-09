import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { 
  ShoppingBag, 
  User, 
  LayoutDashboard, 
  Search, 
  Filter, 
  Package, 
  Zap, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  Menu,
  X,
  ChevronRight,
  Plus,
  Minus,
  Upload,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Home as HomeIcon,
  Info,
  Send,
  DollarSign,
  ChevronUp,
  ChevronDown,
  Copy,
  Sparkles,
  LayoutGrid,
  List,
  RefreshCw,
  MapPin,
  EyeOff,
  Eye,
  Trash2,
  Navigation,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- THEME ---
const ThemeContext = React.createContext<{ theme: 'dark' | 'light', toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => {},
});

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('vibe-theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('vibe-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => React.useContext(ThemeContext);

// --- TYPES ---
interface User {
  id: number;
  email: string;
  name?: string;
  phone_number?: string;
  nickname?: string;
  role: 'user' | 'reseller' | 'admin' | 'super_admin';
  store_credit: number;
  referral_code: string;
  campus: string;
  ads_balance: number;
}

interface Sticker {
  id: string;
  title: string;
  category_id: number;
  category_title: string;
  price: number;
  views: number;
  orders_count: number;
  is_mega_eligible: boolean;
  tags: string;
  image_path: string;
}

interface OrderItem {
  sticker_id: string;
  quantity: number;
  title: string;
  image_path: string;
  customization_text?: string;
}

interface Order {
  id: string;
  package_type: 'regular' | 'mega' | 'custom';
  total_amount: number;
  deposit_amount: number;
  amount_paid: number;
  remaining_balance: number;
  payment_status: string;
  order_status: string;
  cancellation_note?: string;
  created_at: string;
  screenshot_path?: string;
  sticker_ids?: string;
  name?: string;
  phone_number?: string;
  email?: string;
  items?: OrderItem[];
}

// --- UTILS ---
const apiFetch = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    throw err;
  }
};

// --- COMPONENTS ---

const Navbar = ({ user, onLogout }: { user: User | null, onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: 'Browse', path: '/explore', icon: Search },
    { name: 'Resellers', path: '/mega-builder', icon: Zap },
    { name: 'Rules and Regulations', path: '/rules', icon: Users },
    { name: 'Referrals', path: '/dashboard', icon: DollarSign },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary neon-pink-glow transition-transform group-hover:scale-110 overflow-hidden">
            <img 
              src="https://res.cloudinary.com/dd4fid5mp/image/upload/v1772727101/Gemini_Generated_Image_hwbqv2hwbqv2hwbq_mgdd19.png" 
              alt="Vibe Stickers" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Vibe Stickers
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5",
                location.pathname === link.path ? "text-primary" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Link to="/admin">
              <button className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
                Admin
              </button>
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <button className="bg-foreground/5 hover:bg-foreground/10 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  Dashboard
                </button>
              </Link>
              <button onClick={onLogout} className="p-2 text-foreground/40 hover:text-foreground transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all neon-pink-glow">
                Get Started
              </button>
            </Link>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-foreground/60 hover:bg-foreground/5 md:hidden"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                <button 
                  onClick={() => { toggleTheme(); setIsOpen(false); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors rounded-lg"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                {user ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                      <button className="w-full bg-foreground/5 text-foreground py-3 rounded-xl font-medium">Dashboard</button>
                    </Link>
                    <button onClick={() => { onLogout(); setIsOpen(false); }} className="w-full text-red-400 py-3 font-medium">Logout</button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold neon-pink-glow">Get Started</button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// --- PAGES ---

const Home = () => {
  const [trending, setTrending] = useState<Sticker[]>([]);
  const [marqueeText, setMarqueeText] = useState('Limited Edition • Vibe Only • Premium Quality • Custom Designs • Fast Delivery');

  useEffect(() => {
    apiFetch('/api/stickers/trending')
      .then(data => setTrending(data.slice(0, 8)))
      .catch(err => console.error('Failed to load trending stickers:', err));
    
    apiFetch('/api/settings')
      .then(data => {
        if (data.marquee_text) setMarqueeText(data.marquee_text);
      })
      .catch(err => console.error('Failed to load settings:', err));
  }, []);

  const packs = [
    {
      title: "Casual Pack",
      description: "Perfect for personalizing your laptop or phone.",
      price: "250 ETB",
      stickers: "20 Stickers",
      features: ["Water Resistant", "High Fidelity", "Custom Selection"],
      color: "blue"
    },
    {
      title: "Premium Pack",
      description: "The ultimate collection for true vibe enthusiasts.",
      price: "2,500 ETB",
      stickers: "250 Stickers",
      features: ["Reseller Eligible", "Bulk Discount", "Priority Support", "All Categories"],
      color: "pink",
      popular: true
    }
  ];

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--primary),transparent_10%)] opacity-[0.05]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-border text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles className="w-3 h-3" /> Welcome to Vibe Stickers
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-foreground mb-8 leading-[1.1]">
            Premium Digital <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-blue to-accent-cyan">Stickers</span> for Every Vibe
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto mb-12 font-medium">
            Discover thousands of unique, hand-crafted digital stickers. Build custom packs, become a reseller, and join our creative community.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/explore">
              <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-105 transition-all neon-pink-glow">
                Browse Collection
              </button>
            </Link>
            <Link to="/mega-builder">
              <button className="px-8 py-4 bg-foreground/5 text-foreground border border-border rounded-xl font-bold text-lg hover:bg-foreground/10 transition-all">
                Build Mega Pack
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground/20"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-foreground/20 to-transparent" />
        </motion.div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-10 w-64 h-64 bg-accent-blue/10 blur-[120px] rounded-full" />
      </section>

      {/* Marquee */}
      <div className="border-y border-border bg-foreground/[0.02] py-8 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-12 px-6">
              {marqueeText.split('•').map((part, idx) => (
                <div key={idx} className="flex items-center gap-12">
                  <span className="text-2xl md:text-4xl font-bold uppercase tracking-tighter text-foreground/40">
                    {part.trim()}
                  </span>
                  <Sparkles className="w-6 h-6 text-primary/40" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Cute & Kawaii', icon: '✨', color: 'from-pink-500/10' },
            { name: 'Gaming & Tech', icon: '🎮', color: 'from-blue-500/10' },
            { name: 'Sci-Fi & Space', icon: '🚀', color: 'from-purple-500/10' },
            { name: 'Food & Drinks', icon: '🍕', color: 'from-orange-500/10' },
          ].map((cat, i) => (
            <Link 
              key={i} 
              to={`/explore?category=${i + 1}`}
              className={cn(
                "group relative p-8 rounded-3xl glass overflow-hidden transition-all duration-300 hover:scale-[1.02]",
                "bg-gradient-to-br to-transparent",
                cat.color
              )}
            >
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="text-xl font-bold text-foreground mb-1">{cat.name}</h3>
              <p className="text-foreground/40 text-sm">Explore Collection</p>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-5 h-5 text-foreground/60" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Stickers */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" /> Trending Now
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">Featured Designs</h2>
            <p className="text-foreground/40 mt-2 max-w-md">The most popular stickers in our community this week. Hand-picked for their unique vibe.</p>
          </div>
          <Link to="/explore">
            <button className="group flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors text-sm font-bold">
              View All Collection <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
          {trending.map((sticker, i) => (
            <motion.div
              key={sticker.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-square glass rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
              <img 
                src={sticker.image_path} 
                alt={sticker.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex flex-col justify-end p-3 backdrop-blur-[2px]">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-[10px] font-bold text-white truncate mb-1">{sticker.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-primary font-bold uppercase tracking-widest">{sticker.category_title}</span>
                    <span className="text-[10px] font-bold text-white">{sticker.price} ETB</span>
                  </div>
                </div>
              </div>

              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Packs Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_70%)] opacity-[0.03] pointer-events-none" />
        
        <div className="text-center mb-20 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">Choose Your Pack</h2>
          <p className="text-foreground/40 max-w-2xl mx-auto text-lg">From casual collectors to resellers, we have the perfect pack for you. High-quality prints, vibrant colors, and durable materials.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto relative z-10">
          {packs.map((pack, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={cn(
                "relative p-10 rounded-[40px] glass overflow-hidden group transition-all duration-500 hover:translate-y-[-8px]",
                pack.popular ? "border-primary/40 ring-1 ring-primary/20" : "hover:border-foreground/20"
              )}
            >
              {pack.popular && (
                <div className="absolute top-8 right-8 px-5 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-full neon-pink-glow z-20">
                  Most Popular
                </div>
              )}
              
              <div className="relative mb-10">
                <div className={cn(
                  "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 relative z-10",
                  pack.color === 'pink' ? "bg-primary/20 text-primary" : "bg-accent-blue/20 text-accent-blue"
                )}>
                  <Package className="w-8 h-8" />
                </div>
                <div className={cn(
                  "absolute -top-4 -left-4 w-24 h-24 blur-3xl opacity-20 rounded-full",
                  pack.color === 'pink' ? "bg-primary" : "bg-accent-blue"
                )} />
              </div>
              
              <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight">{pack.title}</h3>
              <p className="text-foreground/50 text-base mb-8 leading-relaxed font-medium">{pack.description}</p>
              
              <div className="flex items-baseline gap-3 mb-10">
                <span className="text-5xl font-bold text-foreground tracking-tighter">{pack.price}</span>
                <span className="text-foreground/30 text-lg font-medium">/ {pack.stickers}</span>
              </div>
              
              <div className="space-y-5 mb-12">
                {pack.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 text-foreground/70 font-medium">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-foreground/5 flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-accent-cyan" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Link to={pack.color === 'pink' ? "/mega-builder" : "/explore"}>
                <button className={cn(
                  "w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300",
                  pack.color === 'pink' 
                    ? "bg-primary text-primary-foreground hover:scale-[1.02] neon-pink-glow active:scale-95" 
                    : "bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border active:scale-95"
                )}>
                  Get Started Now
                </button>
              </Link>

              {/* Decorative background element */}
              <div className={cn(
                "absolute -bottom-20 -right-20 w-64 h-64 blur-[100px] opacity-10 rounded-full transition-opacity duration-500 group-hover:opacity-20",
                pack.color === 'pink' ? "bg-primary" : "bg-accent-blue"
              )} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Explore = ({ user }: { user: User | null }) => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const catId = searchParams.get('category');
    if (catId) setSelectedCategory(catId);
  }, [searchParams]);

  useEffect(() => {
    apiFetch('/api/categories')
      .then(setCategories)
      .catch(err => console.error('Failed to load categories:', err));
    
    apiFetch('/api/ads')
      .then(setAds)
      .catch(err => console.error('Failed to load ads:', err));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (search) params.append('search', search);
    apiFetch(`/api/stickers?${params.toString()}`)
      .then(setStickers)
      .catch(err => console.error('Failed to load stickers:', err));
  }, [selectedCategory, search]);

  const toggleCart = (id: string) => {
    if (cart.includes(id)) {
      setCart(cart.filter(i => i !== id));
    } else {
      setCart([...cart, id]);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/explore' } });
      return;
    }
    navigate('/checkout', { state: { stickerIds: cart } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      {/* Ads Section */}
      {ads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map(ad => (
            <a 
              key={ad.id} 
              href={ad.destination_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative aspect-video bg-card rounded-[32px] overflow-hidden group shadow-xl"
            >
              {ad.video_url?.endsWith('.mp4') || ad.video_url?.includes('video') ? (
                <video 
                  src={ad.video_url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <img 
                  src={ad.video_url || 'https://picsum.photos/seed/ad/800/450'} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-amber-400 text-zinc-900 text-[10px] font-bold rounded-full">AD</span>
                  <h3 className="text-xl font-bold text-white">{ad.title}</h3>
                </div>
                <p className="text-white/70 text-sm">Click to explore more</p>
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/40 mb-4">Categories</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCategory('')}
                className={cn(
                  "block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  selectedCategory === '' ? "bg-foreground text-background" : "text-foreground/60 hover:bg-foreground/5"
                )}
              >
                All Designs
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className={cn(
                    "block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    selectedCategory === cat.id.toString() ? "bg-foreground text-background" : "text-foreground/60 hover:bg-foreground/5"
                  )}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input 
                type="text" 
                placeholder="Search stickers, tags, themes..."
                className="w-full pl-12 pr-4 py-3 bg-foreground/5 rounded-2xl border border-border text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {cart.length > 0 && (
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <button 
                    onClick={handleCheckout}
                    className="w-full bg-foreground text-background px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 animate-bounce whitespace-nowrap"
                  >
                    Order Pack ({cart.length})
                  </button>
                </div>
              </div>
            )}
          </div>

          {cart.length > 20 && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-sm flex items-center gap-3 animate-pulse">
              <Info className="w-5 h-5 shrink-0" />
              <p>
                <b>Note:</b> You've selected {cart.length} stickers. A standard pack is 20 stickers for 250 ETB. 
                Additional stickers are 14.50 ETB each. Consider starting a second pack for better value!
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {stickers.map(sticker => (
              <div key={sticker.id} className="group bg-foreground/5 border border-border rounded-2xl sm:rounded-3xl p-2 sm:p-3 hover:bg-foreground/[0.08] transition-all">
                <div className="aspect-square bg-foreground/5 rounded-xl sm:rounded-2xl overflow-hidden mb-2 sm:mb-4 relative">
                   <img 
                    src={sticker.image_path} 
                    alt={sticker.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 rotate-[-45deg]">
                    <span className="text-foreground font-black text-2xl tracking-tighter select-none">VIBE</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button 
                      onClick={() => toggleCart(sticker.id)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all",
                        cart.includes(sticker.id) ? "bg-primary text-primary-foreground" : "bg-background text-foreground hover:scale-110"
                      )}
                    >
                      {cart.includes(sticker.id) ? <CheckCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="px-1">
                  <h4 className="font-bold text-foreground truncate">{sticker.title}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-foreground/40">{sticker.category_title}</span>
                    <span className="text-sm font-bold text-foreground">{sticker.price} ETB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

const MegaPackBuilder = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiFetch('/api/stickers?megaOnly=true'),
      apiFetch('/api/categories')
    ]).then(([stickerData, catData]) => {
      setStickers(stickerData);
      setCategories(catData);
    }).catch(err => console.error('Failed to load mega builder data:', err));
  }, []);

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else if (selected.length < 50) {
      setSelected([...selected, id]);
    }
  };

  const filteredStickers = stickers.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                         (s.tags && s.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === '' || s.category_id.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-zinc-900 rounded-[40px] p-8 md:p-12 text-white mb-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">Mega Pack Builder</h1>
          <p className="text-zinc-400 max-w-md">Select between 20 and 50 unique designs. Each will be printed 5 times (up to 250 total). Become a campus reseller today.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl text-center min-w-[200px]">
          <div className="text-5xl font-bold mb-2">{selected.length} <span className="text-xl text-zinc-500">/ 50</span></div>
          <p className="text-sm text-zinc-400 mb-6">Designs Selected (Min: 20)</p>
          <button 
            disabled={selected.length < 20 || selected.length > 50}
            onClick={() => navigate('/checkout', { state: { stickerIds: selected, packageType: 'mega' } })}
            className="w-full bg-white text-zinc-900 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 transition-colors"
          >
            Order Mega Pack
          </button>
          <p className="mt-4 text-xs font-bold text-zinc-500">TOTAL: 2,500 ETB</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4">Categories</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setSelectedCategory('')}
                className={cn(
                  "block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  selectedCategory === '' ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                )}
              >
                All Designs
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className={cn(
                    "block w-full text-left px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    selectedCategory === cat.id.toString() ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-8">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search designs for your mega pack..."
              className="w-full pl-12 pr-4 py-3 bg-zinc-100 rounded-2xl border-none focus:ring-2 focus:ring-zinc-900 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredStickers.map(sticker => (
              <div 
                key={sticker.id} 
                onClick={() => toggleSelect(sticker.id)}
                className={cn(
                  "cursor-pointer group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 transition-all",
                  selected.includes(sticker.id) ? "border-zinc-900 shadow-2xl scale-95" : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img src={sticker.image_path} alt={sticker.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                {selected.includes(sticker.id) && (
                  <div className="absolute inset-0 bg-zinc-900/40 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-[10px] font-bold text-white truncate">{sticker.title}</p>
                </div>
              </div>
            ))}
          </div>
          {filteredStickers.length === 0 && (
            <div className="text-center py-20 bg-zinc-50 rounded-[40px]">
              <p className="text-zinc-400">No designs found matching your search.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const Checkout = ({ user }: { user: User | null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { stickerIds, packageType = 'regular' } = location.state || {};
  const [useCredit, setUseCredit] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CBE');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);

  useEffect(() => {
    if (user && user.campus) {
      // First fetch all campuses to find the ID of the user's campus
      apiFetch('/api/campuses')
        .then(campuses => {
          const userCampus = campuses.find((c: any) => c.name === user.campus);
          if (userCampus) {
            return apiFetch(`/api/campuses/${userCampus.id}/pickup-points`);
          }
          return [];
        })
        .then(points => {
          setPickupPoints(points);
          if (points.length > 0) setPickupLocation(points[0].name);
          else setPickupLocation('Custom (Contact Support)');
        })
        .catch(console.error);
    }
  }, [user]);

  if (!stickerIds) return <div className="p-20 text-center text-white/60">No items in cart</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  const totalAmount = packageType === 'mega' ? 2500 : (stickerIds.length < 20 ? stickerIds.length * 14.50 : 250 + (stickerIds.length - 20) * 14.50);
  const depositRequired = packageType === 'mega' ? 2500 : Math.min(100, totalAmount);
  const creditToUse = useCredit ? Math.min(user.store_credit, totalAmount) : 0;
  const finalTotal = totalAmount - creditToUse;

  const handlePlaceOrder = async () => {
    try {
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType, stickerIds, paymentMethod, useCredit, pickupLocation })
      });
      if (data.success) {
        navigate(`/order-confirmation/${data.orderId}`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-10 text-white">Checkout</h1>
      
      {packageType === 'regular' && stickerIds.length < 20 && (
        <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-500">Small Batch Pricing</h4>
            <p className="text-sm text-amber-200/60">
              You've selected {stickerIds.length} stickers. Since this is less than a standard 20-sticker pack (250 ETB), 
              you are paying the individual sticker price of 14.50 ETB per sticker.
            </p>
            <p className="text-xs font-bold text-amber-500 mt-2">
              Total: {stickerIds.length} × 14.50 = {totalAmount.toFixed(2)} ETB
            </p>
          </div>
        </div>
      )}

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-center pb-6 border-b border-white/10">
            <div>
              <h3 className="font-bold text-lg text-white">{packageType === 'mega' ? 'Mega Pack' : 'Regular Pack'}</h3>
              <p className="text-white/40">{stickerIds.length} designs selected</p>
            </div>
            <span className="text-xl font-bold text-white">{totalAmount} ETB</span>
          </div>

          {user.store_credit > 0 && (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg neon-pink-glow">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Store Credit</p>
                  <p className="text-xs text-white/40">Available: {user.store_credit} ETB</p>
                </div>
              </div>
              <button 
                onClick={() => setUseCredit(!useCredit)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  useCredit ? "bg-primary text-white neon-pink-glow" : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
                )}
              >
                {useCredit ? 'Applied' : 'Apply'}
              </button>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">Pickup Location</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pickupPoints.map(point => (
                <button 
                  key={point.id}
                  onClick={() => setPickupLocation(point.name)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all",
                    pickupLocation === point.name ? "border-primary bg-primary/10 text-white" : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                  )}
                >
                  <p className="font-bold">{point.name}</p>
                </button>
              ))}
              <button 
                onClick={() => setPickupLocation('Custom (Contact Support)')}
                className={cn(
                  "p-4 rounded-2xl border-2 text-left transition-all",
                  pickupLocation === 'Custom (Contact Support)' ? "border-primary bg-primary/10 text-white" : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                )}
              >
                <p className="font-bold">Custom (Contact Support)</p>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-white/40">Payment Method</h4>
            <div className="grid grid-cols-2 gap-4">
              {['CBE', 'Telebirr', 'BOA', 'Dashin Bank'].map(method => (
                <button 
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    "p-4 rounded-2xl border-2 text-left transition-all",
                    paymentMethod === method ? "border-primary bg-primary/10 text-white" : "border-white/5 bg-white/5 text-white/40 hover:border-white/20"
                  )}
                >
                  <p className="font-bold">{method}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 space-y-2">
            <div className="flex justify-between text-white/40">
              <span>Subtotal</span>
              <span>{totalAmount} ETB</span>
            </div>
            {useCredit && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Credit Applied</span>
                <span>-{creditToUse} ETB</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10 text-white">
              <span>Total to Pay</span>
              <span>{finalTotal} ETB</span>
            </div>
            <p className="text-xs text-white/20 text-center pt-4">
              * A deposit of <b className="text-white/40">{depositRequired} ETB</b> is required to start printing.
            </p>
          </div>
        </div>
        <div className="p-8 bg-white/5 border-t border-white/10">
          <button 
            onClick={handlePlaceOrder}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg neon-pink-glow"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderConfirmation = () => {
  const { id: orderId } = useParams();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/settings').then(setSettings).catch(console.error);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-10">
      <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg neon-pink-glow">
        <CheckCircle className="w-10 h-10" />
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-4 text-white">Order Placed!</h1>
        <p className="text-white/40">Your Order ID is <span className="font-bold text-white">{orderId}</span></p>
      </div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[40px] text-left space-y-6">
        <h3 className="font-bold text-xl text-foreground">Next Steps: Payment</h3>
        <div className="bg-foreground/5 p-6 rounded-3xl border border-border space-y-4 mb-6">
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Account Details ({settings?.bank_name || 'Esuyalew Workneh'})</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-foreground/5 rounded-xl border border-border">
              <p className="text-xs font-bold text-foreground/40">CBE</p>
              <p className="font-mono font-bold text-foreground">{settings?.cbe_account || '1000366254227'}</p>
            </div>
            <div className="p-3 bg-foreground/5 rounded-xl border border-border">
              <p className="text-xs font-bold text-foreground/40">BOA</p>
              <p className="font-mono font-bold text-foreground">{settings?.boa_account || '251507929'}</p>
            </div>
            <div className="p-3 bg-foreground/5 rounded-xl border border-border">
              <p className="text-xs font-bold text-foreground/40">Telebirr</p>
              <p className="font-mono font-bold text-foreground">{settings?.telebirr_account || '0991349404'}</p>
            </div>
            <div className="p-3 bg-foreground/5 rounded-xl border border-border">
              <p className="text-xs font-bold text-foreground/40">Dashin Bank</p>
              <p className="font-mono font-bold text-foreground">{settings?.dashin_account || '5080646857011'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold shadow-lg neon-pink-glow">1</div>
            <p className="text-foreground/60">Transfer the deposit amount to our bank account. Use <span className="font-bold text-foreground">{orderId}</span> as the payment reason.</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold shadow-lg neon-pink-glow">2</div>
            <p className="text-foreground/60">Take a screenshot of the successful transaction.</p>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-bold shadow-lg neon-pink-glow">3</div>
            <p className="text-foreground/60">Send the screenshot to our Telegram support to verify your order.</p>
          </div>
        </div>

        <div className="pt-6">
          <a 
            href={settings?.telegram_link || "https://t.me/vsticker_aastu"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-[#229ED9] text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Send className="w-5 h-5" />
            Send Screenshot via Telegram
          </a>
        </div>
      </div>
      
      <Link to="/dashboard" className="inline-block text-foreground/40 hover:text-foreground font-medium transition-colors">
        Go to Dashboard
      </Link>
    </div>
  );
};

const Dashboard = ({ user }: { user: User | null }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [viewingNoteOrderId, setViewingNoteOrderId] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [ordersData, statsData, settingsData] = await Promise.all([
        apiFetch('/api/my-orders'),
        apiFetch('/api/referrals/stats'),
        apiFetch('/api/settings')
      ]);
      setOrders(ordersData);
      setStats(statsData);
      setSettings(settingsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 20 seconds to keep user updated on order status
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await apiFetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      setCancellingOrderId(null);
      if (res.success) {
        setNotification({ message: res.message || 'Cancellation requested successfully', type: 'success' });
      } else {
        setNotification({ message: res.error || 'Failed to request cancellation', type: 'error' });
      }
      await fetchData();
    } catch (err: any) {
      setNotification({ message: err.message || 'An error occurred', type: 'error' });
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMsg) return;
    setIsSendingFeedback(true);
    try {
      await apiFetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedbackMsg, rating: feedbackRating })
      });
      alert('Thank you for your feedback!');
      setFeedbackMsg('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingNickname(true);
    try {
      await apiFetch('/api/auth/nickname', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
      });
      alert('Nickname updated!');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting password change...');
    if (newPassword.length < 6) return alert('New password must be at least 6 characters');
    setIsUpdatingPassword(true);
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      console.log('Password change response:', res);
      alert('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      console.error('Password change error:', err);
      alert(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, {user.name || user.nickname || user.email.split('@')[0]}
          </h1>
          {user.name && user.nickname && (
            <p className="text-foreground/40 font-medium">@{user.nickname}</p>
          )}
          <p className="text-foreground/60">Manage your orders and referrals</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-foreground/5 border border-border px-6 py-3 rounded-2xl">
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Store Credit</p>
            <p className="text-xl font-bold text-foreground">{user.store_credit} ETB</p>
          </div>
          <div className="bg-foreground/5 border border-border px-6 py-3 rounded-2xl">
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">Ads Balance</p>
            <p className="text-xl font-bold text-foreground">{user.ads_balance || 0} ETB</p>
          </div>
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl shadow-lg neon-pink-glow">
            <p className="text-xs font-bold text-primary-foreground/40 uppercase tracking-widest">Role</p>
            <p className="text-xl font-bold capitalize">{user.role}</p>
          </div>
          <button 
            onClick={() => setNotification({ message: 'To top up your ads balance, please contact our support at esuyalew.workneh@aastustudent.edu.et with your user email and the amount you wish to add.', type: 'success' })}
            className="bg-foreground/5 border border-border text-foreground px-6 py-4 rounded-2xl font-bold hover:bg-foreground/10 transition-all flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Top up Ads
          </button>
        </div>
      </header>

      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <div className={cn(
            "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold",
            notification.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          )}>
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-sm">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Referral Section */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-8 space-y-6">
            <h3 className="text-xl font-bold text-white">Profile Settings</h3>
            <form onSubmit={handleUpdateNickname} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Your Nickname</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter nickname"
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary text-white"
                  />
                  <button 
                    disabled={isUpdatingNickname}
                    className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-50 shadow-lg neon-pink-glow"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>

            <hr className="border-white/10" />

            <h3 className="text-xl font-bold text-white">Security</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary text-white"
                    required
                  />
                </div>
                <button 
                  disabled={isUpdatingPassword}
                  className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-white/10 transition-all"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>

            <hr className="border-white/10" />

            <h3 id="feedback-section" className="text-xl font-bold text-white">Feedback</h3>
            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Your Thoughts</label>
                <textarea 
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  placeholder="Tell us how we can improve..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-primary text-white min-h-[100px] resize-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button 
                      key={r}
                      type="button"
                      onClick={() => setFeedbackRating(r)}
                      className={cn(
                        "w-10 h-10 rounded-xl font-bold transition-all",
                        feedbackRating === r ? "bg-primary text-white neon-pink-glow" : "bg-white/5 text-white/40 hover:text-white"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                disabled={isSendingFeedback}
                className="w-full bg-primary text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 shadow-lg neon-pink-glow"
              >
                {isSendingFeedback ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>

            <hr className="border-white/10" />

            <h3 className="text-xl font-bold text-white">Referral Program</h3>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-bold text-white/40 uppercase mb-1">Your Code</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-mono font-bold tracking-tighter text-white">{user.referral_code}</span>
                <button 
                  onClick={() => {
                    const promo = settings?.referral_promo_message || "Hey! Join VibeStickers and carry the vibe. Use my referral code: {code} and get started at {url}. Let's make our campus colorful!";
                    const url = settings?.site_url || window.location.origin;
                    const shareText = promo.replace('{code}', user.referral_code).replace('{url}', url);
                    navigator.clipboard.writeText(shareText);
                    setNotification({ message: 'Referral message copied to clipboard!', type: 'success' });
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {stats?.eligibleOrdersCount >= 5 && (
              <button 
                onClick={() => {
                  setFeedbackMsg(`I would like to request a cash-in for my referral rewards. My banking details are: \nBank: \nAccount Name: \nAccount Number: `);
                  document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <DollarSign className="w-5 h-5" />
                Request Cash-in
              </button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-2xl font-bold text-white">{stats?.totalReferred || 0}</p>
                <p className="text-xs text-white/40">Invited</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-2xl font-bold text-white">{stats?.eligibleOrdersCount || 0}</p>
                <p className="text-xs text-white/40">Eligible Orders</p>
              </div>
            </div>

            {stats?.referredOrders?.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Referred Orders</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {stats.referredOrders.map((o: any) => (
                    <div key={o.id} className="p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold text-white">{o.id}</p>
                        <p className="text-[10px] text-white/40">{o.user_email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest",
                          o.payment_status === 'verified' ? "bg-emerald-500/20 text-emerald-500" : "bg-amber-500/20 text-amber-500"
                        )}>
                          {o.payment_status}
                        </span>
                        {o.referral_cashed_out === 1 && (
                          <span className="text-[8px] font-bold text-white/40 uppercase">Cashed Out</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-xs text-white/20 italic">Earn 25 ETB for every friend's first order. Resellers earn 50 ETB!</p>
          </div>
        </div>

        {/* Orders Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">My Orders</h3>
            <div className="flex items-center gap-3">
              <p className="text-[10px] text-white/40 font-bold uppercase">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              <button 
                onClick={fetchData}
                disabled={isRefreshing}
                className={cn(
                  "p-2 bg-white/5 text-white/60 rounded-xl hover:text-white transition-all",
                  isRefreshing && "animate-spin"
                )}
                title="Refresh Orders"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-20 text-center bg-white/5 rounded-[32px] border-2 border-dashed border-white/10">
                <Package className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40">No orders yet. Start exploring!</p>
                <Link to="/explore" className="mt-4 inline-block text-primary font-bold underline">Go to Shop</Link>
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 hover:bg-white/[0.08] transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{order.id}</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        order.order_status === 'pending_payment' ? "bg-amber-500/20 text-amber-500" :
                        order.order_status === 'pending_verification' ? "bg-accent-blue/20 text-accent-blue" :
                        order.order_status === 'verified_deposit' ? "bg-indigo-500/20 text-indigo-500" :
                        order.order_status === 'printing' ? "bg-primary/20 text-primary animate-pulse" :
                        order.order_status === 'printed' ? "bg-emerald-500/20 text-emerald-500" :
                        order.order_status === 'ready' ? "bg-green-500/20 text-green-500" :
                        order.order_status === 'cancelled' ? "bg-rose-500/20 text-rose-500" :
                        "bg-white/5 text-white/60"
                      )}>
                        {order.order_status === 'printing' ? 'Processing / Printing' : 
                         order.order_status === 'printed' ? 'Printed / Ready for Pickup' :
                         order.order_status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-white/40 capitalize">{order.package_type} Pack • {new Date(order.created_at).toLocaleDateString()}</p>
                    
                    <button 
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      className="text-[10px] font-bold text-white/40 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 mt-2"
                    >
                      {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                      {expandedOrderId === order.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {expandedOrderId === order.id && (
                      <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex justify-between items-center">
                          <p className="text-[10px] font-bold text-white/40 uppercase">Sticker IDs</p>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(order.sticker_ids || '');
                              setNotification({ message: 'Copied!', type: 'success' });
                            }}
                            className="text-[10px] font-bold text-primary hover:underline"
                          >
                            Copy All
                          </button>
                        </div>
                        <p className="text-xs font-mono text-white/60 break-words">{order.sticker_ids}</p>
                        <div className="grid grid-cols-5 gap-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-white/10">
                              <img src={item.image_path} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                        </div>
                        {order.pickup_location && (
                          <div className="pt-2 border-t border-white/5">
                            <p className="text-[10px] font-bold text-white/40 uppercase">Pickup Location</p>
                            <p className="text-xs text-white/80 font-bold">{order.pickup_location}</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {order.items && order.items.length > 0 && (
                      <div className="flex -space-x-2 overflow-hidden py-2">
                        {order.items.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-white/5 overflow-hidden">
                            <img src={item.image_path} alt={item.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                        {order.items.length > 5 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-primary text-white text-[10px] font-bold">
                            +{order.items.length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    {order.cancellation_note && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        {viewingNoteOrderId === order.id ? (
                          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl animate-in fade-in zoom-in-95 duration-200 shadow-inner">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                  order.order_status === 'cancelled' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                                )}>
                                  {order.order_status === 'cancelled' ? 'Approved' : 'Rejected'}
                                </span>
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Admin Response</span>
                              </div>
                              <button 
                                onClick={() => setViewingNoteOrderId(null)}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                              >
                                <X className="w-4 h-4 text-white/40" />
                              </button>
                            </div>
                            <p className="text-sm text-white/80 leading-relaxed font-medium bg-white/5 p-4 rounded-2xl border border-white/10">
                              {order.cancellation_note}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Cancellation Update</p>
                            <button 
                              onClick={() => setViewingNoteOrderId(order.id)}
                              className={cn(
                                "w-full sm:w-auto px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95",
                                order.order_status === 'cancelled' 
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                                  : "bg-rose-600 text-white hover:bg-rose-700"
                              )}
                            >
                              {order.order_status === 'cancelled' ? (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  View Approval Details
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4" />
                                  View Rejection Details
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs font-bold text-white/40 uppercase">Paid</p>
                      <p className="font-bold text-white">{order.amount_paid} ETB</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white/40 uppercase">Balance</p>
                      <p className="font-bold text-rose-500">{order.remaining_balance} ETB</p>
                    </div>
                    {order.order_status === 'pending_payment' && (
                      <Link to={`/order-confirmation/${order.id}`} className="p-2 bg-primary text-white rounded-xl shadow-lg neon-pink-glow">
                        <Upload className="w-5 h-5" />
                      </Link>
                    )}
                    {order.order_status === 'cancelled' && (
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 text-rose-500">
                          <XCircle className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Cancelled</span>
                        </div>
                        <button 
                          onClick={() => {
                            const feedbackSection = document.getElementById('feedback-section');
                            if (feedbackSection) {
                              feedbackSection.scrollIntoView({ behavior: 'smooth' });
                              setFeedbackMsg(`Refund Request for Order #${order.id}: [Enter Bank Name & Account Number]`);
                            }
                          }}
                          className="text-[9px] font-bold text-white/40 underline hover:text-white transition-colors"
                        >
                          Request Refund via Feedback
                        </button>
                      </div>
                    )}
                    {!['printing', 'printed', 'cancelled'].includes(order.order_status) && (
                      <div className="flex items-center gap-2">
                        {cancellingOrderId === order.id ? (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                            <button 
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-4 py-2 bg-rose-600 text-white text-[10px] font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg"
                            >
                              Confirm Cancel
                            </button>
                            <button 
                              onClick={() => setCancellingOrderId(null)}
                              className="px-4 py-2 bg-white/5 text-white/60 text-[10px] font-bold rounded-xl hover:text-white transition-colors"
                            >
                              Back
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setCancellingOrderId(order.id)}
                            className="p-2 bg-white/5 text-white/40 rounded-xl hover:text-rose-500 transition-colors"
                            title="Cancel Order"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLocations = () => {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [newCampusName, setNewCampusName] = useState('');
  const [newPointName, setNewPointName] = useState('');
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCampuses = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/campuses');
      setCampuses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const handleAddCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampusName) return;
    try {
      await apiFetch('/api/admin/campuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCampusName })
      });
      setNewCampusName('');
      fetchCampuses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateCampus = async (id: number, name: string, is_active: boolean) => {
    try {
      await apiFetch(`/api/admin/campuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, is_active })
      });
      fetchCampuses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCampus = async (id: number) => {
    if (!window.confirm('Are you sure? This will delete all pickup points for this campus too.')) return;
    try {
      await apiFetch(`/api/admin/campuses/${id}`, { method: 'DELETE' });
      fetchCampuses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampusId || !newPointName) return;
    try {
      await apiFetch('/api/admin/pickup-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campus_id: selectedCampusId, name: newPointName })
      });
      setNewPointName('');
      fetchCampuses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePoint = async (id: number) => {
    try {
      await apiFetch(`/api/admin/pickup-points/${id}`, { method: 'DELETE' });
      fetchCampuses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Campus & Pickup Management</h2>
        <button onClick={fetchCampuses} className="p-2 text-white/40 hover:text-white transition-colors">
          <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Campus Management */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Add Campus
          </h3>
          <form onSubmit={handleAddCampus} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Campus Name (e.g. AASTU)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-primary"
              value={newCampusName}
              onChange={(e) => setNewCampusName(e.target.value)}
            />
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all">
              Add
            </button>
          </form>

          <div className="space-y-3">
            {campuses.map(campus => (
              <div key={campus.id} className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer",
                selectedCampusId === campus.id ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 hover:border-white/20"
              )} onClick={() => setSelectedCampusId(campus.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      className="bg-transparent text-white font-bold outline-none focus:border-b border-primary"
                      value={campus.name}
                      onChange={(e) => handleUpdateCampus(campus.id, e.target.value, campus.is_active)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", campus.is_active ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40")}>
                      {campus.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUpdateCampus(campus.id, campus.name, !campus.is_active); }}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                      {campus.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteCampus(campus.id); }}
                      className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-white/40 mt-1">{campus.points?.length || 0} Pickup Points</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pickup Points Management */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-accent-blue" /> Pickup Points
          </h3>
          
          {selectedCampusId ? (
            <>
              <p className="text-sm text-white/40">Managing points for: <b className="text-white">{campuses.find(c => c.id === selectedCampusId)?.name}</b></p>
              <form onSubmit={handleAddPoint} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Point Name (e.g. Gate 1)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:ring-2 focus:ring-primary"
                  value={newPointName}
                  onChange={(e) => setNewPointName(e.target.value)}
                />
                <button type="submit" className="bg-accent-blue text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition-all">
                  Add
                </button>
              </form>

              <div className="space-y-2">
                {campuses.find(c => c.id === selectedCampusId)?.points?.map((point: any) => (
                  <div key={point.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-white text-sm">{point.name}</span>
                    <button 
                      onClick={() => handleDeletePoint(point.id)}
                      className="p-2 text-rose-500/40 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {(!campuses.find(c => c.id === selectedCampusId)?.points || campuses.find(c => c.id === selectedCampusId)?.points.length === 0) && (
                  <p className="text-center py-8 text-white/20 text-sm">No pickup points added yet.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                <MapPin className="w-8 h-8" />
              </div>
              <p className="text-white/40 max-w-[200px]">Select a campus on the left to manage its pickup points.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Admin = ({ currentUser }: { currentUser: User | null }) => {
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      alert('Settings saved successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter">Access Denied</h1>
        <p className="text-zinc-500">You do not have permission to view this page.</p>
        <Link to="/" className="inline-block bg-zinc-900 text-white px-8 py-3 rounded-full font-bold">
          Go Home
        </Link>
      </div>
    );
  }

  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [stickers, setStickers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'orders' | 'stickers' | 'users' | 'ads' | 'feedback' | 'settings' | 'locations'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'unverified' | 'unprinted' | 'cancelled'>('all');
  const [topupAmount, setTopupAmount] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  // Form states
  const [newCat, setNewCat] = useState('');
  const [newAd, setNewAd] = useState({ title: '', video_url: '', destination_url: '' });
  const [adFile, setAdFile] = useState<File | null>(null);
  const [newSticker, setNewSticker] = useState({
    id: '',
    title: '',
    category_id: '',
    price: 14.50,
    is_mega_eligible: true,
    tags: '',
    image_path: '',
    type: 'sticker'
  });
  const [stickerFile, setStickerFile] = useState<File | null>(null);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const endpoints = [
        { key: 'orders', url: '/api/admin/orders' },
        { key: 'analytics', url: '/api/admin/analytics' },
        { key: 'categories', url: '/api/categories' },
        { key: 'stickers', url: '/api/stickers' },
        { key: 'users', url: '/api/admin/users' },
        { key: 'ads', url: '/api/ads' },
        { key: 'feedback', url: '/api/admin/feedback' },
        { key: 'settings', url: '/api/settings' }
      ];

      const results = await Promise.allSettled(endpoints.map(e => apiFetch(e.url)));
      
      const data: any = {};
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          data[endpoints[index].key] = result.value;
        } else {
          console.error(`Failed to fetch ${endpoints[index].key}:`, result.reason);
          errors.push(endpoints[index].key);
        }
      });

      if (data.orders) setOrders(data.orders);
      if (data.analytics) setAnalytics(data.analytics);
      if (data.categories) setCategories(data.categories);
      if (data.stickers) setStickers(data.stickers);
      if (data.users) setUsers(data.users);
      if (data.ads) setAds(data.ads);
      if (data.feedback) setFeedback(data.feedback);
      if (data.settings) setSettings(data.settings);

      if (errors.length > 0) {
        setNotification({ 
          message: `Some data failed to load: ${errors.join(', ')}. Please try again.`, 
          type: 'error' 
        });
      } else {
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setNotification({ message: 'Failed to load admin data: ' + (err.message || 'Unknown error'), type: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearOldOrders = async () => {
    if (!window.confirm('Are you sure you want to clear orders older than 1 month? This action cannot be undone.')) return;
    try {
      const res = await apiFetch('/api/admin/orders/clear-old', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days: 30 })
      });
      setNotification({ message: `Successfully cleared ${res.deletedCount} old orders.`, type: 'success' });
      fetchData();
    } catch (err: any) {
      setNotification({ message: err.message, type: 'error' });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.name && order.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.email && order.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.phone_number && order.phone_number.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (orderFilter === 'unverified') return order.order_status === 'pending_verification';
    if (orderFilter === 'unprinted') return order.order_status === 'verified_deposit' || order.order_status === 'printing';
    if (orderFilter === 'cancelled') return order.order_status === 'cancelled';
    
    return true;
  });
  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newAd.title);
    formData.append('destination_url', newAd.destination_url);
    if (adFile) formData.append('adVideo', adFile);
    else formData.append('video_url', newAd.video_url);

    try {
      await fetch('/api/admin/ads', {
        method: 'POST',
        body: formData
      });
      setNewAd({ title: '', video_url: '', destination_url: '' });
      setAdFile(null);
      fetchData();
    } catch (err) {
      console.error('Failed to add ad:', err);
    }
  };

  const deleteAd = async (id: number) => {
    if (!confirm('Delete this ad?')) return;
    try {
      await apiFetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to delete ad:', err);
    }
  };

  const handleTopupAds = async (userId: number) => {
    if (!topupAmount) return;
    try {
      await apiFetch(`/api/admin/users/${userId}/topup-ads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: topupAmount })
      });
      setTopupAmount(0);
      fetchData();
      alert('Ads balance topped up!');
    } catch (err: any) {
      alert(err.message || 'Failed to topup ads');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setNotification({ message: `Order status updated to ${status.replace('_', ' ')}`, type: 'success' });
      fetchData();
    } catch (err: any) {
      setNotification({ message: err.message || 'Failed to update status', type: 'error' });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Permanently delete this cancelled order? This action cannot be undone.')) return;
    try {
      const res = await apiFetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' });
      setNotification({ message: res.message || 'Order deleted', type: 'success' });
      fetchData();
    } catch (err: any) {
      setNotification({ message: err.message || 'Failed to delete order', type: 'error' });
    }
  };

  const verifyPayment = async (orderId: string, amount: number, status: string) => {
    try {
      await apiFetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid: amount, orderStatus: status })
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to verify payment');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newCat })
      });
      setNewCat('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add category');
    }
  };

  const handleAddSticker = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('id', newSticker.id);
    formData.append('title', newSticker.title);
    formData.append('category_id', newSticker.category_id);
    formData.append('price', newSticker.price.toString());
    formData.append('tags', newSticker.tags);
    formData.append('is_mega_eligible', newSticker.is_mega_eligible ? '1' : '0');
    formData.append('type', newSticker.type);
    if (stickerFile) {
      formData.append('stickerImage', stickerFile);
    } else {
      formData.append('image_path', newSticker.image_path);
    }

    try {
      await apiFetch('/api/admin/stickers', {
        method: 'POST',
        body: formData
      });
      setNewSticker({ id: '', title: '', category_id: '', price: 14.50, is_mega_eligible: true, tags: '', image_path: '' });
      setStickerFile(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to add sticker');
    }
  };

  const deleteCategory = async (id: any) => {
    if (!confirm('Delete this category? All stickers in this category will become uncategorized. Continue?')) return;
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const deleteSticker = async (id: any) => {
    if (!confirm('Delete this sticker?')) return;
    try {
      await apiFetch(`/api/admin/stickers/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete sticker');
    }
  };

  const promoteUser = async (userId: number, role: string) => {
    let securityKey = null;
    if (role === 'admin') {
      securityKey = prompt('Enter a security key for this admin:');
      if (!securityKey) return;
    }
    try {
      await apiFetch(`/api/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, securityKey })
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to promote user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter">Admin Control</h1>
          <p className="text-zinc-500 text-sm">Manage orders, stickers, and business performance.</p>
        </div>

        {notification && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
            <div className={cn(
              "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold",
              notification.type === 'success' ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
            )}>
              {notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span className="text-sm">{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-4 opacity-50 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-foreground/40 font-bold uppercase">Last updated</p>
              <p className="text-xs font-bold text-foreground">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <button 
              onClick={fetchData}
              disabled={isRefreshing}
              className={cn(
                "p-3 bg-foreground text-background rounded-2xl hover:bg-foreground/90 transition-all shadow-lg",
                isRefreshing && "animate-spin"
              )}
              title="Refresh Admin Data"
            >
              <Zap className="w-5 h-5" />
            </button>
          </div>
      </header>
      <div className="flex bg-foreground/5 p-1 rounded-2xl overflow-x-auto max-w-full">
          {['orders', 'analytics', 'stickers', 'categories', 'users', 'ads', 'feedback', 'locations', ...(currentUser.role === 'super_admin' ? ['settings'] : [])].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize whitespace-nowrap", 
                activeTab === tab ? "bg-primary text-primary-foreground shadow-lg neon-pink-glow" : "text-foreground/60 hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
      </div>

      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="bg-card border border-border backdrop-blur-xl p-8 rounded-[32px]">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2">Total Revenue</p>
          <p className="text-4xl font-bold text-foreground">{analytics.totalRevenue} ETB</p>
        </div>
        <div className="bg-card border border-border backdrop-blur-xl p-8 rounded-[32px]">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2">Total Orders</p>
          <p className="text-4xl font-bold text-foreground">{analytics.totalOrders}</p>
        </div>
        <div className="bg-card border border-border backdrop-blur-xl p-8 rounded-[32px]">
          <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2">Active Resellers</p>
          <p className="text-4xl font-bold text-foreground">{analytics.activeResellers}</p>
        </div>
        <div className="bg-card border border-border backdrop-blur-xl p-8 rounded-[32px]">
           <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2">Top Category</p>
           <p className="text-xl font-bold truncate text-foreground">{analytics.topCategory}</p>
        </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-foreground text-background p-8 rounded-[32px] space-y-4 border border-border">
              <h4 className="font-bold text-lg">Referral Conversion</h4>
              <div className="text-5xl font-bold text-primary">{analytics.referralConversion}%</div>
              <p className="text-background/40 text-sm">Percentage of users who joined via referral code.</p>
            </div>
            <div className="bg-card border border-border backdrop-blur-xl p-8 rounded-[32px] space-y-4">
              <h4 className="font-bold text-lg text-foreground">Payment Ratio</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-foreground/60">
                    <span>Full Payment</span>
                    <span>{analytics.paymentRatio.full}%</span>
                  </div>
                  <div className="w-full bg-foreground/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${analytics.paymentRatio.full}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1 text-foreground/60">
                    <span>Deposit Only</span>
                    <span>{analytics.paymentRatio.deposit}%</span>
                  </div>
                  <div className="w-full bg-foreground/5 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${analytics.paymentRatio.deposit}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border backdrop-blur-xl p-8 rounded-[32px] space-y-4">
              <h4 className="font-bold text-lg text-foreground">Top Stickers</h4>
              <div className="space-y-2">
                {analytics?.topStickers?.map((s: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm text-foreground/60">
                    <span className="truncate max-w-[150px]">{s.title}</span>
                    <span className="font-bold text-foreground">{s.orders_count} orders</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[32px] space-y-6">
            <h3 className="text-xl font-bold text-white">Add New Category</h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input 
                type="text" 
                placeholder="Category Title" 
                className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                value={newCat}
                onChange={e => setNewCat(e.target.value)}
                required
              />
              <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold neon-pink-glow">Create Category</button>
            </form>
          </div>
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase">ID</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase">Title</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6 font-mono text-xs text-white/60">{cat.id}</td>
                    <td className="p-6 font-bold text-white">{cat.title}</td>
                    <td className="p-6">
                      <button onClick={() => deleteCategory(cat.id)} className="text-rose-500 font-bold text-xs hover:text-rose-400 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stickers' && (
        <div className="space-y-12">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-[32px] space-y-6">
            <h3 className="text-xl font-bold text-white">Add New Sticker</h3>
            <form onSubmit={handleAddSticker} className="grid md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Sticker ID (e.g. S-001)" 
                className="px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                value={newSticker.id}
                onChange={e => setNewSticker({...newSticker, id: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Sticker Title" 
                className="px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                value={newSticker.title}
                onChange={e => setNewSticker({...newSticker, title: e.target.value})}
                required
              />
              <select 
                className="px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                value={newSticker.category_id}
                onChange={e => setNewSticker({...newSticker, category_id: e.target.value})}
                required
              >
                <option value="" className="bg-zinc-900">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.title}</option>)}
              </select>
              <input 
                type="number" 
                placeholder="Price (ETB)" 
                className="px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                value={newSticker.price}
                onChange={e => setNewSticker({...newSticker, price: parseFloat(e.target.value)})}
                required
              />
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Sticker Image</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <label className="flex-1 border-2 border-dashed border-white/10 rounded-2xl p-4 cursor-pointer hover:border-primary/40 transition-all flex items-center justify-center gap-2">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setStickerFile(e.target.files?.[0] || null)} 
                    />
                    <Upload className="w-5 h-5 text-white/40" />
                    <span className="text-sm text-white/60">{stickerFile ? stickerFile.name : 'Upload Image File'}</span>
                  </label>
                  <div className="flex items-center text-white/20 font-bold text-xs">OR</div>
                  <input 
                    type="text" 
                    placeholder="Image URL (External)" 
                    className="flex-1 px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                    value={newSticker.image_path}
                    onChange={e => setNewSticker({...newSticker, image_path: e.target.value})}
                  />
                </div>
              </div>
              <select 
                className="px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                value={newSticker.type}
                onChange={e => setNewSticker({...newSticker, type: e.target.value})}
                required
              >
                <option value="sticker" className="bg-zinc-900">Sticker</option>
                <option value="custom" className="bg-zinc-900">Custom Product</option>
              </select>
              <input 
                type="text" 
                placeholder="Tags (comma separated)" 
                className="px-6 py-4 bg-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-primary border border-white/10 text-white"
                value={newSticker.tags}
                onChange={e => setNewSticker({...newSticker, tags: e.target.value})}
              />
              <div className="flex items-center gap-2 px-6">
                <input 
                  type="checkbox" 
                  id="mega"
                  checked={newSticker.is_mega_eligible}
                  onChange={e => setNewSticker({...newSticker, is_mega_eligible: e.target.checked})}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                />
                <label htmlFor="mega" className="text-sm font-bold text-white/60">Mega Pack Eligible</label>
              </div>
              <button className="bg-primary text-white py-4 rounded-2xl font-bold md:col-span-2 neon-pink-glow">Add Sticker</button>
            </form>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {stickers.map(sticker => (
              <div key={sticker.id} className="bg-white/5 border border-white/10 rounded-2xl p-2 space-y-2 group relative">
                <div className="aspect-square bg-white/5 rounded-xl overflow-hidden">
                  <img src={sticker.image_path} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="px-1">
                  <p className="text-[9px] font-mono text-white/40 truncate">{sticker.id}</p>
                  <p className="font-bold text-[11px] truncate leading-tight text-white">{sticker.title}</p>
                  <p className="text-[9px] text-white/60 truncate">{sticker.category_title}</p>
                </div>
                <button 
                  onClick={() => deleteSticker(sticker.id)} 
                  className="w-full py-1.5 text-rose-500 text-[10px] font-bold bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-6">
            <div className="relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                placeholder="Search users by name or username..." 
                className="w-full pl-16 pr-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary transition-all font-medium text-white"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">User</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Role</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Campus</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Credit</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Joined</th>
                  {currentUser?.role === 'super_admin' && <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.filter(u => 
                  u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                  (u.name && u.name.toLowerCase().includes(userSearchQuery.toLowerCase())) ||
                  (u.nickname && u.nickname.toLowerCase().includes(userSearchQuery.toLowerCase()))
                ).map(u => (
                  <React.Fragment key={u.id}>
                    <tr 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setExpandedUserId(expandedUserId === u.id ? null : u.id)}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center font-bold text-white/40">
                            {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{u.name || 'No Name'}</div>
                            <div className="text-xs text-white/40">{u.email}</div>
                            {u.nickname && <span className="text-[10px] text-primary font-bold">@{u.nickname}</span>}
                          </div>
                          {expandedUserId === u.id ? <ChevronUp className="w-4 h-4 text-white/20 ml-auto" /> : <ChevronDown className="w-4 h-4 text-white/20 ml-auto" />}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                          u.role === 'super_admin' ? "bg-primary/20 text-primary" :
                          u.role === 'admin' ? "bg-accent-blue/20 text-accent-blue" :
                          u.role === 'reseller' ? "bg-accent-cyan/20 text-accent-cyan" :
                          "bg-white/5 text-white/60"
                        )}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6 text-sm text-white/60">{u.campus}</td>
                      <td className="p-6 font-bold text-white">{u.store_credit} ETB</td>
                      <td className="p-6 text-sm text-white/60">{new Date(u.created_at).toLocaleDateString()}</td>
                      {currentUser?.role === 'super_admin' && (
                        <td className="p-6">
                          <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => promoteUser(u.id, 'admin')}
                                className="text-xs font-bold text-accent-cyan hover:underline"
                              >
                                Make Admin
                              </button>
                            )}
                            {u.role === 'admin' && (
                              <button 
                                onClick={() => promoteUser(u.id, 'user')}
                                className="text-xs font-bold text-white/60 hover:underline"
                              >
                                Demote
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                    {expandedUserId === u.id && (
                      <tr className="bg-white/[0.02]">
                        <td colSpan={6} className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Referral Code</p>
                              <p className="text-lg font-mono font-bold text-white">{u.referral_code}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Friends Joined</p>
                              <p className="text-lg font-bold text-white">{u.referral_count || 0}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Mega Orders</p>
                              <p className="text-lg font-bold text-accent-cyan">{u.referred_mega_orders || 0}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Normal Orders</p>
                              <p className="text-lg font-bold text-white">{u.referred_normal_orders || 0}</p>
                            </div>
                            <div className="md:col-span-2 bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                              <div>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Phone Number</p>
                                <p className="text-lg font-bold text-white">{u.phone_number || 'Not provided'}</p>
                              </div>
                              {(u.referred_mega_orders > 0 || u.referred_normal_orders > 0) && (
                                <div className="flex flex-col items-end gap-2">
                                  <button 
                                    onClick={async () => {
                                      try {
                                        await apiFetch(`/api/admin/users/${u.id}/cash-out`, { method: 'POST' });
                                        setNotification({ message: 'Orders marked as cashed out', type: 'success' });
                                        fetchData();
                                      } catch (err) {
                                        setNotification({ message: 'Failed to cash out', type: 'error' });
                                      }
                                    }}
                                    className="bg-accent-cyan text-zinc-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-accent-cyan/90 transition-all"
                                  >
                                    Mark as Cashed Out
                                  </button>
                                  <p className="text-[10px] text-white/40 italic text-right">
                                    This will reset eligible order counts for this user.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="text" 
                placeholder="Search by Order ID, Name, or Email..." 
                className="w-full pl-16 pr-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary transition-all font-medium text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl">
              {(['all', 'unverified', 'unprinted', 'cancelled'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all",
                    orderFilter === f ? "bg-primary text-white neon-pink-glow" : "text-white/40 hover:text-white"
                  )}
                >
                  {f === 'unverified' ? 'Unverified Deposit' : f}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Orders</div>
                <div className="text-xl font-bold text-white">{filteredOrders.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Order ID</th>
                    <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">User Details</th>
                    <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Sticker IDs</th>
                    <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Amount</th>
                    <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Status</th>
                    <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...filteredOrders].sort((a, b) => {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                  }).map((order: Order) => (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-6 font-bold text-white">{order.id}</td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-white">{order.name || 'No Name'}</div>
                      <div className="text-xs text-white/60">{order.phone_number || 'No Phone'}</div>
                      <div className="text-[10px] text-white/40">{order.email}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-white/5 overflow-hidden">
                            <img src={item.image_path} alt={item.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                        {order.items && order.items.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-primary text-white text-[10px] font-bold">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 mt-1 font-bold uppercase">{order.package_type} Pack</p>
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-white">{order.total_amount} ETB</div>
                      <div className="text-[10px] text-white/40">Paid: {order.amount_paid} ETB</div>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-all hover:scale-105 active:scale-95 flex items-center gap-1",
                          order.order_status === 'pending_payment' ? "bg-amber-500/20 text-amber-500" :
                          order.order_status === 'pending_verification' ? "bg-accent-blue/20 text-accent-blue" :
                          order.order_status === 'verified_deposit' ? "bg-indigo-500/20 text-indigo-500" :
                          order.order_status === 'printing' ? "bg-primary/20 text-primary" :
                          order.order_status === 'printed' ? "bg-emerald-500/20 text-emerald-500" :
                          order.order_status === 'ready' ? "bg-green-500/20 text-green-500" :
                          order.order_status === 'cancelled' ? "bg-rose-500/20 text-rose-500" :
                          "bg-white/5 text-white/60"
                        )}
                      >
                        {order.order_status.replace('_', ' ')}
                        {expandedOrderId === order.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => deleteOrder(order.id)}
                          className="bg-rose-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-rose-600 transition-colors"
                        >
                          Delete Order
                        </button>
                        {order.order_status !== 'cancelled' && (
                          <>
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'verified_deposit')}
                              className="bg-accent-blue text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-accent-blue/90 transition-colors"
                            >
                              Verified Deposit
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'printing')}
                              className="bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-primary/90 transition-colors"
                            >
                              Printing
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'printed')}
                              className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                            >
                              Printed
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="bg-white/[0.02]">
                      <td colSpan={6} className="p-6">
                        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4 shadow-inner">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-white/40 uppercase tracking-widest">Order Details</h4>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(order.sticker_ids);
                                setNotification({ message: 'Sticker IDs copied to clipboard!', type: 'success' });
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:scale-105 transition-all neon-pink-glow"
                            >
                              <Copy className="w-3 h-3" />
                              Copy All Sticker IDs
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Sticker List</p>
                              <div className="bg-white/5 rounded-xl p-4 font-mono text-xs text-white/60 break-words leading-relaxed">
                                {order.sticker_ids}
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-[10px] font-bold text-white/40 uppercase mb-2">Ordered Stickers ({order.items?.length || 0})</p>
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="group relative aspect-square bg-white/5 border border-white/10 rounded-lg overflow-hidden" title={item.sticker_id}>
                                    <img src={item.image_path} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                    <div className="absolute inset-0 bg-zinc-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-[8px] font-bold text-white">{item.sticker_id}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {order.package_type === 'mega' && (
                            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                              <p className="text-xs font-bold text-primary flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                This is a Mega Pack order. Each sticker should be printed 5 times.
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-8 space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">Platform Settings</h3>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Super Admin Only</p>
          </div>
          
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Marquee Text (Home Page)</label>
                  <input 
                    type="text" 
                    value={settings.marquee_text || ''}
                    onChange={(e) => setSettings({...settings, marquee_text: e.target.value})}
                    placeholder="Enter text separated by bullets or dots"
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Telegram Link</label>
                  <input 
                    type="text" 
                    value={settings.telegram_link || ''}
                    onChange={(e) => setSettings({...settings, telegram_link: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Contact Email</label>
                  <input 
                    type="email" 
                    value={settings.contact_email || ''}
                    onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Bank Account Name</label>
                  <input 
                    type="text" 
                    value={settings.bank_name || ''}
                    onChange={(e) => setSettings({...settings, bank_name: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">CBE Account</label>
                  <input 
                    type="text" 
                    value={settings.cbe_account || ''}
                    onChange={(e) => setSettings({...settings, cbe_account: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">BOA Account</label>
                  <input 
                    type="text" 
                    value={settings.boa_account || ''}
                    onChange={(e) => setSettings({...settings, boa_account: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Telebirr Account</label>
                  <input 
                    type="text" 
                    value={settings.telebirr_account || ''}
                    onChange={(e) => setSettings({...settings, telebirr_account: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Dashin Account</label>
                  <input 
                    type="text" 
                    value={settings.dashin_account || ''}
                    onChange={(e) => setSettings({...settings, dashin_account: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Referral Promo Message</label>
                  <textarea 
                    value={settings.referral_promo_message || ''}
                    onChange={(e) => setSettings({...settings, referral_promo_message: e.target.value})}
                    placeholder="Use {code} and {url} as placeholders"
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white min-h-[100px] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Website URL (for referrals)</label>
                  <input 
                    type="text" 
                    value={settings.site_url || ''}
                    onChange={(e) => setSettings({...settings, site_url: e.target.value})}
                    placeholder="e.g. https://vibestickers.com"
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Terms & Conditions</label>
                  <textarea 
                    value={settings.terms || ''}
                    onChange={(e) => setSettings({...settings, terms: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white min-h-[150px] resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Privacy Policy</label>
                  <textarea 
                    value={settings.privacy || ''}
                    onChange={(e) => setSettings({...settings, privacy: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 focus:ring-2 focus:ring-primary text-white min-h-[150px] resize-none"
                  />
                </div>
              </div>
            </div>

            <button className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all neon-pink-glow">
              Save All Settings
            </button>
          </form>

          <div className="pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-rose-500/10 p-8 rounded-[32px] border border-rose-500/20">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-rose-500">Database Maintenance</h4>
                <p className="text-sm text-rose-500/60">Clear orders that are older than 1 month and have been completed or cancelled.</p>
              </div>
              <button 
                onClick={handleClearOldOrders}
                className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 whitespace-nowrap"
              >
                Clear Old Orders
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ads' && (
        <div className="space-y-8">
          {currentUser.role === 'super_admin' && (
            <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] p-8 space-y-6">
              <h3 className="text-xl font-bold text-white">Upload New Ad</h3>
              <form onSubmit={handleAddAd} className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Ad Title" 
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 text-white focus:ring-2 focus:ring-primary"
                    value={newAd.title}
                    onChange={(e) => setNewAd({...newAd, title: e.target.value})}
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Destination Link (e.g. https://t.me/...)" 
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 text-white focus:ring-2 focus:ring-primary"
                    value={newAd.destination_url}
                    onChange={(e) => setNewAd({...newAd, destination_url: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <div className="relative h-full">
                    <input 
                      type="file" 
                      accept="video/*,image/*"
                      className="hidden" 
                      id="ad-file"
                      onChange={(e) => setAdFile(e.target.files?.[0] || null)}
                    />
                    <label 
                      htmlFor="ad-file"
                      className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors py-4"
                    >
                      <Upload className="w-6 h-6 text-white/40 mb-2" />
                      <span className="text-xs font-bold text-white/60">{adFile ? adFile.name : 'Upload Video/Image'}</span>
                    </label>
                  </div>
                  <input 
                    type="text" 
                    placeholder="OR Video URL (Cloudinary/YouTube)" 
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 text-white focus:ring-2 focus:ring-primary"
                    value={newAd.video_url}
                    onChange={(e) => setNewAd({...newAd, video_url: e.target.value})}
                  />
                </div>
                <button className="md:col-span-2 bg-primary text-white py-4 rounded-2xl font-bold hover:scale-[1.02] transition-all neon-pink-glow">
                  Publish Ad
                </button>
              </form>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Ad Title</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Preview</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6 font-bold text-white">{ad.title}</td>
                    <td className="p-6">
                      <div className="w-20 h-12 bg-white/5 rounded-lg overflow-hidden">
                        {ad.video_url?.endsWith('.mp4') ? (
                          <video src={ad.video_url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={ad.video_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      <button 
                        onClick={() => deleteAd(ad.id)}
                        className="text-rose-500 font-bold text-xs hover:text-rose-400 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <h3 className="p-6 font-bold border-b border-white/10 text-white">Ads Balance Management</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">User</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Ads Balance</th>
                  <th className="p-6 text-xs font-bold text-white/40 uppercase tracking-widest">Topup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-6 font-bold text-white">{u.email}</td>
                    <td className="p-6 font-mono text-accent-cyan">{u.ads_balance || 0} ETB</td>
                    <td className="p-6">
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Amount" 
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm outline-none w-24 text-white focus:ring-1 focus:ring-primary"
                          onChange={(e) => setTopupAmount(parseFloat(e.target.value))}
                        />
                        <button 
                          onClick={() => handleTopupAds(u.id)}
                          className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all"
                        >
                          Add
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden">
            <h3 className="p-6 font-bold border-b border-white/10 text-white">User Feedback</h3>
            <div className="divide-y divide-white/5">
              {feedback.length === 0 ? (
                <div className="p-12 text-center text-white/40">No feedback received yet.</div>
              ) : (
                feedback.map(f => (
                  <div key={f.id} className="p-6 space-y-2 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-white">{f.user_email || 'Anonymous'}</div>
                      <div className="text-xs text-white/40">{new Date(f.created_at).toLocaleString()}</div>
                    </div>
                    {f.rating && (
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <CheckCircle key={i} className={cn("w-3 h-3", i < f.rating ? "text-amber-400 fill-current" : "text-white/10")} />
                        ))}
                      </div>
                    )}
                    <p className="text-white/70">{f.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'locations' && <AdminLocations />}
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [campus, setCampus] = useState('');
  const [campuses, setCampuses] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isRegister) {
      apiFetch('/api/campuses')
        .then(data => {
          setCampuses(data);
          if (data.length > 0) setCampus(data[0].name);
        })
        .catch(console.error);
    }
  }, [isRegister]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegister) {
      if (!phoneNumber || !/^\d+$/.test(phoneNumber) || phoneNumber.length < 10) {
        setError('Phone number must be at least 10 digits and contain only numbers.');
        return;
      }
    }

    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const finalEmail = isRegister && !email.includes('@vstick') ? `${email}@vstick` : email;
    try {
      const data = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail, password, referralCode, campus, name, phoneNumber })
      });
      if (data.user) {
        onLogin(data.user);
        navigate('/');
      } else if (data.success) {
        setIsRegister(false);
        setError('Registration successful! Please login.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dd4fid5mp/image/upload/v1772727101/Gemini_Generated_Image_hwbqv2hwbqv2hwbq_mgdd19.png" 
                alt="Vibe Stickers" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Vibe Stickers</span>
          </Link>
          <h2 className="text-4xl font-bold mb-2 tracking-tighter text-white">{isRegister ? 'Join VIBE' : 'Welcome Back'}</h2>
          <p className="text-white/40">{isRegister ? 'Create an account to start ordering' : 'Sign in to your account'}</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={cn(
                "p-4 rounded-2xl text-sm font-medium",
                error.includes('successful') ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500" : "bg-rose-500/10 border border-rose-500/20 text-rose-500"
              )}>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                  Username
                </label>
                <input 
                  type="text" 
                  placeholder="write your username" 
                  className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-[10px] text-white/20 mt-1 ml-4 font-bold uppercase tracking-tighter">Will be saved as {email.includes('@vstick') ? email : (email ? `${email}@vstick` : 'username@vstick')}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                  Password
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {isRegister && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="0912345678" 
                      className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                      University / Location
                    </label>
                    <select 
                      className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white appearance-none"
                      value={campus}
                      onChange={(e) => setCampus(e.target.value)}
                    >
                      {campuses.map(c => (
                        <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>
                      ))}
                      <option value="Other" className="bg-zinc-900">Other / Non-Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                      Referral Code (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="VST-XXXX" 
                      className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all neon-pink-glow disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-white/40">{isRegister ? 'Already have an account? ' : "Don't have an account? "}</span>
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="font-bold text-white hover:text-primary transition-colors"
            >
              {isRegister ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin, currentUser }: { onLogin: (user: User) => void, currentUser: User | null }) => {
  const [email, setEmail] = useState(currentUser?.email || '');
  const [securityKey, setSecurityKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAlreadyAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isAlreadyAdmin ? '/api/auth/admin-verify' : '/api/auth/login';
      const body = isAlreadyAdmin ? { securityKey } : { email, password: securityKey }; // securityKey acts as password for initial login if not logged in
      
      const data = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (data.success || data.user) {
        if (data.user) onLogin(data.user);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold tracking-tighter text-white">Admin Portal</h2>
          <p className="text-white/40">
            {isAlreadyAdmin ? `Welcome back, ${currentUser.email}` : 'Restricted access for authorized administrators only'}
          </p>
        </div>
        
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-[40px] p-10 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {!isAlreadyAdmin && (
                <div>
                  <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                    Admin Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="admin@vibestickers.com" 
                    className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-white/40 uppercase tracking-widest mb-2 ml-4">
                  Security Key
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full px-6 py-4 bg-white/5 rounded-2xl border border-white/10 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                  value={securityKey}
                  onChange={(e) => setSecurityKey(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all neon-pink-glow disabled:opacity-50"
            >
              {loading ? 'Authorizing...' : 'Authorize Access'}
            </button>
          </form>
          
          <div className="text-center">
            <Link to="/" className="text-sm font-medium text-white/40 hover:text-white">
              Return to Public Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const StickerDetail = ({ user }: { user: User | null }) => {
  const { id } = useParams();
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch(`/api/stickers/${id}`)
      .then(setSticker)
      .catch(err => console.error('Failed to load sticker:', err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center font-bold">Loading sticker...</div>;
  if (!sticker) return <div className="py-20 text-center font-bold">Sticker not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="aspect-square bg-zinc-100 rounded-[60px] overflow-hidden shadow-2xl"
        >
          <img 
            src={sticker.image_path} 
            alt={sticker.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div className="space-y-8">
          <div>
            <span className="px-4 py-2 bg-zinc-100 text-[10px] font-black uppercase tracking-widest rounded-full">
              {sticker.category_title}
            </span>
            <h1 className="text-6xl font-black tracking-tighter text-zinc-900 mt-4 uppercase">{sticker.title}</h1>
            <p className="text-2xl font-bold text-zinc-400 mt-2">{sticker.price} ETB</p>
          </div>

          <div className="space-y-4">
            <p className="text-zinc-500 text-lg leading-relaxed">
              High-quality, water-resistant vinyl sticker. Perfect for laptops, water bottles, and notebooks. 
              Part of our curated campus collection.
            </p>
            <div className="flex flex-wrap gap-2">
              {sticker.tags.split(',').map(tag => (
                <span key={tag} className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">#{tag.trim()}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/explore')}
              className="flex-1 bg-zinc-900 text-white py-5 rounded-full font-black text-xl hover:bg-zinc-800 transition-all"
            >
              ADD TO PACK
            </button>
            <button className="w-16 h-16 border-2 border-zinc-200 rounded-full flex items-center justify-center hover:border-zinc-900 transition-all">
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-zinc-100">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Views</p>
              <p className="text-xl font-bold">{sticker.views}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Orders</p>
              <p className="text-xl font-bold">{sticker.orders_count}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Rules = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/settings').then(setSettings).catch(console.error);
  }, []);

  if (!settings) return <div className="py-20 text-center font-bold">Loading rules...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-12">
      <h1 className="text-5xl font-bold tracking-tighter">Rules & Policies</h1>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Terms & Conditions</h2>
        <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
          {settings.terms}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Privacy Policy</h2>
        <div className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
          {settings.privacy}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Contact Information</h2>
        <p className="text-zinc-600 leading-relaxed">
          For any inquiries, please contact us at: <br />
          Email: <span className="font-bold text-zinc-900">{settings.contact_email}</span> <br />
          Telegram: <a href={settings.telegram_link} target="_blank" rel="noopener noreferrer" className="font-bold text-zinc-900 underline">{settings.telegram_link}</a>
        </p>
      </section>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(data => {
        if (data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed:', err);
    }
    setUser(null);
    navigate('/');
  };

  const currentUserIsAdmin = user && (user.role === 'admin' || user.role === 'super_admin');

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
        <span className="font-bold text-2xl tracking-tighter text-foreground">VSTICKER...</span>
      </div>
    </div>
  );

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-primary-foreground transition-colors duration-300">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore user={user} />} />
            <Route path="/sticker/:id" element={<StickerDetail user={user} />} />
            <Route path="/mega-builder" element={<MegaPackBuilder />} />
            <Route path="/checkout" element={<Checkout user={user} />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/admin" element={currentUserIsAdmin ? <Admin currentUser={user} /> : <AdminLogin onLogin={setUser} currentUser={user} />} />
            <Route path="/admin/login" element={<AdminLogin onLogin={setUser} currentUser={user} />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/rules" element={<Rules />} />
          </Routes>
        </main>
        
        <footer className="border-t border-border py-16 bg-foreground/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-2">
                <Link to="/" className="flex items-center gap-2 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-foreground">Vibe Stickers</span>
                </Link>
                <p className="text-foreground/40 max-w-sm leading-relaxed">
                  The most sophisticated digital sticker marketplace. Premium designs, water-resistant quality, and a community of creators.
                </p>
              </div>
              <div>
                <h4 className="text-foreground font-bold mb-6">Explore</h4>
                <ul className="space-y-4 text-sm text-foreground/40">
                  <li><Link to="/explore" className="hover:text-primary transition-colors">Browse Stickers</Link></li>
                  <li><Link to="/mega-builder" className="hover:text-primary transition-colors">Mega Packs</Link></li>
                  <li><Link to="/rules" className="hover:text-primary transition-colors">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-foreground font-bold mb-6">Support</h4>
                <ul className="space-y-4 text-sm text-foreground/40">
                  <li><Link to="/rules" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                  <li><Link to="/rules" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                  <li><a href="https://t.me/vsticker_aastu" target="_blank" className="hover:text-primary transition-colors">Telegram Support</a></li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-4">
              <p className="text-xs text-foreground/20">© 2026 Vibe Stickers. All rights reserved.</p>
              <div className="flex gap-6">
                <a href="#" className="text-foreground/20 hover:text-foreground transition-colors"><Send className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
