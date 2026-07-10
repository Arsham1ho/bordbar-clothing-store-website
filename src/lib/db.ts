import { supabase } from './supabase'
import type { CartItem, Order, OrderStatus, Product } from '../types'

// ─── Products ───────────────────────────────────────────────────────────────

interface ProductRow {
  id: number
  name: string
  name_en: string
  price: number
  original_price: number | null
  category: string
  sizes: string[]
  colors: string[]
  images: string[]
  rating: number
  reviews: number
  in_stock: boolean
  is_new: boolean
  description: string
  material: string
  care: string
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    category: row.category,
    sizes: row.sizes,
    colors: row.colors,
    images: row.images,
    rating: row.rating,
    reviews: row.reviews,
    inStock: row.in_stock,
    isNew: row.is_new,
    description: row.description,
    material: row.material,
    care: row.care,
  }
}

function toProductRow(input: Omit<Product, 'id'>) {
  return {
    name: input.name,
    name_en: input.nameEn,
    price: input.price,
    original_price: input.originalPrice ?? null,
    category: input.category,
    sizes: input.sizes,
    colors: input.colors,
    images: input.images,
    rating: input.rating,
    reviews: input.reviews,
    in_stock: input.inStock,
    is_new: input.isNew,
    description: input.description,
    material: input.material,
    care: input.care,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('id')
  if (error) throw error
  return (data as ProductRow[]).map(mapProduct)
}

export async function createProduct(input: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(toProductRow(input)).select().single()
  if (error) throw error
  return mapProduct(data as ProductRow)
}

export async function updateProduct(id: number, input: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase.from('products').update(toProductRow(input)).eq('id', id).select().single()
  if (error) throw error
  return mapProduct(data as ProductRow)
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

// ─── Orders ─────────────────────────────────────────────────────────────────

interface OrderItemRow {
  product_id: number | null
  product_name: string
  size: string
  color: string
  qty: number
  price: number
}

interface OrderRow {
  id: string
  code: string
  customer_name: string
  phone: string
  address: string
  postal_code: string
  payment_method: 'online' | 'cod'
  status: OrderStatus
  total: number
  created_at: string
  order_items: OrderItemRow[]
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    createdAt: row.created_at,
    total: row.total,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    postalCode: row.postal_code,
    paymentMethod: row.payment_method,
    items: (row.order_items ?? []).map(i => ({
      productId: i.product_id ?? 0,
      productName: i.product_name,
      size: i.size,
      color: i.color,
      qty: i.qty,
      price: i.price,
    })),
  }
}

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous 0/O/1/I

function generateOrderCode(): string {
  let code = 'BRD-'
  for (let i = 0; i < 8; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  return code
}

export async function createOrder(params: {
  cart: CartItem[]
  customerName: string
  phone: string
  address: string
  postalCode: string
  paymentMethod: 'online' | 'cod'
}): Promise<Order> {
  const total = params.cart.reduce((s, i) => s + i.product.price * i.qty, 0)

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateOrderCode()
    const { data: orderRow, error } = await supabase
      .from('orders')
      .insert({
        code,
        customer_name: params.customerName,
        phone: params.phone,
        address: params.address,
        postal_code: params.postalCode,
        payment_method: params.paymentMethod,
        status: 'pending',
        total,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') continue // unique_violation on code, try another
      throw error
    }

    const itemRows: OrderItemRow[] = params.cart.map(i => ({
      product_id: i.product.id,
      product_name: i.product.name,
      size: i.size,
      color: i.color,
      qty: i.qty,
      price: i.product.price,
    }))
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemRows.map(i => ({ ...i, order_id: orderRow.id })))
    if (itemsError) throw itemsError

    return mapOrder({ ...(orderRow as OrderRow), order_items: itemRows })
  }

  throw new Error('Could not generate a unique order code, please try again')
}

export async function fetchOrderByCode(code: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('code', code.trim())
    .maybeSingle()
  if (error) throw error
  return data ? mapOrder(data as OrderRow) : null
}

export async function fetchAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as OrderRow[]).map(mapOrder)
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}
