import { useState, useEffect, useRef } from 'react'
import {
  ShoppingBag, Search, Menu, X, Heart, Star, ChevronLeft,
  MapPin, Phone, Clock, MessageCircle, Package, Truck,
  CheckCircle, XCircle, ArrowRight,
  BarChart2, Trash2, Plus, Minus, CreditCard, AlertCircle,
  Home, Info, Send, Lock, Scale
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type Page = 'home' | 'products' | 'product' | 'cart' | 'checkout' | 'tracking' | 'chat' | 'compare' | 'about' | 'order-cancel'

interface Product {
  id: number
  name: string
  nameEn: string
  price: number
  originalPrice?: number
  category: string
  sizes: string[]
  colors: string[]
  images: string[]
  rating: number
  reviews: number
  inStock: boolean
  description: string
  material: string
  care: string
}

interface CartItem {
  product: Product
  size: string
  color: string
  qty: number
}

interface Order {
  id: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  date: string
  items: CartItem[]
  total: number
  address: string
}

interface ChatMessage {
  id: number
  from: 'user' | 'agent'
  text: string
  time: string
}

// ─── Data ───────────────────────────────────────────────────────────────────

const categories = ['همه', 'پیراهن', 'کت و شلوار', 'مانتو', 'بلوز', 'شلوار', 'ست']

const products: Product[] = [
  {
    id: 1,
    name: 'پیراهن ابریشم کلاسیک',
    nameEn: 'Classic Silk Dress',
    price: 2_850_000,
    originalPrice: 3_400_000,
    category: 'پیراهن',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['سرمه‌ای', 'کرم', 'مشکی'],
    images: [
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.8,
    reviews: 124,
    inStock: true,
    description: 'پیراهن ابریشمی زنانه با طراحی کلاسیک و شیک، مناسب برای مجالس رسمی و نیمه‌رسمی. این پیراهن با پارچه ابریشم طبیعی درجه یک دوخته شده و بریدگی‌های ظریف آن به زیبایی اندام می‌افزاید.',
    material: '100% ابریشم طبیعی',
    care: 'خشکشویی توصیه می‌شود. اتو با دمای پایین.',
  },
  {
    id: 2,
    name: 'مانتو کشمیر ممتاز',
    nameEn: 'Premium Cashmere Coat',
    price: 5_200_000,
    category: 'مانتو',
    sizes: ['S', 'M', 'L'],
    colors: ['سرمه‌ای', 'خاکستری'],
    images: [
      'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1548549557-dbe9946621da?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.9,
    reviews: 89,
    inStock: true,
    description: 'مانتو کشمیری زنانه با کیفیت استثنایی، گرم‌کننده و در عین حال ظریف. طراحی مینیمال و خطوط تمیز این مانتو آن را برای استفاده روزانه و رسمی مناسب می‌سازد.',
    material: '90% کشمیر، 10% ابریشم',
    care: 'شستشوی دستی با آب سرد. پهن کردن برای خشک شدن.',
  },
  {
    id: 3,
    name: 'ست کت و شلوار رسمی',
    nameEn: 'Formal Suit Set',
    price: 7_900_000,
    originalPrice: 9_200_000,
    category: 'کت و شلوار',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['سرمه‌ای', 'مشکی', 'زغالی'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.7,
    reviews: 56,
    inStock: true,
    description: 'ست کت و شلوار رسمی زنانه با پارچه ترکیبی پشمی درجه یک. این ست با طراحی ایتالیایی برای مدیران و بانوان حرفه‌ای مناسب است.',
    material: '70% پشم، 30% پلی‌استر',
    care: 'خشکشویی ضروری است.',
  },
  {
    id: 4,
    name: 'بلوز لینن تابستانی',
    nameEn: 'Summer Linen Blouse',
    price: 1_450_000,
    category: 'بلوز',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['سفید', 'آبی روشن', 'بژ'],
    images: [
      'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.5,
    reviews: 203,
    inStock: true,
    description: 'بلوز لینن سبک و تنفس‌پذیر برای فصل گرما. جنس طبیعی لینن باعث می‌شود در هوای گرم احساس راحتی کنید.',
    material: '100% لینن طبیعی',
    care: 'قابل شستشو در ماشین با آب ولرم.',
  },
  {
    id: 5,
    name: 'شلوار پارچه‌ای گشاد',
    nameEn: 'Wide-leg Trousers',
    price: 2_100_000,
    originalPrice: 2_600_000,
    category: 'شلوار',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['مشکی', 'کرم', 'سرمه‌ای'],
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.6,
    reviews: 178,
    inStock: true,
    description: 'شلوار پارچه‌ای گشاد با طراحی مدرن و راحت. این شلوار هم برای محیط اداری و هم برای گردش مناسب است.',
    material: '65% ویسکوز، 35% پلی‌استر',
    care: 'قابل شستشو در ماشین.',
  },
  {
    id: 6,
    name: 'ست دو تکه آستین‌دار',
    nameEn: 'Two-piece Sleeve Set',
    price: 3_600_000,
    category: 'ست',
    sizes: ['S', 'M', 'L'],
    colors: ['سرمه‌ای', 'بورگاندی'],
    images: [
      'https://images.unsplash.com/photo-1551163943-3f7ae3bfcc50?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.8,
    reviews: 67,
    inStock: false,
    description: 'ست دو تکه زنانه شامل تاپ و شلوار با طراحی هماهنگ. مناسب برای اوقات فراغت و گردش.',
    material: '95% کتان، 5% اسپاندکس',
    care: 'شستشو با آب سرد.',
  },
  {
    id: 7,
    name: 'پیراهن مجلسی طلایی',
    nameEn: 'Gold Evening Dress',
    price: 8_500_000,
    originalPrice: 10_000_000,
    category: 'پیراهن',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['طلایی', 'نقره‌ای'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.9,
    reviews: 45,
    inStock: true,
    description: 'پیراهن مجلسی لوکس با پارچه مزون‌دوزی شده و جزئیات دوخت ظریف. مناسب برای مراسم عروسی و مهمانی‌های رسمی.',
    material: 'ساتن + دانتل فرانسوی',
    care: 'خشکشویی تخصصی الزامی.',
  },
  {
    id: 8,
    name: 'مانتو کتان بهاره',
    nameEn: 'Spring Cotton Coat',
    price: 2_950_000,
    category: 'مانتو',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['سفید', 'آبی', 'سبز سیج'],
    images: [
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600&h=750&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=750&fit=crop&auto=format',
    ],
    rating: 4.4,
    reviews: 132,
    inStock: true,
    description: 'مانتو بهاره سبک از جنس کتان درجه یک با کیفیت برتر. طراحی ساده و شیک مناسب استفاده روزانه.',
    material: '100% کتان',
    care: 'شستشو با آب ولرم.',
  },
]

const mockOrder: Order = {
  id: 'BRD-14892',
  status: 'shipped',
  date: '۱۴۰۳/۰۴/۱۵',
  items: [],
  total: 5_200_000,
  address: 'رشت، گلسار، بلوار گیلان',
}

function formatPrice(p: number) {
  return p.toLocaleString('fa-IR') + ' تومان'
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
}: {
  product: Product
  onView: () => void
  onAddCart: () => void
  onCompare: () => void
  comparing: boolean
}) {
  const [liked, setLiked] = useState(false)
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
        {product.originalPrice && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round((1 - product.price / product.originalPrice) * 100)}٪ تخفیف
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-navy-900/60 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-navy-800 px-4 py-2 rounded-full">ناموجود</span>
          </div>
        )}
        <button
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          onClick={e => { e.stopPropagation(); setLiked(!liked) }}
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

function HeroSection({ onShop }: { onShop: () => void }) {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-navy-900">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=900&fit=crop&auto=format"
          alt="مد و استایل"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-navy-900 via-navy-900/80 to-navy-800/40" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="text-right">
          <p className="text-gold-400 text-sm font-medium tracking-widest mb-4 uppercase">Bordbar Collection ۱۴۰۳</p>
          <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            سبک
            <br />
            <span className="text-gold-400">بی‌نظیر</span>
            <br />
            شما
          </h1>
          <p className="text-navy-200 text-lg leading-relaxed mb-10 max-w-md">
            مجموعه‌ای از پوشاک زنانه با کیفیت اروپایی — طراحی منحصربه‌فرد، پارچه‌های ممتاز، و دوخت بی‌نقص.
          </p>
          <div className="flex gap-4 justify-end flex-wrap">
            <button
              onClick={onShop}
              className="bg-gold-500 text-navy-950 font-bold px-8 py-4 rounded-2xl hover:bg-gold-400 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/30"
            >
              مشاهده کالکشن
            </button>
            <button className="border border-white/30 text-white px-8 py-4 rounded-2xl hover:bg-white/10 transition-colors">
              بیشتر بدانید
            </button>
          </div>
        </div>
        <div className="hidden lg:block relative">
          <div className="grid grid-cols-2 gap-4">
            {[
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300&h=380&fit=crop&auto=format',
              'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=380&fit=crop&auto=format',
            ].map((src, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden ${i === 1 ? 'mt-8' : ''}`} style={{ aspectRatio: '3/4' }}>
                <img src={src} alt="محصول" className="w-full h-full object-cover" />
              </div>
            ))}
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
  setCart,
  onView,
  compare,
  toggleCompare,
}: {
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  onView: (p: Product) => void
  compare: number[]
  toggleCompare: (id: number) => void
}) {
  const [cat, setCat] = useState('همه')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('پیش‌فرض')

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === p.id && i.size === p.sizes[0] && i.color === p.colors[0])
      if (ex) return prev.map(i => i.product.id === p.id && i.size === p.sizes[0] ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product: p, size: p.sizes[0], color: p.colors[0], qty: 1 }]
    })
  }

  let filtered = products.filter(p => (cat === 'همه' || p.category === cat) && p.name.includes(search))
  if (sort === 'ارزان‌ترین') filtered = [...filtered].sort((a, b) => a.price - b.price)
  if (sort === 'گران‌ترین') filtered = [...filtered].sort((a, b) => b.price - a.price)
  if (sort === 'محبوب‌ترین') filtered = [...filtered].sort((a, b) => b.rating - a.rating)

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold text-navy-900">تمام محصولات</h2>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="جستجو..."
                className="pr-9 pl-4 py-2 rounded-xl border border-navy-200 text-sm bg-white focus:outline-none focus:border-navy-500 w-48"
              />
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="px-4 py-2 rounded-xl border border-navy-200 text-sm bg-white focus:outline-none focus:border-navy-500"
            >
              {['پیش‌فرض', 'ارزان‌ترین', 'گران‌ترین', 'محبوب‌ترین'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat === c ? 'bg-navy-800 text-white' : 'bg-white text-navy-700 border border-navy-200 hover:border-navy-500'}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onView={() => onView(p)}
              onAddCart={() => addToCart(p)}
              onCompare={() => toggleCompare(p.id)}
              comparing={compare.includes(p.id)}
            />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-navy-400">
            <Search size={40} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg">محصولی یافت نشد</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductDetailPage({
  product,
  setCart,
  onBack,
}: {
  product: Product
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  onBack: () => void
}) {
  const [size, setSize] = useState(product.sizes[0])
  const [color, setColor] = useState(product.colors[0])
  const [img, setImg] = useState(0)
  const [tab, setTab] = useState<'desc' | 'material' | 'care'>('desc')
  const [added, setAdded] = useState(false)

  const addToCart = () => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id && i.size === size && i.color === color)
      if (ex) return prev.map(i => i.product.id === product.id && i.size === size && i.color === color ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, size, color, qty: 1 }]
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto px-6">
        <button onClick={onBack} className="flex items-center gap-2 text-navy-600 hover:text-navy-900 transition-colors mb-8 group">
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          بازگشت به محصولات
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="rounded-3xl overflow-hidden bg-navy-50 mb-4" style={{ aspectRatio: '4/5' }}>
              <img src={product.images[img]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImg(i)}
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
              <p className="font-semibold text-navy-800 mb-3">سایز: <span className="text-navy-500 font-normal">{size}</span></p>
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

            <button
              onClick={addToCart}
              disabled={!product.inStock}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
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
      </div>
    </div>
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
  const total = cart.reduce((s, i) => s + i.product.price * i.qty, 0)

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl max-w-md w-full mx-4">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-3">سفارش ثبت شد!</h2>
          <p className="text-navy-500 mb-2">کد پیگیری سفارش شما:</p>
          <p className="text-3xl font-bold text-navy-800 mb-6">BRD-{Math.floor(10000 + Math.random() * 90000)}</p>
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
              <div className="flex gap-3">
                <button onClick={() => setStep('address')} className="flex-1 border border-navy-200 text-navy-700 py-4 rounded-2xl font-medium hover:border-navy-500 transition-colors">
                  بازگشت
                </button>
                <button onClick={() => setStep('done')} className="flex-2 flex-[2] bg-navy-800 text-white py-4 rounded-2xl font-bold hover:bg-navy-600 transition-colors">
                  تأیید و پرداخت
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

  const statusSteps = ['ثبت سفارش', 'پردازش', 'ارسال', 'تحویل']
  const currentStep = order?.status === 'processing' ? 1 : order?.status === 'shipped' ? 2 : order?.status === 'delivered' ? 3 : 0

  const search = () => {
    if (code === 'BRD-14892' || code === mockOrder.id) {
      setOrder(mockOrder)
      setError(false)
    } else {
      setOrder(null)
      setError(true)
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
              placeholder="مثال: BRD-14892"
              className="flex-1 px-4 py-3 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-right"
              dir="ltr"
            />
            <button onClick={search} className="bg-navy-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-navy-600 transition-colors">
              پیگیری
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
                <p className="font-bold text-navy-800">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-navy-500">کد سفارش</p>
                <p className="font-bold text-navy-800" dir="ltr">{order.id}</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-4 right-4 left-4 h-0.5 bg-navy-100" />
              <div
                className="absolute top-4 right-4 h-0.5 bg-navy-700 transition-all duration-700"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {statusSteps.map((s, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${i <= currentStep ? 'bg-navy-800 text-white' : 'bg-navy-100 text-navy-400'}`}>
                      {i < currentStep ? <CheckCircle size={16} /> : (i + 1).toLocaleString('fa-IR')}
                    </div>
                    <span className={`text-xs font-medium ${i <= currentStep ? 'text-navy-800' : 'text-navy-400'}`}>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 bg-navy-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-navy-600" />
                <div className="text-right">
                  <p className="font-medium text-navy-800">
                    {order.status === 'shipped' ? 'در حال ارسال' : order.status === 'delivered' ? 'تحویل داده شد' : 'در حال پردازش'}
                  </p>
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

function ComparePage({ compare, onBack }: { compare: number[]; onBack: () => void }) {
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
                <div key={label} className="p-4 bg-navy-50 font-medium text-navy-700 text-sm border-t border-navy-100 flex items-center justify-end">{label}</div>
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

function CancelOrderPage() {
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form')
  const [reason, setReason] = useState('')
  const reasons = ['تغییر نظر', 'پیدا کردن محصول بهتر', 'مشکل مالی', 'تأخیر در ارسال', 'سفارش اشتباه', 'سایر']

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl max-w-md w-full mx-4">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-3">سفارش لغو شد</h2>
          <p className="text-navy-500 mb-6">درخواست لغو سفارش شما با موفقیت ثبت شد. مبلغ ظرف ۳-۵ روز کاری به حساب شما بازگشت خواهد یافت.</p>
          <p className="text-sm text-navy-400 bg-navy-50 rounded-xl p-3">شماره پیگیری: CAN-{Math.floor(10000 + Math.random() * 90000)}</p>
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
                <p className="text-sm text-amber-700">سفارش‌هایی که وضعیت "در حال ارسال" دارند قابل لغو نیستند.</p>
              </div>
              <label className="block text-sm font-medium text-navy-700 mb-2">کد سفارش</label>
              <input
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="BRD-XXXXX"
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
              <button
                onClick={() => setStep('confirm')}
                disabled={!code || !reason}
                className="w-full bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ادامه
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
                <button onClick={() => setStep('form')} className="flex-1 border border-navy-200 text-navy-700 py-3 rounded-2xl font-medium hover:border-navy-500 transition-colors">
                  انصراف
                </button>
                <button onClick={() => setStep('done')} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold hover:bg-red-600 transition-colors">
                  لغو سفارش
                </button>
              </div>
            </>
          )}
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
            <h2 className="text-4xl font-bold text-navy-900 mb-6">فروشگاه بردبار</h2>
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

        {/* Map placeholder */}
        <div className="bg-white rounded-3xl shadow-sm border border-navy-100/50 overflow-hidden">
          <div className="bg-navy-800 px-6 py-4 text-right">
            <h3 className="text-white font-bold">موقعیت فروشگاه</h3>
            <p className="text-navy-300 text-sm">رشت، گلسار، بلوار گیلان، رو به روی برج گلسار</p>
          </div>
          <div className="relative bg-navy-50 h-64 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1524813686514-a57563d77965?w=800&h=300&fit=crop&auto=format"
              alt="نقشه"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-xl px-6 py-4 text-center border-2 border-navy-200">
                <MapPin size={24} className="text-navy-800 mx-auto mb-2" />
                <p className="font-bold text-navy-900 text-sm">فروشگاه بردبار</p>
                <p className="text-navy-500 text-xs">گلسار، رشت</p>
              </div>
            </div>
          </div>
        </div>

        {/* Social */}
        <div className="mt-10 text-center">
          <h3 className="font-bold text-navy-900 mb-4">ما را در شبکه‌های اجتماعی دنبال کنید</h3>
          <div className="flex gap-4 justify-center">
            {[
              { icon: <span className="text-lg font-bold">📷</span>, label: 'اینستاگرام', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
              { icon: <MessageCircle size={20} />, label: 'تلگرام', color: 'bg-blue-500' },
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
  const [cart, setCart] = useState<CartItem[]>([])
  const [compare, setCompare] = useState<number[]>([])
  const [mobileMenu, setMobileMenu] = useState(false)

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const toggleCompare = (id: number) => {
    setCompare(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev)
  }

  const nav = [
    { label: 'خانه', page: 'home' as Page, icon: <Home size={15} /> },
    { label: 'محصولات', page: 'products' as Page, icon: <ShoppingBag size={15} /> },
    { label: 'پیگیری', page: 'tracking' as Page, icon: <Package size={15} /> },
    { label: 'پشتیبانی', page: 'chat' as Page, icon: <MessageCircle size={15} /> },
    { label: 'درباره ما', page: 'about' as Page, icon: <Info size={15} /> },
  ]

  return (
    <div className="font-sans" dir="rtl">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-xl border-b border-navy-700/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => setPage('home')} className="text-right">
            <span className="text-gold-400 text-2xl font-bold tracking-tight">بردبار</span>
            <span className="text-white text-xs block -mt-1 tracking-widest opacity-60">BORDBAR</span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <button
                key={n.page}
                onClick={() => { setPage(n.page); setMobileMenu(false) }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${page === n.page ? 'bg-navy-700 text-gold-400' : 'text-navy-300 hover:text-white hover:bg-navy-800'}`}
              >
                {n.label}
              </button>
            ))}
          </nav>

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
            <button
              className="md:hidden w-10 h-10 rounded-xl bg-navy-800 text-white flex items-center justify-center hover:bg-navy-700 transition-colors"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              {mobileMenu ? <X size={18} /> : <Menu size={18} />}
            </button>
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
            <HeroSection onShop={() => setPage('products')} />
            <FeaturesBar />
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
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Banner */}
            <section className="bg-navy-800 py-16">
              <div className="container mx-auto px-6 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">با خبر باشید</h2>
                <p className="text-navy-300 mb-8">برای دریافت اطلاعیه کالکشن‌های جدید و پیشنهادات ویژه عضو شوید</p>
                <div className="flex gap-3 max-w-md mx-auto">
                  <button className="bg-gold-500 text-navy-900 font-bold px-6 py-3 rounded-2xl hover:bg-gold-400 transition-colors flex-shrink-0">
                    عضویت
                  </button>
                  <input placeholder="آدرس ایمیل یا شماره تلفن" className="flex-1 px-4 py-3 rounded-2xl bg-navy-700 text-white placeholder-navy-400 focus:outline-none focus:bg-navy-600 text-right border border-navy-600" dir="rtl" />
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-navy-950 py-10">
              <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div className="text-right">
                  <p className="text-gold-400 font-bold text-lg mb-3">بردبار</p>
                  <p className="text-navy-400 text-sm leading-relaxed">پوشاک زنانه با کیفیت اروپایی در رشت</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold mb-3 text-sm">دسترسی سریع</p>
                  {[['خانه', 'home'], ['محصولات', 'products'], ['درباره ما', 'about']].map(([l, p]) => (
                    <button key={p} onClick={() => setPage(p as Page)} className="block text-navy-400 text-sm hover:text-gold-400 transition-colors mb-2">{l}</button>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-white font-bold mb-3 text-sm">خدمات</p>
                  {[['پیگیری سفارش', 'tracking'], ['پشتیبانی', 'chat'], ['لغو سفارش', 'order-cancel']].map(([l, p]) => (
                    <button key={p} onClick={() => setPage(p as Page)} className="block text-navy-400 text-sm hover:text-gold-400 transition-colors mb-2">{l}</button>
                  ))}
                </div>
                <div className="text-right">
                  <p className="text-white font-bold mb-3 text-sm">تماس</p>
                  <p className="text-navy-400 text-sm mb-1">رشت، گلسار، بلوار گیلان</p>
                  <p className="text-navy-400 text-sm mb-1">رو به روی برج گلسار</p>
                  <p className="text-navy-400 text-sm" dir="ltr">013-33456789</p>
                </div>
              </div>
              <div className="border-t border-navy-800 pt-6 text-center text-navy-600 text-sm">
                © ۱۴۰۳ فروشگاه بردبار — تمام حقوق محفوظ است
              </div>
            </footer>
          </>
        )}

        {page === 'products' && (
          <ProductsPage
            setCart={setCart}
            onView={p => { setSelectedProduct(p); setPage('product') }}
            compare={compare}
            toggleCompare={toggleCompare}
          />
        )}

        {page === 'product' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            setCart={setCart}
            onBack={() => setPage('products')}
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

        {page === 'compare' && <ComparePage compare={compare} onBack={() => setPage('products')} />}

        {page === 'order-cancel' && <CancelOrderPage />}

        {page === 'about' && <AboutPage />}
      </main>
    </div>
  )
}
