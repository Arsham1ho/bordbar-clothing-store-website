import { useState, useEffect, useRef } from 'react'
import {
  ShoppingBag, Search, Menu, X, Heart, Star, ChevronLeft, ChevronRight,
  MapPin, Phone, Clock, MessageCircle, Package, Truck,
  CheckCircle, XCircle, ArrowRight,
  BarChart2, Trash2, Plus, Minus, CreditCard, AlertCircle,
  Home, Info, Send, Lock, Scale, User, SlidersHorizontal, RotateCcw,
  ZoomIn, ZoomOut, Pencil, FileText, Ruler, Eye
} from 'lucide-react'
import type { CartItem, Order, Product, Review } from './types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from './types'
import { createOrder, createReview, fetchOrderByCode, fetchProducts, fetchReviews, updateOrderStatus } from './lib/db'
import { getMockOrderCodes, getMockPhone, getMockProfile, mockSignIn, mockSignOut, rememberMockOrder, saveMockProfile } from './lib/mockAuth'

// ─── Brand icons ────────────────────────────────────────────────────────────

function InstagramIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TelegramIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.05 3.76 2.42 11.14c-1.15.46-1.14 1.1-.21 1.38l4.77 1.49 1.83 5.6c.22.6.39.85.8.85.32 0 .46-.15.64-.33l1.83-1.78 3.8 2.8c.7.39 1.2.19 1.38-.65l2.5-11.8c.26-1.04-.4-1.5-1.71-.94Zm-11.9 9.02 7.75-4.9c.37-.22.7-.1.43.15l-6.4 5.78-.25 2.66-1.07-3.7Z" />
    </svg>
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Page = 'home' | 'products' | 'product' | 'cart' | 'checkout' | 'tracking' | 'chat' | 'compare' | 'about' | 'order-cancel' | 'auth' | 'account' | 'favorites' | 'policy'
type AccountTab = 'profile' | 'edit' | 'orders' | 'payments'
type PolicyTab = 'privacy' | 'terms' | 'returns'

interface ChatMessage {
  id: number
  from: 'user' | 'agent'
  text: string
  time: string
}

// ─── Data ───────────────────────────────────────────────────────────────────

const categories = ['همه', 'پیراهن', 'کت و شلوار', 'مانتو', 'بلوز', 'شلوار', 'ست']

function formatPrice(p: number) {
  return p.toLocaleString('fa-IR') + ' تومان'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={13}
          className={s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 fill-gray-200'}
        />
      ))}
      <span className="text-xs text-gray-500 mr-1">({count.toLocaleString('fa-IR')})</span>
    </div>
  )
}

