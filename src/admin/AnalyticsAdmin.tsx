import { useEffect, useState } from 'react'
import { TrendingUp, ShoppingBag, Package, CircleDollarSign, BarChart3 } from 'lucide-react'
import { fetchAllOrders } from '../lib/db'
import { ORDER_STATUS_LABELS } from '../types'
import type { Order, OrderStatus } from '../types'

function formatPrice(p: number) {
  return p.toLocaleString('fa-IR') + ' تومان'
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-navy-400',
  gathering: 'bg-amber-400',
  packaging: 'bg-blue-400',
  shipped: 'bg-purple-400',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-400',
}

export default function AnalyticsAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllOrders()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-navy-400 text-center py-16">در حال بارگذاری آمار...</p>
  if (orders.length === 0) return <p className="text-navy-400 text-center py-16">هنوز سفارشی ثبت نشده است</p>

  const validOrders = orders.filter(o => o.status !== 'cancelled')
  const revenue = validOrders.reduce((s, o) => s + o.total, 0)
  const avgOrder = validOrders.length > 0 ? Math.round(revenue / validOrders.length) : 0

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {} as Record<OrderStatus, number>)

  const productStats = new Map<string, { qty: number; revenue: number }>()
  for (const order of validOrders) {
    for (const item of order.items) {
      const cur = productStats.get(item.productName) ?? { qty: 0, revenue: 0 }
      cur.qty += item.qty
      cur.revenue += item.price * item.qty
      productStats.set(item.productName, cur)
    }
  }
  const topProducts = [...productStats.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
  const maxTopRevenue = topProducts[0]?.[1].revenue ?? 1

  const dailyRevenue = new Map<string, number>()
  for (const order of validOrders) {
    const day = order.createdAt.slice(0, 10)
    dailyRevenue.set(day, (dailyRevenue.get(day) ?? 0) + order.total)
  }
  const chartDays = [...dailyRevenue.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-14)
  const maxDayRevenue = Math.max(...chartDays.map(([, v]) => v), 1)

  const statusOrder: OrderStatus[] = ['pending', 'gathering', 'packaging', 'shipped', 'delivered', 'cancelled']

  const cards = [
    { icon: <CircleDollarSign size={20} />, label: 'درآمد کل', value: formatPrice(revenue) },
    { icon: <ShoppingBag size={20} />, label: 'تعداد سفارش', value: orders.length.toLocaleString('fa-IR') },
    { icon: <TrendingUp size={20} />, label: 'میانگین سفارش', value: formatPrice(avgOrder) },
    { icon: <Package size={20} />, label: 'در حال پردازش', value: ((statusCounts.pending ?? 0) + (statusCounts.gathering ?? 0) + (statusCounts.packaging ?? 0)).toLocaleString('fa-IR') },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-navy-100/60 shadow-sm p-5">
            <div className="w-10 h-10 rounded-xl bg-navy-800 text-gold-400 flex items-center justify-center mb-3">
              {c.icon}
            </div>
            <p className="text-xl font-bold text-navy-900">{c.value}</p>
            <p className="text-xs text-navy-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-navy-100/60 shadow-sm p-6">
        <h3 className="flex items-center gap-2 font-bold text-navy-900 mb-6">
          <BarChart3 size={17} className="text-gold-500" />
          روند فروش ({chartDays.length.toLocaleString('fa-IR')} روز اخیر)
        </h3>
        {chartDays.length === 0 ? (
          <p className="text-navy-400 text-sm text-center py-8">داده‌ای برای نمایش نمودار وجود ندارد</p>
        ) : (
          <div className="flex items-end gap-5 h-48 border-b border-navy-100 overflow-x-auto">
            {chartDays.map(([day, rev]) => (
              <div key={day} className="flex flex-col items-center justify-end h-full flex-shrink-0 w-14">
                <span className="text-[11px] font-bold text-navy-700 mb-2 whitespace-nowrap">
                  {rev.toLocaleString('fa-IR')}
                </span>
                <div
                  className="w-8 rounded-t-md bg-gold-500 hover:bg-gold-400 transition-colors"
                  style={{ height: `${Math.max(Math.round((rev / maxDayRevenue) * 80), 6)}%` }}
                  title={formatPrice(rev)}
                />
                <span className="text-[10px] text-navy-400 mt-2 whitespace-nowrap">
                  {new Date(day).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-navy-100/60 shadow-sm p-6">
          <h3 className="font-bold text-navy-900 mb-5">وضعیت سفارش‌ها</h3>
          <div className="space-y-3">
            {statusOrder.filter(s => statusCounts[s]).map(status => {
              const count = statusCounts[status] ?? 0
              const pct = Math.round((count / orders.length) * 100)
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-navy-500">{count.toLocaleString('fa-IR')} سفارش</span>
                    <span className="font-medium text-navy-800">{ORDER_STATUS_LABELS[status]}</span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-50 overflow-hidden">
                    <div className={`h-full rounded-full ${STATUS_COLORS[status]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-navy-100/60 shadow-sm p-6">
          <h3 className="font-bold text-navy-900 mb-5">پرفروش‌ترین محصولات</h3>
          {topProducts.length === 0 ? (
            <p className="text-navy-400 text-sm text-center py-8">هنوز فروشی ثبت نشده است</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map(([name, stat], i) => (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-bold text-navy-900">{formatPrice(stat.revenue)}</span>
                    <span className="flex items-center gap-2 text-navy-700">
                      <span className="w-5 h-5 rounded-full bg-navy-100 text-navy-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {(i + 1).toLocaleString('fa-IR')}
                      </span>
                      {name}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-50 overflow-hidden">
                    <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.round((stat.revenue / maxTopRevenue) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
