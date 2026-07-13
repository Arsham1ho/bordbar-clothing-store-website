import { useState } from 'react'
import { ShoppingBag, Package, LogOut, BarChart3 } from 'lucide-react'
import ProductsAdmin from './ProductsAdmin'
import OrdersAdmin from './OrdersAdmin'
import AnalyticsAdmin from './AnalyticsAdmin'

type Tab = 'analytics' | 'products' | 'orders'

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('analytics')

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <header className="bg-navy-900 border-b border-navy-700/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-logo text-gold-400 text-2xl">بردبار</span>
            <span className="text-navy-300 text-sm mr-2">پنل مدیریت</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-navy-300 hover:text-white text-sm transition-colors"
          >
            <LogOut size={15} />
            خروج
          </button>
        </div>
        <div className="container mx-auto px-6 flex gap-1">
          {([
            ['analytics', 'آمار فروش', <BarChart3 size={15} key="i" />],
            ['orders', 'سفارش‌ها', <Package size={15} key="i" />],
            ['products', 'محصولات', <ShoppingBag size={15} key="i" />],
          ] as const).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === key ? 'border-gold-400 text-gold-400' : 'border-transparent text-navy-300 hover:text-white'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {tab === 'analytics' && <AnalyticsAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'products' && <ProductsAdmin />}
      </main>
    </div>
  )
}