function ProductCard({
  product,
  onView,
  onAddCart,
  onCompare,
  comparing,
  liked,
  onToggleLike,
  onQuickView,
}: {
  product: Product
  onView: () => void
  onAddCart: () => void
  onCompare: () => void
  comparing: boolean
  liked: boolean
  onToggleLike: () => void
  onQuickView: () => void
}) {
  const [img, setImg] = useState(0)

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-navy-100/60">
      <div
        className="relative cursor-pointer overflow-hidden bg-navy-50"
        style={{ aspectRatio: '4/5' }}
        onClick={onView}
        onMouseEnter={() => setImg(1)}
        onMouseLeave={() => setImg(0)}
      >
        <img
          src={product.images[img] || product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          {product.originalPrice && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {Math.round((1 - product.price / product.originalPrice) * 100)}٪ تخفیف
            </span>
          )}
          {product.isNew && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              جدید
            </span>
          )}
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-navy-800 px-4 py-2 rounded-full">ناموجود</span>
          </div>
        )}
        <button
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          onClick={e => { e.stopPropagation(); onToggleLike() }}
        >
          <Heart size={15} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>
        <button
          className={`absolute bottom-3 left-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${comparing ? 'bg-navy-600 text-white' : 'bg-white/90 text-gray-400 hover:bg-white'}`}
          onClick={e => { e.stopPropagation(); onCompare() }}
          title="مقایسه"
        >
          <Scale size={14} />
        </button>
        {product.inStock && (
          <button
            onClick={e => { e.stopPropagation(); onQuickView() }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/95 text-navy-800 text-xs font-medium px-3 py-2 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          >
            <Eye size={13} />
            مشاهده سریع
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-navy-400 mb-1">{product.category}</p>
        <h3 className="font-semibold text-navy-900 text-sm mb-2 cursor-pointer hover:text-navy-600 transition-colors" onClick={onView}>{product.name}</h3>
        <StarRating rating={product.rating} count={product.reviews} />
        <div className="flex items-center justify-between mt-3">
          <div>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
            )}
            <p className="font-bold text-navy-800 text-sm">{formatPrice(product.price)}</p>
          </div>
          {product.inStock && (
            <button
              onClick={onAddCart}
              className="flex items-center gap-1.5 bg-navy-800 text-white text-xs px-3 py-2 rounded-xl hover:bg-navy-600 transition-colors"
            >
              <Plus size={13} />
              افزودن
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Pages ───────────────────────────────────────────────────────────────────

interface BannerConfig {
  images: string[]
  label: string
  title: string
  subtitle: string
  category: string
}

const heroBanners: BannerConfig[] = [
  {
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&h=700&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&h=700&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&h=700&fit=crop&auto=format',
    ],
    label: 'کالکشن جدید',
    title: 'پیراهن‌های مجلسی',
    subtitle: 'به‌روزترین طرح‌های فصل را کشف کنید',
    category: 'پیراهن',
  },
  {
    images: [
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&h=700&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=900&h=700&fit=crop&auto=format',
    ],
    label: 'کالکشن جدید',
    title: 'مانتو و کت زنانه',
    subtitle: 'شیک، گرم و مناسب هر موقعیت',
    category: 'مانتو',
  },
]

function BannerCard({ banner, onSelect }: { banner: BannerConfig; onSelect: () => void }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % banner.images.length), 4000)
    return () => clearInterval(timer)
  }, [banner.images.length])

  return (
    <div className="relative rounded-3xl overflow-hidden bg-navy-900" style={{ aspectRatio: '16/9' }}>
      {banner.images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={banner.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
      <div className="absolute bottom-0 right-0 p-4 md:p-5 text-right">
        <div className="inline-block bg-navy-950/70 backdrop-blur-sm rounded-lg px-2.5 py-1.5 mb-2">
          <p className="text-gold-400 text-[10px] font-bold tracking-widest">{banner.label}</p>
          <p className="text-white font-bold text-sm">{banner.title}</p>
        </div>
        <p className="text-navy-100 text-xs mb-3 max-w-[220px]">{banner.subtitle}</p>
        <button
          onClick={onSelect}
          className="flex items-center gap-1.5 bg-gold-500 text-navy-950 font-bold px-4 py-2 rounded-xl hover:bg-gold-400 transition-colors text-xs"
        >
          <ChevronLeft size={14} />
          انتخاب
        </button>
      </div>
      <div className="absolute bottom-3 left-5 flex gap-1.5">
        {banner.images.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-gold-400' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>
    </div>
  )
}

function HeroBanners({ onSelectCategory }: { onSelectCategory: (category: string) => void }) {
  return (
    <section className="bg-cream pt-6 pb-2">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {heroBanners.map(b => (
          <BannerCard key={b.title} banner={b} onSelect={() => onSelectCategory(b.category)} />
        ))}
      </div>
    </section>
  )
}

const categoryShowcase = [
  { label: 'پیراهن', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=240&h=240&fit=crop&auto=format' },
  { label: 'کت و شلوار', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=240&h=240&fit=crop&auto=format' },
  { label: 'مانتو', image: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=240&h=240&fit=crop&auto=format' },
  { label: 'بلوز', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=240&h=240&fit=crop&auto=format' },
  { label: 'شلوار', image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=240&h=240&fit=crop&auto=format' },
  { label: 'ست', image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=240&h=240&fit=crop&auto=format' },
]

function CategoryShowcase({ onSelect }: { onSelect: (category: string) => void }) {
  return (
    <section className="bg-cream pb-12 pt-4">
      <div className="container mx-auto px-6">
        <div className="flex gap-6 overflow-x-auto justify-center flex-wrap">
          {categoryShowcase.map(c => (
            <button key={c.label} onClick={() => onSelect(c.label)} className="flex flex-col items-center gap-2 flex-shrink-0 group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-navy-100 group-hover:border-gold-400 transition-colors">
                <img src={c.image} alt={c.label} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs md:text-sm font-medium text-navy-800">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewestProducts({
  products,
  onViewAll,
  onView,
  setCart,
  compare,
  toggleCompare,
  favorites,
  toggleFavorite,
  onQuickView,
}: {
  products: Product[]
  onViewAll: () => void
  onView: (p: Product) => void
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  compare: number[]
  toggleCompare: (id: number) => void
  favorites: number[]
  toggleFavorite: (id: number) => void
  onQuickView: (p: Product) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = products.slice().sort((a, b) => b.id - a.id)

  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 320, behavior: 'smooth' })
  }

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id)
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product: p, size: p.sizes[0], color: p.colors[0], qty: 1 }]
    })
  }

  return (
    <section className="py-8 bg-cream">
      <div className="container mx-auto px-6">
        <div className="bg-navy-50 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-navy-900">جدید ترین محصولات</h2>
            <button onClick={onViewAll} className="text-navy-600 hover:text-navy-900 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              مشاهده همه
              <ChevronLeft size={16} />
            </button>
          </div>

          <div className="relative">
            {filtered.length > 3 && (
              <>
                <button
                  onClick={() => scroll(1)}
                  className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md items-center justify-center text-navy-600 hover:text-navy-900"
                >
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => scroll(-1)}
                  className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white shadow-md items-center justify-center text-navy-600 hover:text-navy-900"
                >
                  <ChevronLeft size={18} />
                </button>
              </>
            )}
            {filtered.length === 0 ? (
              <p className="text-navy-400 py-10 w-full text-center">محصولی در این دسته یافت نشد</p>
            ) : (
              <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth pb-2">
                {filtered.map(p => (
                  <div key={p.id} className="w-48 md:w-56 flex-shrink-0">
                    <ProductCard
                      product={p}
                      onView={() => onView(p)}
                      onAddCart={() => addToCart(p)}
                      onCompare={() => toggleCompare(p.id)}
                      comparing={compare.includes(p.id)}
                      liked={favorites.includes(p.id)}
                      onToggleLike={() => toggleFavorite(p.id)}
                      onQuickView={() => onQuickView(p)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function SiteFooter({ setPage, goToProducts, goToPolicy }: { setPage: (p: Page) => void; goToProducts: (category?: string) => void; goToPolicy: (tab: PolicyTab) => void }) {
  return (
    <footer className="bg-navy-950 py-12">
      <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
        <div className="text-right">
          <p className="text-white font-bold mb-3 text-sm">دسته‌بندی‌ها</p>
          {categories.filter(c => c !== 'همه').map(c => (
            <button key={c} onClick={() => goToProducts(c)} className="block text-navy-400 text-sm hover:text-gold-400 transition-colors mb-2">{c}</button>
          ))}
        </div>
        <div className="text-right">
          <p className="text-white font-bold mb-3 text-sm">خدمات</p>
          {[['پیگیری سفارش', 'tracking'], ['پشتیبانی', 'chat'], ['لغو سفارش', 'order-cancel']].map(([l, p]) => (
            <button key={p} onClick={() => setPage(p as Page)} className="block text-navy-400 text-sm hover:text-gold-400 transition-colors mb-2">{l}</button>
          ))}
        </div>
        <div className="text-right">
          <p className="text-white font-bold mb-3 text-sm">دسترسی سریع</p>
          {[['خانه', 'home'], ['محصولات', 'products'], ['درباره ما', 'about']].map(([l, p]) => (
            <button key={p} onClick={() => setPage(p as Page)} className="block text-navy-400 text-sm hover:text-gold-400 transition-colors mb-2">{l}</button>
          ))}
        </div>
        <div className="text-right">
          <p className="text-white font-bold mb-3 text-sm">قوانین و مقررات</p>
          {([['حریم خصوصی', 'privacy'], ['شرایط استفاده', 'terms'], ['بازگشت و مرجوعی', 'returns']] as const).map(([l, t]) => (
            <button key={t} onClick={() => goToPolicy(t)} className="block text-navy-400 text-sm hover:text-gold-400 transition-colors mb-2">{l}</button>
          ))}
        </div>
        <div className="text-right">
          <p className="text-white font-bold mb-3 text-sm">تماس</p>
          <p className="text-navy-400 text-sm mb-1">رشت، گلسار، بلوار گیلان</p>
          <p className="text-navy-400 text-sm mb-3">رو به روی برج گلسار</p>
          <p className="text-navy-400 text-sm mb-1" dir="ltr">013-33456789</p>
          <p className="text-navy-400 text-sm">شنبه تا چهارشنبه ۱۰ تا ۲۱</p>
          <p className="text-navy-400 text-sm">پنجشنبه ۱۰ تا ۲۰</p>
        </div>
        <div className="text-right">
          <p className="font-logo text-gold-400 text-2xl mb-3">بردبار</p>
          <p className="text-navy-400 text-sm leading-relaxed mb-5">پوشاک زنانه با کیفیت اروپایی در رشت</p>
          <div className="flex gap-2 justify-start">
            <a
              href="https://instagram.com/bordbar.store"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="اینستاگرام"
              className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 flex items-center justify-center transition-colors"
            >
              <InstagramIcon size={16} className="text-navy-200" />
            </a>
            <a
              href="https://t.me/bordbar_store"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="تلگرام"
              className="w-10 h-10 rounded-xl bg-navy-800 hover:bg-navy-700 flex items-center justify-center transition-colors"
            >
              <TelegramIcon size={16} className="text-navy-200" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-navy-800 pt-6 text-center text-navy-600 text-sm">
        © ۱۴۰۳ فروشگاه بردبار — تمام حقوق محفوظ است
      </div>
    </footer>
  )
}

function StoreInfoSection() {
  return (
    <section className="bg-navy-800 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.7fr_1.15fr] gap-6 items-center">
          <div className="order-1 rounded-3xl overflow-hidden" style={{ aspectRatio: '5/4' }}>
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&h=500&fit=crop&auto=format"
              alt="فروشگاه بردبار"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-right order-2">
            <p className="text-gold-400 text-sm font-medium tracking-widest mb-3 uppercase">فروشگاه بردبار</p>
            <h2 className="text-3xl font-bold text-white mb-6">از ما دیدن کنید</h2>
            <div className="space-y-4 mb-8">
              {[
                { icon: <MapPin size={18} />, title: 'آدرس', text: 'رشت، گلسار، بلوار گیلان، رو به روی برج گلسار' },
                { icon: <Phone size={18} />, title: 'تماس', text: '۰۱۳-۳۳۴۵۶۷۸۹' },
                { icon: <Clock size={18} />, title: 'ساعت کاری', text: 'شنبه تا چهارشنبه ۱۰ تا ۲۱ | پنجشنبه ۱۰ تا ۲۰' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 justify-start">
                  <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center text-gold-400 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">{item.title}</p>
                    <p className="text-navy-300 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="https://www.google.com/maps/place/Golsar+Tower/@37.3044059,49.5796787,17z/data=!3m1!4b1!4m6!3m5!1s0x401fd8c966151241:0x7a580f8b3205f1aa!8m2!3d37.3044059!4d49.5822536!16s%2Fg%2F11btt7sm7j"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gold-500 text-navy-900 font-bold px-6 py-3 rounded-2xl hover:bg-gold-400 transition-colors"
            >
              <MapPin size={16} />
              مسیریابی تا فروشگاه
            </a>
          </div>
          <div className="order-3 rounded-3xl overflow-hidden" style={{ aspectRatio: '5/4' }}>
            <iframe
              title="موقعیت فروشگاه بردبار روی نقشه"
              src="https://www.google.com/maps?q=37.3044059,49.5822536&z=17&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesBar() {
  const features = [
    { icon: <Truck size={20} />, title: 'ارسال رایگان', desc: 'برای خریدهای بالای ۵۰۰ هزار تومان' },
    { icon: <CheckCircle size={20} />, title: 'ضمانت اصالت', desc: 'تضمین کیفیت برتر محصولات' },
    { icon: <Package size={20} />, title: '۷ روز مرجوعی', desc: 'بدون سوال و دردسر' },
    { icon: <Lock size={20} />, title: 'پرداخت امن', desc: 'رمزگذاری SSL پیشرفته' },
  ]
  return (
    <div className="bg-navy-800 py-6">
      <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3 text-right">
            <div className="w-10 h-10 rounded-xl bg-navy-700 flex items-center justify-center text-gold-400 flex-shrink-0">
              {f.icon}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{f.title}</p>
              <p className="text-navy-300 text-xs">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProductsPage({
  products,
  loading,
  cat,
  onCatChange,
  initialSearch,
  setCart,
  onView,
  compare,
  toggleCompare,
  favorites,
  toggleFavorite,
  onQuickView,
}: {
  products: Product[]
  loading: boolean
  cat: string
  onCatChange: (cat: string) => void
  initialSearch?: string
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  onView: (p: Product) => void
  compare: number[]
  toggleCompare: (id: number) => void
  favorites: number[]
  toggleFavorite: (id: number) => void
  onQuickView: (p: Product) => void
}) {
  const [search, setSearch] = useState(initialSearch ?? '')
  const [sort, setSort] = useState('پیش‌فرض')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id && i.size === p.sizes[0] && i.color === p.colors[0])
      if (ex) return prev.map(i => i.product.id === p.id && i.size === p.sizes[0] ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product: p, size: p.sizes[0], color: p.colors[0], qty: 1 }]
    })
  }

  let filtered = products.filter(p => {
    if (cat !== 'همه' && p.category !== cat) return false
    if (search && !p.name.includes(search)) return false
    if (inStockOnly && !p.inStock) return false
    if (minPrice && p.price < Number(minPrice)) return false
    if (maxPrice && p.price > Number(maxPrice)) return false
    return true
  })
  if (sort === 'ارزان‌ترین') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'گران‌ترین') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sort === 'محبوب‌ترین') filtered = [...filtered].sort((a, b) => b.rating - a.rating)

  const resetFilters = () => {
    onCatChange('همه')
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-navy-100">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-3xl font-bold text-navy-900">تمام محصولات</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-navy-500 whitespace-nowrap">
                <SlidersHorizontal size={14} />
                مرتب‌سازی:
              </span>
              {['پیش‌فرض', 'محبوب‌ترین', 'ارزان‌ترین', 'گران‌ترین'].map(s => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors whitespace-nowrap ${sort === s ? 'text-gold-500 border-gold-500' : 'text-navy-500 border-transparent hover:text-navy-800'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <span className="text-xs text-navy-400 whitespace-nowrap">{filtered.length.toLocaleString('fa-IR')} کالا</span>
        </div>

        {search && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setSearch('')}
              className="flex items-center gap-2 bg-navy-800 text-white text-sm px-3 py-1.5 rounded-full hover:bg-navy-600 transition-colors"
            >
              <X size={13} />
              جستجو: {search}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <aside className="bg-white rounded-2xl border border-navy-100/50 p-5 h-fit lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-5">
              <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-navy-400 hover:text-navy-700 transition-colors">
                <RotateCcw size={12} />
                پاک کردن
              </button>
              <h3 className="flex items-center gap-2 font-bold text-navy-900">
                فیلترها
                <SlidersHorizontal size={16} />
              </h3>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-navy-800 mb-3">دسته‌بندی</p>
              <div className="flex flex-col gap-1">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => onCatChange(c)}
                    className={`text-right px-3 py-2 rounded-xl text-sm transition-colors ${cat === c ? 'bg-navy-800 text-white font-medium' : 'text-navy-600 hover:bg-navy-50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 pt-5 border-t border-navy-100">
              <p className="text-sm font-semibold text-navy-800 mb-3">محدوده قیمت (تومان)</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  placeholder="حداقل"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:border-navy-500"
                />
                <span className="text-navy-300 flex-shrink-0">تا</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  placeholder="حداکثر"
                  className="w-full px-3 py-2 rounded-xl border border-navy-200 text-sm focus:outline-none focus:border-navy-500"
                />
              </div>
            </div>

            <div className="pt-5 border-t border-navy-100">
              <label className="flex items-center gap-2 text-sm text-navy-700 cursor-pointer">
                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
                فقط کالاهای موجود
              </label>
            </div>
          </aside>

          <div>
            {loading ? (
              <div className="text-center py-20 text-navy-400">
                <p className="text-lg">در حال بارگذاری محصولات...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                  {filtered.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onView={() => onView(p)}
                      onAddCart={() => addToCart(p)}
                      onCompare={() => toggleCompare(p.id)}
                      comparing={compare.includes(p.id)}
                      liked={favorites.includes(p.id)}
                      onToggleLike={() => toggleFavorite(p.id)}
                      onQuickView={() => onQuickView(p)}
                    />
                  ))}
                </div>
                {filtered.length === 0 && (
                  <div className="text-center py-20 text-navy-400">
                    <Search size={40} className="mx-auto mb-4 opacity-40" />
                    <p className="text-lg">محصولی یافت نشد</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductDetailPage({
  product,
  products,
  setCart,
  onBack,
  onView,
  compare,
  toggleCompare,
  setPage,
  goToProducts,
  goToPolicy,
  favorites,
  toggleFavorite,
  onQuickView,
}: {
  product: Product
  products: Product[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  onBack: () => void
  onView: (p: Product) => void
  compare: number[]
  toggleCompare: (id: number) => void
  setPage: (p: Page) => void
  goToProducts: (category?: string) => void
  goToPolicy: (tab: PolicyTab) => void
  favorites: number[]
  toggleFavorite: (id: number) => void
  onQuickView: (p: Product) => void
}) {
  const [size, setSize] = useState(product.sizes[0])
  const [color, setColor] = useState(product.colors[0])
  const [img, setImg] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [tab, setTab] = useState<'desc' | 'material' | 'care'>('desc')
  const [added, setAdded] = useState(false)

  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewName, setReviewName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewQuality, setReviewQuality] = useState(5)
  const [reviewPrice, setReviewPrice] = useState(5)
  const [reviewDelivery, setReviewDelivery] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewImage, setReviewImage] = useState<File | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    setSize(product.sizes[0])
    setColor(product.colors[0])
    setImg(0)
    setZoom(1)
    window.scrollTo({ top: 0 })
    setReviewsLoading(true)
    fetchReviews(product.id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false))
  }, [product.id])

  const addToCart = () => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      if (ex) return prev.map(i => i.product.id === product.id && i.size === size && i.color === color ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, size, color, qty: 1 }]
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const submitReview = async () => {
    if (!reviewName.trim() || !reviewComment.trim()) return
    setSubmittingReview(true)
    setReviewError('')
    try {
      const review = await createReview({
        productId: product.id,
        authorName: reviewName.trim(),
        rating: reviewRating,
        qualityRating: reviewQuality,
        priceRating: reviewPrice,
        deliveryRating: reviewDelivery,
        comment: reviewComment.trim(),
        imageFile: reviewImage ?? undefined,
      })
      setReviews(prev => [review, ...prev])
      setReviewName('')
      setReviewComment('')
      setReviewRating(5)
      setReviewQuality(5)
      setReviewPrice(5)
      setReviewDelivery(5)
      setReviewImage(null)
    } catch {
      setReviewError('خطا در ثبت نظر. لطفاً دوباره تلاش کنید.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const similarProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <>
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors mb-8 group">
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          بازگشت به محصولات
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="relative rounded-3xl overflow-hidden bg-navy-50 mb-4" style={{ aspectRatio: '1/1' }}>
              <img
                src={product.images[img]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300"
                style={{ transform: `scale(${zoom})` }}
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setZoom(z => Math.min(2.5, +(z + 0.25).toFixed(2)))}
                  disabled={zoom >= 2.5}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-700 hover:bg-navy-50 transition-colors disabled:opacity-30"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom(z => Math.max(1, +(z - 0.25).toFixed(2)))}
                  disabled={zoom <= 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-700 hover:bg-navy-50 transition-colors disabled:opacity-30"
                >
                  <ZoomOut size={16} />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => { setImg(i); setZoom(1) }}
                  className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-colors ${img === i ? 'border-navy-600' : 'border-transparent'}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="text-right">
            <p className="text-navy-400 text-sm mb-2">{product.category}</p>
            <h1 className="text-3xl font-bold text-navy-900 mb-3">{product.name}</h1>
            <StarRating rating={product.rating} count={product.reviews} />

            <div className="mt-6 mb-8">
              {product.originalPrice && (
                <p className="text-gray-400 line-through text-lg">{formatPrice(product.originalPrice)}</p>
              )}
              <p className="text-4xl font-bold text-navy-800">{formatPrice(product.price)}</p>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-navy-800">سایز: <span className="text-navy-500 font-normal">{size}</span></p>
                <SizeGuideButton />
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-12 h-12 rounded-xl font-medium text-sm transition-colors ${size === s ? 'bg-navy-800 text-white' : 'border border-navy-200 text-navy-700 hover:border-navy-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-8">
              <p className="font-semibold text-navy-800 mb-3">رنگ: <span className="text-navy-500 font-normal">{color}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${color === c ? 'bg-navy-800 text-white' : 'border border-navy-200 text-navy-700 hover:border-navy-500'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  !product.inStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                  added ? 'bg-green-500 text-white' : 'bg-navy-800 text-white hover:bg-navy-600 hover:shadow-lg'
                }`}
              >
                {!product.inStock ? (
                  <><XCircle size={20} /> ناموجود</>
                ) : added ? (
                  <><CheckCircle size={20} /> به سبد افزوده شد</>
                ) : (
                  <><ShoppingBag size={20} /> افزودن به سبد خرید</>
                )}
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                title="افزودن به علاقه‌مندی‌ها"
                className={`w-14 flex-shrink-0 rounded-2xl border transition-colors flex items-center justify-center ${
                  favorites.includes(product.id)
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-navy-200 text-navy-400 hover:border-navy-400 hover:text-navy-600'
                }`}
              >
                <Heart size={20} className={favorites.includes(product.id) ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-10">
              <div className="flex border-b border-navy-200 mb-4">
                {([['desc', 'توضیحات'], ['material', 'جنس'], ['care', 'مراقبت']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === key ? 'border-navy-700 text-navy-800' : 'border-transparent text-gray-500 hover:text-navy-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-navy-700 leading-relaxed text-sm">
                {tab === 'desc' && <p>{product.description}</p>}
                {tab === 'material' && <p>{product.material}</p>}
                {tab === 'care' && <p>{product.care}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 pt-10 border-t border-navy-200">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-navy-900">
              <Star size={22} className="fill-gold-500 text-gold-500" />
              نظرات مشتریان
            </h2>
            <div className="flex items-center gap-4 bg-navy-900 rounded-2xl px-5 py-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-gold-400">{product.rating.toLocaleString('fa-IR')}</p>
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={11} className={n <= Math.round(product.rating) ? 'fill-gold-400 text-gold-400' : 'text-navy-600'} />
                  ))}
                </div>
              </div>
              <div className="w-px h-8 bg-navy-700" />
              <p className="text-navy-300 text-xs">
                از <span className="text-white font-bold">{product.reviews.toLocaleString('fa-IR')}</span> نظر
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-navy-100/60 shadow-sm p-6 md:p-8 mb-10">
            <h3 className="flex items-center gap-2 font-bold text-navy-900 mb-6">
              <Pencil size={16} className="text-gold-500" />
              ثبت نظر شما
            </h3>
            <input
              value={reviewName}
              onChange={e => setReviewName(e.target.value)}
              placeholder="نام شما"
              className="w-full px-4 py-3 rounded-xl border border-navy-200 text-sm focus:outline-none focus:border-navy-500 text-right mb-5"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 bg-navy-50/60 rounded-2xl p-4">
              {([
                ['امتیاز کلی', reviewRating, setReviewRating],
                ['کیفیت', reviewQuality, setReviewQuality],
                ['قیمت', reviewPrice, setReviewPrice],
                ['ارسال', reviewDelivery, setReviewDelivery],
              ] as const).map(([label, value, setter]) => (
                <div key={label} className="text-center">
                  <p className="text-xs font-medium text-navy-600 mb-1.5">{label}</p>
                  <div className="flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setter(n)}>
                        <Star size={17} className={n <= value ? 'fill-gold-500 text-gold-500' : 'text-navy-200'} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="نظر خود را درباره این محصول بنویسید..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-navy-200 text-sm focus:outline-none focus:border-navy-500 text-right mb-4"
            />

            <label className="flex items-center gap-2 text-sm text-navy-600 border border-dashed border-navy-300 rounded-xl px-4 py-2.5 cursor-pointer hover:border-gold-400 hover:text-navy-800 transition-colors mb-5 w-fit">
              <Package size={15} className="text-navy-400" />
              {reviewImage ? reviewImage.name : 'افزودن عکس (اختیاری)'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setReviewImage(e.target.files?.[0] ?? null)}
              />
            </label>

            {reviewError && (
              <p className="flex items-center gap-1.5 text-red-500 text-sm mb-4">
                <AlertCircle size={14} />
                {reviewError}
              </p>
            )}
            <button
              onClick={submitReview}
              disabled={submittingReview || !reviewName.trim() || !reviewComment.trim()}
              className="bg-navy-800 text-white px-7 py-3 rounded-xl text-sm font-bold hover:bg-navy-600 transition-colors disabled:opacity-50"
            >
              {submittingReview ? 'در حال ثبت...' : 'ثبت نظر'}
            </button>
          </div>

          {reviewsLoading ? (
            <p className="text-navy-400 text-center py-8">در حال بارگذاری نظرات...</p>
          ) : reviews.length === 0 ? (
            <div className="text-center py-14 bg-white rounded-3xl border border-navy-100/50">
              <Star size={30} className="mx-auto mb-3 text-navy-200" />
              <p className="text-navy-400">هنوز نظری برای این محصول ثبت نشده است. اولین نفر باشید!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-navy-100/50 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-navy-800 text-gold-400 font-bold flex items-center justify-center flex-shrink-0">
                      {r.authorName.trim().charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-navy-900 text-sm truncate">{r.authorName}</span>
                        <span className="text-xs text-navy-400 flex-shrink-0">{formatDate(r.createdAt)}</span>
                      </div>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={13} className={n <= r.rating ? 'fill-gold-500 text-gold-500' : 'text-navy-200'} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-navy-700 text-sm leading-relaxed mb-3">{r.comment}</p>
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt="تصویر نظر کاربر" className="w-24 h-24 object-cover rounded-xl mb-3 border border-navy-100" />
                  )}
                  <div className="flex items-center gap-2 flex-wrap border-t border-navy-50 pt-3">
                    {([['کیفیت', r.qualityRating], ['قیمت', r.priceRating], ['ارسال', r.deliveryRating]] as const).map(([label, val]) => (
                      <span key={label} className="flex items-center gap-1 bg-navy-50 text-navy-600 text-xs px-2.5 py-1 rounded-full">
                        {label} <span className="font-bold text-navy-800">{val.toLocaleString('fa-IR')}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">محصولات مشابه</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {similarProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onView={() => onView(p)}
                  onAddCart={() => setCart(prev => {
                    const ex = prev.find(i => i.product.id === p.id)
                    if (ex) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)
                    return [...prev, { product: p, size: p.sizes[0], color: p.colors[0], qty: 1 }]
                  })}
                  onCompare={() => toggleCompare(p.id)}
                  comparing={compare.includes(p.id)}
                  liked={favorites.includes(p.id)}
                  onToggleLike={() => toggleFavorite(p.id)}
                  onQuickView={() => onQuickView(p)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    <SiteFooter setPage={setPage} goToProducts={goToProducts} goToPolicy={goToPolicy} />
    </>
  )
}

function CartPage({
  cart,
  setCart,
  onCheckout,
}: {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  onCheckout: () => void
}) {
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const shipping = total >= 500_000 ? 0 : 50_000

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], qty: Math.max(1, updated[idx].qty + delta) }
      return updated
    })
  }

  const remove = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx))

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-navy-900 mb-8">سبد خرید</h2>
        {cart.length === 0 ? (
          <div className="text-center py-24 text-navy-400">
            <ShoppingBag size={60} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl font-medium">سبد خرید شما خالی است</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-navy-100/50">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-24 h-28 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-navy-900 mb-1">{item.product.name}</h3>
                    <p className="text-sm text-navy-500 mb-1">سایز: {item.size} | رنگ: {item.color}</p>
                    <p className="font-bold text-navy-800 mb-3">{formatPrice(item.product.price)}</p>
                    <div className="flex items-center justify-between">
                      <button onClick={() => remove(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <div className="flex items-center gap-2 bg-navy-50 rounded-xl p-1">
                        <button onClick={() => updateQty(idx, 1)} className="w-7 h-7 rounded-lg bg-navy-800 text-white flex items-center justify-center hover:bg-navy-600 transition-colors">
                          <Plus size={13} />
                        </button>
                        <span className="w-8 text-center font-bold text-navy-800">{item.qty.toLocaleString('fa-IR')}</span>
                        <button onClick={() => updateQty(idx, -1)} className="w-7 h-7 rounded-lg bg-white border border-navy-200 flex items-center justify-center hover:border-navy-500 transition-colors">
                          <Minus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-navy-100/50 h-fit sticky top-24">
              <h3 className="font-bold text-navy-900 text-lg mb-6 pb-4 border-b border-navy-100">خلاصه سفارش</h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-navy-700">
                  <span>{formatPrice(total)}</span>
                  <span>جمع کل</span>
                </div>
                <div className="flex justify-between text-sm text-navy-700">
                  <span>{shipping === 0 ? 'رایگان' : formatPrice(shipping)}</span>
                  <span>هزینه ارسال</span>
                </div>
                <div className="border-t border-navy-100 pt-3 flex justify-between font-bold text-navy-900">
                  <span>{formatPrice(total + shipping)}</span>
                  <span>مبلغ نهایی</span>
                </div>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-navy-800 text-white py-4 rounded-2xl font-bold hover:bg-navy-600 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} />
                ادامه خرید
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CheckoutPage({ cart, onDone }: { cart: CartItem[]; onDone: () => void }) {
  const [step, setStep] = useState<'address' | 'payment' | 'done'>('address')
  const [form, setForm] = useState({ name: '', phone: '', address: '', postal: '' })
  const [payMethod, setPayMethod] = useState<'online' | 'cod'>('online')
  const [orderCode, setOrderCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0)

  const confirmOrder = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const order = await createOrder({
        cart,
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        postalCode: form.postal,
        paymentMethod: payMethod,
      })
      setOrderCode(order.code)
      if (getMockPhone()) rememberMockOrder(order.code)
      setStep('done')
    } catch {
      setSubmitError('خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl max-w-md w-full mx-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-3">سفارش ثبت شد!</h2>
          <p className="text-navy-500 mb-2">کد پیگیری سفارش شما:</p>
          <p className="text-3xl font-bold text-navy-800 mb-6" dir="ltr">{orderCode}</p>
          <p className="text-sm text-navy-500 mb-8">پیامک تأیید به شماره شما ارسال خواهد شد.</p>
          <button onClick={onDone} className="w-full bg-navy-800 text-white py-3 rounded-2xl font-bold hover:bg-navy-600 transition-colors">
            بازگشت به خانه
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-3xl font-bold text-navy-900 mb-8">تکمیل خرید</h2>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {['آدرس', 'پرداخت'].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                (i === 0 && step === 'address') || (i === 1 && step === 'payment') ? 'bg-navy-800 text-white' : i < (step === 'payment' ? 1 : 0) ? 'bg-green-500 text-white' : 'bg-navy-100 text-navy-500'
              }`}>{i + 1}</div>
              <span className="text-sm font-medium text-navy-700">{s}</span>
              {i < 1 && <div className="w-12 h-px bg-navy-200" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100/50">
          {step === 'address' ? (
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-6">آدرس تحویل</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {([
                  ['name', 'نام و نام خانوادگی', 'text'],
                  ['phone', 'شماره تماس', 'tel'],
                  ['address', 'آدرس کامل', 'text'],
                  ['postal', 'کد پستی', 'text'],
                ] as const).map(([key, label, type]) => (
                  <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-navy-700 mb-2">{label}</label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-right"
                      dir="rtl"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => setStep('payment')}
                disabled={!form.name || !form.phone || !form.address}
                className="mt-6 w-full bg-navy-800 text-white py-4 rounded-2xl font-bold hover:bg-navy-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                مرحله بعد: پرداخت
              </button>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-navy-900 mb-6">روش پرداخت</h3>
              <div className="space-y-3 mb-6">
                {[
                  ['online', 'پرداخت آنلاین (درگاه بانکی)', <CreditCard size={20} />],
                  ['cod', 'پرداخت در محل', <Package size={20} />],
                ].map(([val, label, icon]) => (
                  <label key={val as string} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${payMethod === val ? 'border-navy-600 bg-navy-50' : 'border-navy-100 hover:border-navy-300'}`}>
                    <input type="radio" name="pay" value={val as string} checked={payMethod === val} onChange={() => setPayMethod(val as 'online' | 'cod')} className="hidden" />
                    <div className={`text-${payMethod === val ? 'navy-700' : 'gray-400'}`}>{icon as React.ReactNode}</div>
                    <span className="font-medium text-navy-800">{label as string}</span>
                    {payMethod === val && <CheckCircle size={18} className="mr-auto text-navy-600" />}
                  </label>
                ))}
              </div>
              <div className="bg-navy-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between font-bold text-navy-900">
                  <span>{formatPrice(total)}</span>
                  <span>مبلغ قابل پرداخت</span>
                </div>
              </div>
              {submitError && (
                <div className="mb-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep('address')} disabled={submitting} className="flex-1 border border-navy-200 text-navy-700 py-4 rounded-2xl font-medium hover:border-navy-500 transition-colors disabled:opacity-40">
                  بازگشت
                </button>
                <button
                  onClick={confirmOrder}
                  disabled={submitting}
                  className="flex-2 flex-[2] bg-navy-800 text-white py-4 rounded-2xl font-bold hover:bg-navy-600 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'در حال ثبت سفارش...' : 'تأیید و پرداخت'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TrackingPage() {
  const [code, setCode] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const currentStep = order ? ORDER_STATUS_STEPS.indexOf(order.status) : -1

  const search = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(false)
    try {
      const found = await fetchOrderByCode(code)
      setOrder(found)
      setError(!found)
    } catch {
      setOrder(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6 max-w-2xl">
        <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">پیگیری سفارش</h2>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100/50 mb-8">
          <p className="text-navy-600 mb-4 text-center">کد پیگیری سفارش خود را وارد کنید</p>
          <div className="flex gap-3">
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="مثال: BRD-7K2F9QXM"
              className="flex-1 px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-right"
              dir="ltr"
            />
            <button onClick={search} disabled={loading} className="bg-navy-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-navy-600 transition-colors disabled:opacity-60">
              {loading ? '...' : 'پیگیری'}
            </button>
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
              <AlertCircle size={16} />
              <span>سفارشی با این کد پیدا نشد</span>
            </div>
          )}
        </div>

        {order && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100/50">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-sm text-navy-500">تاریخ ثبت</p>
                <p className="font-bold text-navy-800">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-navy-500">کد سفارش</p>
                <p className="font-bold text-navy-800" dir="ltr">{order.code}</p>
              </div>
            </div>

            {order.status === 'cancelled' ? (
              <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
                <XCircle size={20} className="text-red-500" />
                <p className="font-medium text-red-600">این سفارش لغو شده است</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute top-4 right-4 left-4 h-0.5 bg-navy-100" />
                <div
                  className="absolute top-4 right-4 h-0.5 bg-navy-700 transition-all duration-700"
                  style={{ width: `${(currentStep / (ORDER_STATUS_STEPS.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {ORDER_STATUS_STEPS.map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${i <= currentStep ? 'bg-navy-800 text-white' : 'bg-navy-100 text-navy-400'}`}>
                        {i < currentStep ? <CheckCircle size={16} /> : (i + 1).toLocaleString('fa-IR')}
                      </div>
                      <span className={`text-xs font-medium text-center max-w-[70px] ${i <= currentStep ? 'text-navy-800' : 'text-navy-400'}`}>{ORDER_STATUS_LABELS[s]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 bg-navy-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-navy-600" />
                <div className="text-right">
                  <p className="font-medium text-navy-800">{ORDER_STATUS_LABELS[order.status]}</p>
                  <p className="text-sm text-navy-500">آدرس: {order.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, from: 'agent', text: 'سلام! به پشتیبانی فروشگاه بردبار خوش آمدید. چطور می‌توانم کمکتان کنم؟', time: '۱۰:۳۰' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const autoReplies: Record<string, string> = {
    'default': 'متوجه شدم. یک لحظه صبر کنید تا با کارشناس ارتباط بگیریم.',
    'تخفیف': 'کد تخفیف BORDBAR10 برای ۱۰٪ تخفیف روی اولین خریدتان فعال است!',
    'ارسال': 'ارسال به تمام استان‌های ایران طی ۳-۵ روز کاری انجام می‌شود. خریدهای بالای ۵۰۰ هزار تومان ارسال رایگان دارند.',
    'مرجوعی': 'شما ۷ روز فرصت مرجوع کردن کالا دارید. برای ثبت درخواست مرجوعی همین‌جا اطلاع دهید.',
    'سایز': 'جدول سایزبندی کامل در صفحه هر محصول موجود است. اگر بین دو سایز هستید، سایز بزرگ‌تر توصیه می‌شود.',
  }

  const send = () => {
    if (!input.trim()) return
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    const userMsg: ChatMessage = { id: Date.now(), from: 'user', text: input, time }
    const key = Object.keys(autoReplies).find(k => input.includes(k)) || 'default'
    const agentMsg: ChatMessage = { id: Date.now() + 1, from: 'agent', text: autoReplies[key], time }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTimeout(() => setMessages(prev => [...prev, agentMsg]), 800)
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6 max-w-2xl">
        <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">پشتیبانی آنلاین</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100/50 overflow-hidden">
          <div className="bg-navy-800 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-400 flex items-center justify-center text-navy-900 font-bold">پ</div>
            <div className="text-right">
              <p className="text-white font-bold text-sm">پشتیبانی بردبار</p>
              <p className="text-navy-300 text-xs">آنلاین</p>
            </div>
            <div className="mr-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-navy-50/30" dir="rtl">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${msg.from === 'agent' ? 'bg-navy-800 text-gold-400' : 'bg-gold-400 text-navy-900'}`}>
                  {msg.from === 'agent' ? 'پ' : 'ش'}
                </div>
                <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.from === 'agent' ? 'bg-white text-navy-800 rounded-tr-none shadow-sm' : 'bg-navy-800 text-white rounded-tl-none'}`}>
                  {msg.text}
                  <p className={`text-xs mt-1 ${msg.from === 'agent' ? 'text-navy-400' : 'text-navy-300'}`} dir="ltr">{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="p-4 border-t border-navy-100 flex gap-3">
            <button onClick={send} className="w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center hover:bg-navy-600 transition-colors flex-shrink-0">
              <Send size={16} className="rotate-180" />
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 px-4 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-right text-sm"
              dir="rtl"
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {['ارسال', 'مرجوعی', 'سایز', 'تخفیف', 'موجودی', 'رزرو'].map(t => (
            <button key={t} onClick={() => setInput(t)} className="bg-white border border-navy-200 text-navy-700 text-sm py-2 px-3 rounded-xl hover:border-navy-500 transition-colors">
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ComparePage({ products, compare, onBack }: { products: Product[]; compare: number[]; onBack: () => void }) {
  const items = products.filter(p => compare.includes(p.id))

  if (items.length < 2) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Scale size={50} className="mx-auto mb-4 text-navy-300" />
          <h2 className="text-2xl font-bold text-navy-900 mb-2">مقایسه محصولات</h2>
          <p className="text-navy-500 mb-6">حداقل ۲ محصول انتخاب کنید</p>
          <button onClick={onBack} className="bg-navy-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-navy-600 transition-colors">
            بازگشت به محصولات
          </button>
        </div>
      </div>
    )
  }

  const fields: [string, (p: Product) => string][] = [
    ['قیمت', p => formatPrice(p.price)],
    ['دسته', p => p.category],
    ['امتیاز', p => `${p.rating} از ۵`],
    ['تعداد نظر', p => p.reviews.toLocaleString('fa-IR')],
    ['سایزها', p => p.sizes.join('، ')],
    ['رنگ‌ها', p => p.colors.join('، ')],
    ['جنس', p => p.material],
    ['موجودی', p => p.inStock ? 'موجود' : 'ناموجود'],
  ]

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors">
            <ArrowRight size={18} />
            بازگشت
          </button>
          <h2 className="text-3xl font-bold text-navy-900">مقایسه محصولات</h2>
        </div>
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100/50 overflow-hidden">
          <div className="grid" style={{ gridTemplateColumns: `160px repeat(${items.length}, 1fr)` }}>
            <div className="p-4 bg-navy-50" />
            {items.map(p => (
              <div key={p.id} className="p-4 border-r border-navy-100 text-center">
                <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover rounded-2xl mb-3" />
                <h3 className="font-bold text-navy-900 text-sm">{p.name}</h3>
              </div>
            ))}
            {fields.map(([label, getter]) => (
              <>
                <div key={label} className="p-4 bg-navy-50 font-medium text-navy-700 text-sm border-t border-navy-100 flex items-center justify-start">{label}</div>
                {items.map(p => (
                  <div key={p.id + label} className={`p-4 text-center border-r border-t border-navy-100 text-sm ${label === 'موجودی' ? (p.inStock ? 'text-green-600 font-medium' : 'text-red-400') : 'text-navy-700'}`}>
                    {getter(p)}
                  </div>
                ))}
              </>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FavoritesPage({
  products,
  favorites,
  toggleFavorite,
  compare,
  toggleCompare,
  onView,
  setCart,
  onBack,
  onQuickView,
}: {
  products: Product[]
  favorites: number[]
  toggleFavorite: (id: number) => void
  compare: number[]
  toggleCompare: (id: number) => void
  onView: (p: Product) => void
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  onBack: () => void
  onQuickView: (p: Product) => void
}) {
  const items = products.filter(p => favorites.includes(p.id))

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id)
      if (ex) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product: p, size: p.sizes[0], color: p.colors[0], qty: 1 }]
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Heart size={50} className="mx-auto mb-4 text-navy-300" />
          <h2 className="text-2xl font-bold text-navy-900 mb-2">لیست علاقه‌مندی‌ها</h2>
          <p className="text-navy-500 mb-6">هنوز محصولی را به علاقه‌مندی‌ها اضافه نکرده‌اید</p>
          <button onClick={onBack} className="bg-navy-800 text-white px-8 py-3 rounded-2xl font-bold hover:bg-navy-600 transition-colors">
            مشاهده محصولات
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors">
            <ArrowRight size={18} />
            بازگشت
          </button>
          <h2 className="flex items-center gap-2 text-3xl font-bold text-navy-900">
            <Heart size={26} className="fill-red-500 text-red-500" />
            علاقه‌مندی‌ها
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onView={() => onView(p)}
              onAddCart={() => addToCart(p)}
              onCompare={() => toggleCompare(p.id)}
              comparing={compare.includes(p.id)}
              liked={favorites.includes(p.id)}
              onToggleLike={() => toggleFavorite(p.id)}
              onQuickView={() => onQuickView(p)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function CancelOrderPage() {
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form')
  const [reason, setReason] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const reasons = ['تغییر نظر', 'پیدا کردن محصول بهتر', 'مشکل مالی', 'تأخیر در ارسال', 'سفارش اشتباه', 'سایر']

  const lookupAndProceed = async () => {
    setLookupError('')
    setSubmitting(true)
    try {
      const found = await fetchOrderByCode(code)
      if (!found) {
        setLookupError('سفارشی با این کد پیدا نشد')
        return
      }
      if (found.status === 'shipped' || found.status === 'delivered' || found.status === 'cancelled') {
        setLookupError('این سفارش دیگر قابل لغو نیست')
        return
      }
      setOrder(found)
      setStep('confirm')
    } catch {
      setLookupError('خطا در بررسی سفارش')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmCancel = async () => {
    if (!order) return
    setSubmitting(true)
    try {
      await updateOrderStatus(order.id, 'cancelled')
      setStep('done')
    } catch {
      setLookupError('خطا در لغو سفارش')
      setStep('form')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl max-w-md w-full mx-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-3">سفارش لغو شد</h2>
          <p className="text-navy-500 mb-6">درخواست لغو سفارش شما با موفقیت ثبت شد. مبلغ ظرف ۳-۵ روز کاری به حساب شما بازگشت خواهد یافت.</p>
          <p className="text-sm text-navy-400 bg-navy-50 rounded-xl p-3" dir="ltr">{order?.code}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6 max-w-lg">
        <h2 className="text-3xl font-bold text-navy-900 mb-8 text-center">لغو سفارش</h2>
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100/50">
          {step === 'form' ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
                <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">سفارش‌هایی که وضعیت "تحویل به پیک/پست" یا بعد از آن دارند قابل لغو نیستند.</p>
              </div>
              <label className="block text-sm font-medium text-navy-700 mb-2">کد سفارش</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="BRD-XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 mb-5 text-right"
                dir="ltr"
              />
              <label className="block text-sm font-medium text-navy-700 mb-3">دلیل لغو</label>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {reasons.map(r => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`py-2 px-3 rounded-xl text-sm border transition-colors text-right ${reason === r ? 'bg-navy-800 text-white border-navy-800' : 'border-navy-200 text-navy-700 hover:border-navy-500'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {lookupError && (
                <div className="mb-4 flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl">
                  <AlertCircle size={16} />
                  <span>{lookupError}</span>
                </div>
              )}
              <button
                onClick={lookupAndProceed}
                disabled={!code || !reason || submitting}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'در حال بررسی...' : 'ادامه'}
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-navy-900 mb-4 text-center">تأیید لغو</h3>
              <div className="bg-navy-50 rounded-xl p-4 mb-6 space-y-2 text-right">
                <div className="flex justify-between text-sm"><span className="text-navy-500">کد سفارش:</span><span className="font-bold text-navy-800" dir="ltr">{code}</span></div>
                <div className="flex justify-between text-sm"><span className="text-navy-500">دلیل:</span><span className="text-navy-700">{reason}</span></div>
              </div>
              <p className="text-sm text-center text-navy-500 mb-6">آیا مطمئن هستید که می‌خواهید این سفارش را لغو کنید؟</p>
              <div className="flex gap-3">
                <button onClick={() => setStep('form')} disabled={submitting} className="flex-1 border border-navy-200 text-navy-700 py-3 rounded-2xl font-medium hover:border-navy-500 transition-colors disabled:opacity-40">
                  انصراف
                </button>
                <button onClick={confirmCancel} disabled={submitting} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
                  {submitting ? 'در حال لغو...' : 'لغو سفارش'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function AuthPage({ onSuccess }: { onSuccess: () => void }) {
  const [phone, setPhone] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    mockSignIn(phone)
    onSuccess()
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-16 px-4">
      <form onSubmit={submit} className="bg-white rounded-3xl p-8 shadow-sm border border-navy-100/50 max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl bg-navy-800 flex items-center justify-center mx-auto mb-6">
          <User size={24} className="text-gold-400" />
        </div>
        <h1 className="text-xl font-bold text-navy-900 text-center mb-1">ورود / ثبت‌نام</h1>
        <p className="text-sm text-navy-500 text-center mb-6">شماره موبایل خود را وارد کنید</p>

        <input
          type="tel"
          required
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="09xxxxxxxxx"
          className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 mb-5 text-center"
          dir="ltr"
        />

        <button
          type="submit"
          className="w-full bg-navy-800 text-white py-3 rounded-2xl font-bold hover:bg-navy-600 transition-colors"
        >
          ورود / ثبت‌نام
        </button>
      </form>
    </div>
  )
}

const ACCOUNT_ORDER_STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-navy-100 text-navy-700',
  gathering: 'bg-amber-100 text-amber-700',
  packaging: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

function AccountPage({ onSignOut, initialTab }: { onSignOut: () => void; initialTab: AccountTab }) {
  const [tab, setTab] = useState<AccountTab>(initialTab)
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    const profile = getMockProfile()
    setPhone(profile.phone)
    setFullName(profile.fullName)
    setAddress(profile.address)
    setPostalCode(profile.postalCode)

    const codes = getMockOrderCodes()
    Promise.all(codes.map(code => fetchOrderByCode(code).catch(() => null)))
      .then(results => setOrders(results.filter((o): o is Order => o !== null)))
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = () => {
    saveMockProfile({ fullName, address, postalCode })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return <div className="min-h-screen bg-cream flex items-center justify-center text-navy-400">در حال بارگذاری...</div>
  }

  const totalSpent = orders.reduce((s, o) => s + o.total, 0)

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-navy-900 pt-10 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 items-center">
            <div />
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center text-navy-900 font-bold text-2xl mb-3">
                {fullName.trim() ? fullName.trim().charAt(0) : <User size={26} />}
              </div>
              <p className="text-white font-bold text-lg">{fullName || 'کاربر بردبار'}</p>
              <p className="text-navy-300 text-sm" dir="ltr">{phone}</p>
            </div>
            <div className="flex justify-start">
              <button onClick={onSignOut} className="flex items-center gap-2 text-navy-300 hover:text-white text-sm font-medium transition-colors">
                <XCircle size={16} />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-3xl -mt-10 pb-10">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-md border border-navy-100/50 text-center">
            <p className="text-2xl font-bold text-navy-900">{orders.length.toLocaleString('fa-IR')}</p>
            <p className="text-xs text-navy-500 mt-1">سفارش ثبت شده</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-md border border-navy-100/50 text-center">
            <p className="text-2xl font-bold text-navy-900">{formatPrice(totalSpent)}</p>
            <p className="text-xs text-navy-500 mt-1">مجموع خرید</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: 'profile' as AccountTab, label: 'پروفایل من', icon: <User size={16} /> },
            { key: 'orders' as AccountTab, label: 'سفارش‌های من', icon: <Package size={16} /> },
            { key: 'payments' as AccountTab, label: 'تاریخچه پرداخت', icon: <CreditCard size={16} /> },
            { key: 'edit' as AccountTab, label: 'ویرایش حساب', icon: <Pencil size={16} /> },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.key ? 'bg-navy-800 text-white' : 'bg-white text-navy-600 border border-navy-100/50 hover:bg-navy-50'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100/50">
            <h3 className="flex items-center gap-2 font-bold text-navy-900 mb-5">
              <User size={17} className="text-gold-500" />
              اطلاعات من
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-50/60">
                <User size={16} className="text-navy-400" />
                <div>
                  <p className="text-xs text-navy-400">نام و نام خانوادگی</p>
                  <p className="font-medium text-navy-900">{fullName || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-50/60">
                <Phone size={16} className="text-navy-400" />
                <div>
                  <p className="text-xs text-navy-400">شماره موبایل</p>
                  <p className="font-medium text-navy-900" dir="ltr">{phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-50/60">
                <MapPin size={16} className="text-navy-400" />
                <div>
                  <p className="text-xs text-navy-400">آدرس</p>
                  <p className="font-medium text-navy-900">{address || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-50/60">
                <Package size={16} className="text-navy-400" />
                <div>
                  <p className="text-xs text-navy-400">کد پستی</p>
                  <p className="font-medium text-navy-900" dir="ltr">{postalCode || '—'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setTab('edit')}
              className="mt-5 flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold bg-navy-800 text-white hover:bg-navy-600 transition-colors"
            >
              <Pencil size={14} />
              ویرایش اطلاعات
            </button>
          </div>
        )}

        {tab === 'edit' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100/50">
            <h3 className="flex items-center gap-2 font-bold text-navy-900 mb-5">
              <Pencil size={17} className="text-gold-500" />
              ویرایش حساب
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 mb-2">
                  <User size={14} className="text-navy-400" />
                  نام و نام خانوادگی
                </label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="نام خود را وارد کنید"
                  className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-right"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 mb-2">
                  <Phone size={14} className="text-navy-400" />
                  شماره موبایل
                </label>
                <input
                  value={phone}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-navy-200 bg-navy-50 text-navy-400"
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 mb-2">
                  <MapPin size={14} className="text-navy-400" />
                  آدرس
                </label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="آدرس تحویل سفارش"
                  className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-right"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 mb-2">
                  <Package size={14} className="text-navy-400" />
                  کد پستی
                </label>
                <input
                  value={postalCode}
                  onChange={e => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-right"
                />
              </div>
            </div>
            <button
              onClick={saveProfile}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${saved ? 'bg-green-500 text-white' : 'bg-navy-800 text-white hover:bg-navy-600'}`}
            >
              {saved ? 'ذخیره شد ✓' : 'ذخیره تغییرات'}
            </button>
          </div>
        )}

        {tab === 'orders' && (
          orders.length === 0 ? (
            <div className="text-center py-16 text-navy-400 bg-white rounded-3xl border border-navy-100/50">
              <Package size={32} className="mx-auto mb-3 opacity-30" />
              <p>هنوز سفارشی ثبت نکرده‌اید</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-navy-100/50 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${ACCOUNT_ORDER_STATUS_COLORS[order.status]}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <div className="text-right">
                      <p className="font-bold text-navy-900" dir="ltr">{order.code}</p>
                      <p className="text-xs text-navy-400">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-navy-50 text-sm">
                    <span className="font-bold text-navy-900">{formatPrice(order.total)}</span>
                    <span className="text-navy-500">{order.items.length.toLocaleString('fa-IR')} کالا</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'payments' && (
          orders.length === 0 ? (
            <div className="text-center py-16 text-navy-400 bg-white rounded-3xl border border-navy-100/50">
              <CreditCard size={32} className="mx-auto mb-3 opacity-30" />
              <p>هنوز پرداختی ثبت نشده است</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-navy-100/50 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-500">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-navy-900 text-sm">{order.paymentMethod === 'online' ? 'پرداخت آنلاین' : 'پرداخت در محل'}</p>
                      <p className="text-xs text-navy-400">{formatDate(order.createdAt)} · <span dir="ltr">{order.code}</span></p>
                    </div>
                  </div>
                  <span className="font-bold text-navy-900">{formatPrice(order.total)}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

const POLICY_CONTENT: Record<PolicyTab, { title: string; icon: React.ReactNode; sections: { heading: string; body: string[] }[] }> = {
  privacy: {
    title: 'حریم خصوصی',
    icon: <Lock size={17} className="text-gold-500" />,
    sections: [
      {
        heading: 'چه اطلاعاتی جمع‌آوری می‌شود؟',
        body: [
          'برای ثبت و ارسال سفارش، تنها اطلاعاتی مانند نام، شماره موبایل، آدرس و کد پستی شما ذخیره می‌شود.',
          'اطلاعات پرداخت شما مستقیماً توسط درگاه بانکی پردازش می‌شود و در سرورهای بردبار ذخیره نمی‌گردد.',
        ],
      },
      {
        heading: 'اطلاعات شما چگونه استفاده می‌شود؟',
        body: [
          'اطلاعات شما فقط برای پردازش سفارش، اطلاع‌رسانی وضعیت ارسال و پاسخ‌گویی به درخواست‌های پشتیبانی استفاده می‌شود.',
          'اطلاعات شخصی مشتریان هرگز به اشخاص ثالث فروخته یا اجاره داده نمی‌شود.',
        ],
      },
      {
        heading: 'کوکی‌ها',
        body: [
          'برای حفظ سبد خرید و لیست علاقه‌مندی‌ها میان بازدیدهای شما از مرورگر استفاده می‌شود و هیچ اطلاعات حساسی در آن ذخیره نمی‌گردد.',
        ],
      },
    ],
  },
  terms: {
    title: 'شرایط استفاده',
    icon: <FileText size={17} className="text-gold-500" />,
    sections: [
      {
        heading: 'استفاده از فروشگاه',
        body: [
          'استفاده از فروشگاه بردبار به معنای پذیرش این شرایط است. لطفاً هنگام ثبت سفارش، اطلاعات صحیح و به‌روز وارد کنید.',
        ],
      },
      {
        heading: 'قیمت و موجودی کالا',
        body: [
          'قیمت و موجودی محصولات ممکن است بدون اطلاع قبلی تغییر کند. قیمت نهایی، قیمتی است که در لحظه ثبت سفارش نمایش داده می‌شود.',
        ],
      },
      {
        heading: 'مالکیت محتوا',
        body: [
          'تمامی تصاویر، متن‌ها و طراحی‌های فروشگاه بردبار متعلق به این برند است و کپی‌برداری بدون اجازه کتبی مجاز نیست.',
        ],
      },
    ],
  },
  returns: {
    title: 'بازگشت و مرجوعی',
    icon: <RotateCcw size={17} className="text-gold-500" />,
    sections: [
      {
        heading: 'مهلت مرجوعی',
        body: [
          'شما تا ۷ روز پس از تحویل سفارش فرصت دارید تا در صورت عدم رضایت، درخواست مرجوعی یا تبدیل کالا را ثبت کنید.',
        ],
      },
      {
        heading: 'شرایط پذیرش مرجوعی',
        body: [
          'کالا باید کاملاً نو، بدون استفاده و همراه با برچسب و بسته‌بندی اصلی باشد.',
          'لباس‌های زیر، محصولات حراج نهایی و کالاهای سفارشی/سایز خاص قابل مرجوعی نیستند.',
        ],
      },
      {
        heading: 'روش ثبت درخواست',
        body: [
          'برای ثبت درخواست مرجوعی یا لغو سفارش، از صفحه «لغو سفارش» استفاده کنید یا با پشتیبانی گفتگوی آنلاین در ارتباط باشید.',
          'پس از تأیید و بازگشت کالا، مبلغ ظرف ۳ تا ۵ روز کاری به همان روش پرداخت اولیه بازگردانده می‌شود.',
        ],
      },
    ],
  },
}

function PolicyPage({ initialTab }: { initialTab: PolicyTab }) {
  const [tab, setTab] = useState<PolicyTab>(initialTab)

  useEffect(() => {
    setTab(initialTab)
  }, [initialTab])

  const content = POLICY_CONTENT[tab]

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {(Object.keys(POLICY_CONTENT) as PolicyTab[]).map(key => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === key ? 'bg-navy-800 text-white' : 'bg-white text-navy-600 border border-navy-100/50 hover:bg-navy-50'
              }`}
            >
              {POLICY_CONTENT[key].icon}
              {POLICY_CONTENT[key].title}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-navy-100/60 shadow-sm p-6 md:p-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-navy-900 mb-6">
            {content.icon}
            {content.title}
          </h1>
          <div className="space-y-6">
            {content.sections.map(section => (
              <div key={section.heading}>
                <h3 className="font-bold text-navy-800 mb-2">{section.heading}</h3>
                {section.body.map((p, i) => (
                  <p key={i} className="text-navy-600 text-sm leading-relaxed mb-1.5 last:mb-0">{p}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const SIZE_CHART: { size: string; bust: string; waist: string; hip: string }[] = [
  { size: 'XS', bust: '۸۲-۸۶', waist: '۶۲-۶۶', hip: '۸۸-۹۲' },
  { size: 'S', bust: '۸۶-۹۰', waist: '۶۶-۷۰', hip: '۹۲-۹۶' },
  { size: 'M', bust: '۹۰-۹۴', waist: '۷۰-۷۴', hip: '۹۶-۱۰۰' },
  { size: 'L', bust: '۹۴-۹۸', waist: '۷۴-۷۸', hip: '۱۰۰-۱۰۴' },
  { size: 'XL', bust: '۹۸-۱۰۴', waist: '۷۸-۸۴', hip: '۱۰۴-۱۱۰' },
]

function SizeGuideButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-800 underline transition-colors"
      >
        <Ruler size={12} />
        راهنمای سایز
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-navy-50 flex items-center justify-center text-navy-500 hover:bg-navy-100 transition-colors">
                <X size={15} />
              </button>
              <h3 className="flex items-center gap-2 font-bold text-navy-900">
                <Ruler size={17} className="text-gold-500" />
                راهنمای سایز
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-navy-50 text-navy-700">
                    <th className="p-3 rounded-tr-xl">سایز</th>
                    <th className="p-3">دور سینه (cm)</th>
                    <th className="p-3">دور کمر (cm)</th>
                    <th className="p-3 rounded-tl-xl">دور باسن (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map(row => (
                    <tr key={row.size} className="border-b border-navy-50 last:border-0">
                      <td className="p-3 font-bold text-navy-900">{row.size}</td>
                      <td className="p-3 text-navy-600">{row.bust}</td>
                      <td className="p-3 text-navy-600">{row.waist}</td>
                      <td className="p-3 text-navy-600">{row.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-navy-400 mt-4 leading-relaxed">
              اندازه‌ها تقریبی هستند. در صورت بین دو سایز بودن، پیشنهاد می‌کنیم سایز بزرگ‌تر را انتخاب کنید.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

function QuickViewModal({
  product,
  onClose,
  setCart,
  favorites,
  toggleFavorite,
  onViewFull,
}: {
  product: Product
  onClose: () => void
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  favorites: number[]
  toggleFavorite: (id: number) => void
  onViewFull: () => void
}) {
  const [size, setSize] = useState(product.sizes[0])
  const [color, setColor] = useState(product.colors[0])
  const [added, setAdded] = useState(false)

  useEffect(() => {
    setSize(product.sizes[0])
    setColor(product.colors[0])
    setAdded(false)
  }, [product.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const addToCart = () => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      if (ex) return prev.map(i => i.product.id === product.id && i.size === size && i.color === color ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, size, color, qty: 1 }]
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2" onClick={e => e.stopPropagation()}>
        <div className="relative bg-navy-50" style={{ aspectRatio: '4/5' }}>
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
            <X size={16} className="text-navy-700" />
          </button>
        </div>
        <div className="p-6 md:p-7 text-right flex flex-col">
          <p className="text-navy-400 text-xs mb-1">{product.category}</p>
          <h2 className="text-xl font-bold text-navy-900 mb-2">{product.name}</h2>
          <StarRating rating={product.rating} count={product.reviews} />
          <div className="my-4">
            {product.originalPrice && (
              <p className="text-gray-400 line-through text-sm">{formatPrice(product.originalPrice)}</p>
            )}
            <p className="text-2xl font-bold text-navy-800">{formatPrice(product.price)}</p>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-navy-600 mb-2">سایز: <span className="text-navy-900 font-bold">{size}</span></p>
            <div className="flex gap-1.5 flex-wrap">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-colors ${size === s ? 'bg-navy-800 text-white' : 'border border-navy-200 text-navy-700 hover:border-navy-500'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-navy-600 mb-2">رنگ: <span className="text-navy-900 font-bold">{color}</span></p>
            <div className="flex gap-1.5 flex-wrap">
              {product.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${color === c ? 'bg-navy-800 text-white' : 'border border-navy-200 text-navy-700 hover:border-navy-500'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-auto">
            <button
              onClick={addToCart}
              disabled={!product.inStock}
              className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                !product.inStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : added ? 'bg-green-500 text-white' : 'bg-navy-800 text-white hover:bg-navy-600'
              }`}
            >
              {!product.inStock ? (
                <><XCircle size={16} /> ناموجود</>
              ) : added ? (
                <><CheckCircle size={16} /> افزوده شد</>
              ) : (
                <><ShoppingBag size={16} /> افزودن به سبد</>
              )}
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              className={`w-12 flex-shrink-0 rounded-xl border flex items-center justify-center transition-colors ${
                favorites.includes(product.id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-navy-200 text-navy-400 hover:border-navy-400'
              }`}
            >
              <Heart size={17} className={favorites.includes(product.id) ? 'fill-red-500' : ''} />
            </button>
          </div>
          <button onClick={onViewFull} className="mt-3 text-sm text-navy-600 hover:text-navy-900 underline text-center transition-colors">
            مشاهده کامل محصول
          </button>
        </div>
      </div>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="text-right">
            <p className="text-gold-500 font-medium mb-3">درباره ما</p>
            <h2 className="text-3xl font-bold text-navy-900 mb-6">فروشگاه بردبار</h2>
            <p className="text-navy-600 leading-relaxed mb-6">
              فروشگاه بردبار با بیش از یک دهه تجربه در زمینه پوشاک زنانه، همواره متعهد به ارائه محصولاتی با کیفیت برتر و طراحی‌های منحصربه‌فرد بوده است.
            </p>
            <p className="text-navy-600 leading-relaxed">
              ما با انتخاب دقیق پارچه‌های اعلا و همکاری با طراحان برتر، مجموعه‌هایی خلق می‌کنیم که هم ظریف و هم بادوام هستند.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=700&h=500&fit=crop&auto=format"
              alt="فروشگاه بردبار"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <MapPin size={24} />, title: 'آدرس', lines: ['رشت، گلسار', 'بلوار گیلان', 'رو به روی برج گلسار'] },
            { icon: <Phone size={24} />, title: 'تماس', lines: ['۰۱۳-۳۳۴۵۶۷۸۹', '۰۹۱۱-۲۳۴-۵۶۷۸', '(واتساپ هم پاسخ داده می‌شود)'] },
            { icon: <Clock size={24} />, title: 'ساعت کاری', lines: ['شنبه تا چهارشنبه', '۱۰ صبح - ۹ شب', 'پنجشنبه ۱۰ صبح - ۸ شب'] },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-navy-100/50 text-right">
              <div className="w-12 h-12 rounded-2xl bg-navy-800 flex items-center justify-center text-gold-400 mb-4">
                {card.icon}
              </div>
              <h3 className="font-bold text-navy-900 mb-3">{card.title}</h3>
              {card.lines.map((l, j) => <p key={j} className="text-navy-600 text-sm leading-relaxed">{l}</p>)}
            </div>
          ))}
        </div>

        {/* Map */}
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100/50 overflow-hidden">
          <div className="bg-navy-800 px-6 py-4 flex items-center justify-between flex-wrap gap-2 text-right">
            <a
              href="https://www.google.com/maps/place/Golsar+Tower/@37.3044059,49.5796787,17z/data=!3m1!4b1!4m6!3m5!1s0x401fd8c966151241:0x7a580f8b3205f1aa!8m2!3d37.3044059!4d49.5822536!16s%2Fg%2F11btt7sm7j"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-400 text-sm font-medium hover:text-gold-300 transition-colors"
            >
              باز کردن در Google Maps
            </a>
            <div>
              <h3 className="text-white font-bold">موقعیت فروشگاه</h3>
              <p className="text-navy-300 text-sm">رشت، گلسار، بلوار گیلان، رو به روی برج گلسار</p>
            </div>
          </div>
          <div className="h-80">
            <iframe
              title="موقعیت فروشگاه بردبار روی نقشه"
              src="https://www.google.com/maps?q=37.3044059,49.5822536&z=17&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Social */}
        <div className="mt-10 text-center">
          <h3 className="font-bold text-navy-900 mb-4">ما را در شبکه‌های اجتماعی دنبال کنید</h3>
          <div className="flex gap-4 justify-center">
            {[
              { icon: <InstagramIcon size={20} />, label: 'اینستاگرام', color: 'bg-pink-600' },
              { icon: <TelegramIcon size={20} />, label: 'تلگرام', color: 'bg-blue-500' },
            ].map((s, i) => (
              <button key={i} className={`${s.color} text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-medium hover:opacity-90 transition-opacity`}>
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [compare, setCompare] = useState<number[]>([])
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('bordbar_favorites')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [mobileMenu, setMobileMenu] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [headerSearch, setHeaderSearch] = useState('')
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [showCartPreview, setShowCartPreview] = useState(false)
  const [customerLoggedIn, setCustomerLoggedIn] = useState(false)
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [accountTab, setAccountTab] = useState<AccountTab>('profile')
  const [policyTab, setPolicyTab] = useState<PolicyTab>('privacy')
  const [productsCategory, setProductsCategory] = useState('همه')
  const [productsInitialSearch, setProductsInitialSearch] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    setCustomerLoggedIn(!!getMockPhone())
  }, [])

  useEffect(() => {
    localStorage.setItem('bordbar_favorites', JSON.stringify(favorites))
  }, [favorites])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)

  const toggleCompare = (id: number) => {
    setCompare(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const goToProducts = (category?: string, search?: string) => {
    setProductsCategory(category ?? 'همه')
    setProductsInitialSearch(search)
    setPage('products')
    setMobileMenu(false)
  }

  const openQuickView = (p: Product) => {
    setQuickViewProduct(p)
  }

  const goToPolicy = (tab: PolicyTab) => {
    setPolicyTab(tab)
    setPage('policy')
    setMobileMenu(false)
  }

  const goToAccount = () => {
    if (customerLoggedIn) setAccountTab('profile')
    setPage(customerLoggedIn ? 'account' : 'auth')
    setMobileMenu(false)
  }

  const openAccountSection = (tab: AccountTab) => {
    setAccountTab(tab)
    setPage('account')
    setShowAccountMenu(false)
    setMobileMenu(false)
  }

  const signOutCustomer = () => {
    mockSignOut()
    setCustomerLoggedIn(false)
    setShowAccountMenu(false)
    setMobileMenu(false)
    setPage('home')
  }

  const searchSuggestions = headerSearch.trim()
    ? products.filter(p => p.name.includes(headerSearch.trim())).slice(0, 6)
    : []

  const openProductFromSearch = (p: Product) => {
    setSelectedProduct(p)
    setPage('product')
    setHeaderSearch('')
    setShowSearchSuggestions(false)
  }

  const nav = [
    { label: 'خانه', page: 'home' as Page, icon: <Home size={15} /> },
    { label: 'محصولات', page: 'products' as Page, icon: <ShoppingBag size={15} /> },
    { label: 'علاقه‌مندی‌ها', page: 'favorites' as Page, icon: <Heart size={15} /> },
    { label: 'پیگیری', page: 'tracking' as Page, icon: <Package size={15} /> },
    { label: 'پشتیبانی', page: 'chat' as Page, icon: <MessageCircle size={15} /> },
    { label: 'درباره ما', page: 'about' as Page, icon: <Info size={15} /> },
  ]

  return (
    <div className="font-sans" dir="rtl">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-xl border-b border-navy-700/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => setPage('home')} className="text-right flex-shrink-0">
            <span className="font-logo text-gold-400 text-4xl tracking-tight">بردبار</span>
            <span className="text-white text-xs block -mt-1 tracking-widest opacity-60">BORDBAR</span>
          </button>

          {/* Search (desktop) */}
          <div className="hidden md:block flex-1 max-w-lg">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400" />
              <input
                value={headerSearch}
                onChange={e => { setHeaderSearch(e.target.value); setShowSearchSuggestions(true) }}
                onFocus={() => setShowSearchSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 150)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && headerSearch.trim()) {
                    setShowSearchSuggestions(false)
                    goToProducts(undefined, headerSearch)
                  }
                  if (e.key === 'Escape') setShowSearchSuggestions(false)
                }}
                placeholder="جستجو میان محصولات..."
                className="w-full pr-9 pl-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-white placeholder-navy-400 text-sm focus:outline-none focus:border-gold-400"
              />
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-navy-100 overflow-hidden z-30 text-right">
                  {searchSuggestions.map(p => (
                    <button
                      key={p.id}
                      onClick={() => openProductFromSearch(p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-navy-50 transition-colors border-b border-navy-50 last:border-0"
                    >
                      <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-navy-900 truncate">{p.name}</p>
                        <p className="text-xs text-navy-500">{formatPrice(p.price)}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => { setShowSearchSuggestions(false); goToProducts(undefined, headerSearch) }}
                    className="w-full text-center py-2.5 text-sm text-gold-500 hover:bg-navy-50 transition-colors font-medium"
                  >
                    مشاهده همه نتایج برای «{headerSearch}»
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {compare.length >= 2 && (
              <button
                onClick={() => setPage('compare')}
                className="hidden md:flex items-center gap-1.5 bg-gold-500 text-navy-900 text-xs px-3 py-2 rounded-xl font-bold hover:bg-gold-400 transition-colors"
              >
                <Scale size={14} />
                مقایسه ({compare.length.toLocaleString('fa-IR')})
              </button>
            )}
            <div className="relative hidden sm:block">
              <button
                onClick={() => customerLoggedIn ? setShowAccountMenu(v => !v) : goToAccount()}
                className="flex items-center gap-1.5 bg-gold-500 text-navy-950 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-gold-400 transition-colors"
              >
                <User size={14} />
                {customerLoggedIn ? 'حساب من' : 'ورود / ثبت‌نام'}
              </button>

              {showAccountMenu && customerLoggedIn && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowAccountMenu(false)} />
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-navy-100 overflow-hidden z-30 text-right">
                    <button onClick={() => openAccountSection('profile')} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-navy-700 hover:bg-navy-50 transition-colors border-b border-navy-50">
                      <User size={15} />
                      پروفایل من
                    </button>
                    <button onClick={() => openAccountSection('orders')} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-navy-700 hover:bg-navy-50 transition-colors border-b border-navy-50">
                      <Package size={15} />
                      سفارش‌های من
                    </button>
                    <button onClick={() => openAccountSection('payments')} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-navy-700 hover:bg-navy-50 transition-colors border-b border-navy-50">
                      <CreditCard size={15} />
                      تاریخچه پرداخت
                    </button>
                    <button onClick={() => openAccountSection('edit')} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-navy-700 hover:bg-navy-50 transition-colors border-b border-navy-50">
                      <Pencil size={15} />
                      ویرایش حساب
                    </button>
                    <button onClick={signOutCustomer} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <XCircle size={15} />
                      خروج از حساب
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setPage('favorites')}
              className="hidden md:flex relative w-10 h-10 rounded-xl bg-navy-800 text-white items-center justify-center hover:bg-navy-700 transition-colors"
            >
              <Heart size={18} className={favorites.length > 0 ? 'fill-red-500 text-red-500' : ''} />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gold-500 text-navy-900 text-xs font-bold flex items-center justify-center">
                  {favorites.length.toLocaleString('fa-IR')}
                </span>
              )}
            </button>
            <div
              className="relative hidden md:block"
              onMouseEnter={() => setShowCartPreview(true)}
              onMouseLeave={() => setShowCartPreview(false)}
            >
              <button
                onClick={() => setPage('cart')}
                className="relative w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center hover:bg-navy-700 transition-colors"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gold-500 text-navy-900 text-xs font-bold flex items-center justify-center">
                    {cartCount.toLocaleString('fa-IR')}
                  </span>
                )}
              </button>

              {showCartPreview && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-navy-100 overflow-hidden z-30 text-right">
                  {cart.length === 0 ? (
                    <div className="p-6 text-center text-navy-400">
                      <ShoppingBag size={28} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">سبد خرید شما خالی است</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-72 overflow-y-auto divide-y divide-navy-50">
                        {cart.slice(0, 4).map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3">
                            <img src={item.product.images[0]} alt={item.product.name} className="w-11 h-14 object-cover rounded-lg flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-navy-900 truncate">{item.product.name}</p>
                              <p className="text-xs text-navy-400">سایز {item.size} · {item.qty.toLocaleString('fa-IR')} عدد</p>
                            </div>
                            <p className="text-xs font-bold text-navy-800 flex-shrink-0">{formatPrice(item.product.price * item.qty)}</p>
                          </div>
                        ))}
                      </div>
                      {cart.length > 4 && (
                        <p className="px-3 py-2 text-xs text-navy-400 border-t border-navy-50">
                          و {(cart.length - 4).toLocaleString('fa-IR')} مورد دیگر
                        </p>
                      )}
                      <div className="p-3 border-t border-navy-100">
                        <div className="flex justify-between text-sm font-bold text-navy-900 mb-3">
                          <span>{formatPrice(cartTotal)}</span>
                          <span>جمع کل</span>
                        </div>
                        <button
                          onClick={() => setPage('cart')}
                          className="w-full bg-navy-800 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-navy-600 transition-colors"
                        >
                          مشاهده سبد خرید
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setPage('cart')}
              className="md:hidden relative w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center hover:bg-navy-700 transition-colors"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gold-500 text-navy-900 text-xs font-bold flex items-center justify-center">
                  {cartCount.toLocaleString('fa-IR')}
                </span>
              )}
            </button>
            <button
              className="md:hidden w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center hover:bg-navy-700 transition-colors"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Secondary nav (desktop): home, all products, categories, about */}
        <div className="hidden md:block border-t border-navy-800/60">
          <div className="container mx-auto px-6 flex items-center gap-1 overflow-x-auto">
            {([
              { label: 'خانه', active: page === 'home', action: () => setPage('home') },
              { label: 'همه محصولات', active: page === 'products' && productsCategory === 'همه', action: () => goToProducts() },
              { label: 'مانتو', active: page === 'products' && productsCategory === 'مانتو', action: () => goToProducts('مانتو') },
              { label: 'بلوز', active: page === 'products' && productsCategory === 'بلوز', action: () => goToProducts('بلوز') },
              { label: 'شلوار', active: page === 'products' && productsCategory === 'شلوار', action: () => goToProducts('شلوار') },
              { label: 'ست', active: page === 'products' && productsCategory === 'ست', action: () => goToProducts('ست') },
              { label: 'پیراهن', active: page === 'products' && productsCategory === 'پیراهن', action: () => goToProducts('پیراهن') },
              { label: 'درباره ما', active: page === 'about', action: () => setPage('about') },
            ]).map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${item.active ? 'text-gold-400' : 'text-navy-300 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-navy-900 border-t border-navy-700/50 px-6 py-4 space-y-1">
            {nav.map(n => (
              <button
                key={n.page}
                onClick={() => { setPage(n.page); setMobileMenu(false) }}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-right ${page === n.page ? 'bg-navy-700 text-gold-400' : 'text-navy-300 hover:bg-navy-800 hover:text-white'}`}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
            {customerLoggedIn ? (
              <>
                <button onClick={() => openAccountSection('profile')} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gold-400 hover:bg-navy-800 transition-colors text-right">
                  <User size={15} />
                  پروفایل من
                </button>
                <button onClick={() => openAccountSection('orders')} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors text-right">
                  <Package size={15} />
                  سفارش‌های من
                </button>
                <button onClick={() => openAccountSection('payments')} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors text-right">
                  <CreditCard size={15} />
                  تاریخچه پرداخت
                </button>
                <button onClick={() => openAccountSection('edit')} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-navy-300 hover:bg-navy-800 hover:text-white transition-colors text-right">
                  <Pencil size={15} />
                  ویرایش حساب
                </button>
                <button onClick={signOutCustomer} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-navy-800 transition-colors text-right">
                  <XCircle size={15} />
                  خروج از حساب
                </button>
              </>
            ) : (
              <button onClick={goToAccount} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gold-400 hover:bg-navy-800 transition-colors text-right">
                <User size={15} />
                ورود / ثبت‌نام
              </button>
            )}
            <button
              onClick={() => { setPage('order-cancel'); setMobileMenu(false) }}
              className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-navy-800 transition-colors text-right"
            >
              <XCircle size={15} />
              لغو سفارش
            </button>
            {compare.length >= 2 && (
              <button
                onClick={() => { setPage('compare'); setMobileMenu(false) }}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gold-400 bg-navy-800 transition-colors text-right"
              >
                <Scale size={15} />
                مقایسه ({compare.length.toLocaleString('fa-IR')})
              </button>
            )}
          </div>
        )}
      </header>

      {/* Compare Bar */}
      {compare.length > 0 && page !== 'compare' && (
        <div className="sticky top-[72px] z-40 bg-navy-700 py-2 px-6 flex items-center justify-between text-sm">
          <button
            onClick={() => setPage('compare')}
            className="text-gold-400 font-bold flex items-center gap-2 hover:text-gold-300 transition-colors"
          >
            <BarChart2 size={16} />
            مقایسه {compare.length.toLocaleString('fa-IR')} محصول
          </button>
          <div className="flex items-center gap-3">
            <span className="text-navy-300 text-xs">حداکثر ۳ محصول</span>
            <button onClick={() => setCompare([])} className="text-navy-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Pages */}
      <main>
        {page === 'home' && (
          <>
            <h1 className="sr-only">فروشگاه بردبار — پوشاک زنانه با کیفیت اروپایی در رشت</h1>
            <HeroBanners onSelectCategory={cat => goToProducts(cat)} />
            <CategoryShowcase onSelect={cat => goToProducts(cat)} />
            <NewestProducts
              products={products}
              onViewAll={() => goToProducts()}
              onView={p => { setSelectedProduct(p); setPage('product') }}
              setCart={setCart}
              compare={compare}
              toggleCompare={toggleCompare}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              onQuickView={openQuickView}
            />
            <section className="py-16 bg-cream">
              <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-10">
                  <button onClick={() => setPage('products')} className="text-navy-600 hover:text-navy-900 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    مشاهده همه
                    <ChevronLeft size={16} />
                  </button>
                  <h2 className="text-3xl font-bold text-navy-900">محصولات ویژه</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {products.slice(0, 4).map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onView={() => { setSelectedProduct(p); setPage('product') }}
                      onAddCart={() => setCart(prev => {
                        const ex = prev.find(i => i.product.id === p.id)
                        if (ex) return prev.map(i => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i)
                        return [...prev, { product: p, size: p.sizes[0], color: p.colors[0], qty: 1 }]
                      })}
                      onCompare={() => toggleCompare(p.id)}
                      comparing={compare.includes(p.id)}
                      liked={favorites.includes(p.id)}
                      onToggleLike={() => toggleFavorite(p.id)}
                      onQuickView={() => openQuickView(p)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <StoreInfoSection />

            <FeaturesBar />

            <SiteFooter setPage={setPage} goToProducts={goToProducts} goToPolicy={goToPolicy} />
          </>
        )}

        {page === 'products' && (
          <ProductsPage
            products={products}
            loading={productsLoading}
            cat={productsCategory}
            onCatChange={setProductsCategory}
            initialSearch={productsInitialSearch}
            setCart={setCart}
            onView={p => { setSelectedProduct(p); setPage('product') }}
            compare={compare}
            toggleCompare={toggleCompare}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onQuickView={openQuickView}
          />
        )}

        {page === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            products={products}
            setCart={setCart}
            onBack={() => setPage('products')}
            onView={p => { setSelectedProduct(p); setPage('product') }}
            compare={compare}
            toggleCompare={toggleCompare}
            setPage={setPage}
            goToProducts={goToProducts}
            goToPolicy={goToPolicy}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            onQuickView={openQuickView}
          />
        )}

        {page === 'cart' && (
          <CartPage cart={cart} setCart={setCart} onCheckout={() => setPage('checkout')} />
        )}

        {page === 'checkout' && (
          <CheckoutPage cart={cart} onDone={() => { setCart([]); setPage('home') }} />
        )}

        {page === 'tracking' && <TrackingPage />}

        {page === 'chat' && <ChatPage />}

        {page === 'compare' && <ComparePage products={products} compare={compare} onBack={() => setPage('products')} />}

        {page === 'favorites' && (
          <FavoritesPage
            products={products}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            compare={compare}
            toggleCompare={toggleCompare}
            onView={p => { setSelectedProduct(p); setPage('product') }}
            setCart={setCart}
            onBack={() => setPage('products')}
            onQuickView={openQuickView}
          />
        )}

        {page === 'order-cancel' && <CancelOrderPage />}

        {page === 'about' && <AboutPage />}

        {page === 'policy' && <PolicyPage initialTab={policyTab} />}

        {page === 'auth' && <AuthPage onSuccess={() => { setCustomerLoggedIn(true); setPage('account') }} />}

        {page === 'account' && (
          <AccountPage onSignOut={signOutCustomer} initialTab={accountTab} />
        )}
      </main>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          setCart={setCart}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onViewFull={() => {
            setSelectedProduct(quickViewProduct)
            setPage('product')
            setQuickViewProduct(null)
          }}
        />
      )}
    </div>
  )
}
