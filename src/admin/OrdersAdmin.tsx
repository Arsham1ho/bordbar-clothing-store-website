import { useEffect, useState } from 'react'
import { ChevronDown, MapPin, Phone, XCircle } from 'lucide-react'
import { fetchAllOrders, updateOrderStatus } from '../lib/db'
import { ORDER_STATUS_LABELS, ORDER_STATUS_STEPS } from '../types'
import type { Order, OrderStatus } from '../types'

function formatPrice(p: number) {
  return p.toLocaleString('fa-IR') + ' تومان'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-navy-100 text-navy-700',
  gathering: 'bg-amber-100 text-amber-700',
  packaging: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setLoadError(false)
    fetchAllOrders()
      .then(setOrders)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const setStatus = async (order: Order, status: OrderStatus) => {
    setUpdating(order.id)
    try {
      await updateOrderStatus(order.id, status)
      setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status } : o)))
    } catch {
      window.alert('خطا در به‌روزرسانی وضعیت سفارش. لطفاً دوباره تلاش کنید.')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <p className="text-navy-400 text-center py-16">در حال بارگذاری سفارش‌ها...</p>
  if (loadError) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-3">خطا در بارگذاری سفارش‌ها.</p>
        <button onClick={load} className="text-sm text-navy-600 underline hover:text-navy-900 transition-colors">تلاش دوباره</button>
      </div>
    )
  }
  if (orders.length === 0) return <p className="text-navy-400 text-center py-16">هنوز سفارشی ثبت نشده است</p>

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const isOpen = expanded === order.id
        return (
          <div key={order.id} className="bg-white rounded-2xl border border-navy-100/60 shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full flex items-center justify-between gap-4 p-4 text-right"
            >
              <ChevronDown size={18} className={`text-navy-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <p className="text-navy-400 text-xs">کد سفارش</p>
                  <p className="font-bold text-navy-900" dir="ltr">{order.code}</p>
                </div>
                <div>
                  <p className="text-navy-400 text-xs">مشتری</p>
                  <p className="font-medium text-navy-800">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-navy-400 text-xs">مبلغ</p>
                  <p className="font-medium text-navy-800">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-navy-400 text-xs">تاریخ</p>
                  <p className="font-medium text-navy-800">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[order.status]}`}>
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </button>

            {isOpen && (
              <div className="border-t border-navy-100 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-navy-400 mt-0.5 flex-shrink-0" />
                    <span className="text-navy-700">{order.address} {order.postalCode && `— کد پستی ${order.postalCode}`}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-navy-400 flex-shrink-0" />
                    <span className="text-navy-700" dir="ltr">{order.phone}</span>
                  </div>
                </div>

                <div className="bg-navy-50 rounded-xl p-3 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="font-medium text-navy-800">{formatPrice(item.price * item.qty)}</span>
                      <span className="text-navy-600">
                        {item.productName} — سایز {item.size}، رنگ {item.color} × {item.qty.toLocaleString('fa-IR')}
                      </span>
                    </div>
                  ))}
                </div>

                {order.status === 'cancelled' ? (
                  <p className="text-sm text-red-500 font-medium">این سفارش لغو شده است</p>
                ) : (
                  <div>
                    <p className="text-xs text-navy-400 mb-2">وضعیت سفارش</p>
                    <div className="flex flex-wrap gap-2">
                      {ORDER_STATUS_STEPS.map(step => (
                        <button
                          key={step}
                          onClick={() => setStatus(order, step)}
                          disabled={updating === order.id}
                          className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors disabled:opacity-50 ${
                            order.status === step
                              ? 'bg-navy-800 text-white border-navy-800'
                              : 'border-navy-200 text-navy-700 hover:border-navy-500'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[step]}
                        </button>
                      ))}
                      <button
                        onClick={() => setStatus(order, 'cancelled')}
                        disabled={updating === order.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={13} />
                        لغو سفارش
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
