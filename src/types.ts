export interface Product {
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
  isNew: boolean
  description: string
  material: string
  care: string
}

export interface CartItem {
  product: Product
  size: string
  color: string
  qty: number
}

export type OrderStatus = 'pending' | 'gathering' | 'packaging' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: number
  productName: string
  size: string
  color: string
  qty: number
  price: number
}

export interface Order {
  id: string
  code: string
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
  total: number
  customerName: string
  phone: string
  address: string
  postalCode: string
  paymentMethod: 'online' | 'cod'
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'ثبت سفارش',
  gathering: 'جمع‌آوری کالا',
  packaging: 'بسته‌بندی',
  shipped: 'تحویل به پیک/پست',
  delivered: 'تحویل داده شد',
  cancelled: 'لغو شده',
}

export const ORDER_STATUS_STEPS: OrderStatus[] = ['pending', 'gathering', 'packaging', 'shipped', 'delivered']

export interface Review {
  id: string
  productId: number
  authorName: string
  rating: number
  qualityRating: number
  priceRating: number
  deliveryRating: number
  comment: string
  imageUrl?: string
  createdAt: string
}

export interface Profile {
  id: string
  phone: string
  fullName: string
  address: string
  postalCode: string
  role: 'customer' | 'admin'
}
