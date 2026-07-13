import { supabase } from './supabase'
import type { CartItem, Order, OrderStatus, Product, Profile, Review } from '../types'

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
  const { data: { user } } = await supabase.auth.getUser()

  for (let attempt = 0; attempt < 5; attempt++) {
    const id = crypto.randomUUID()
    const code = generateOrderCode()
    const createdAt = new Date().toISOString()

    // Insert without reading back: order rows are only selectable by their
    // owner or an admin now, so an anon insert().select() would fail RLS
    // for guest checkouts. We already know everything about the row we
    // just wrote, so there's no need to read it back at all.
    const { error } = await supabase.from('orders').insert({
      id,
      code,
      customer_name: params.customerName,
      phone: params.phone,
      address: params.address,
      postal_code: params.postalCode,
      payment_method: params.paymentMethod,
      status: 'pending',
      total,
      user_id: user?.id ?? null,
      created_at: createdAt,
    })

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
      .insert(itemRows.map(i => ({ ...i, order_id: id })))
    if (itemsError) throw itemsError

    return mapOrder({
      id,
      code,
      customer_name: params.customerName,
      phone: params.phone,
      address: params.address,
      postal_code: params.postalCode,
      payment_method: params.paymentMethod,
      status: 'pending',
      total,
      created_at: createdAt,
      order_items: itemRows,
    })
  }

  throw new Error('Could not generate a unique order code, please try again')
}

export async function fetchOrderByCode(code: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc('get_order_by_code', { p_code: code.trim() })
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

export async function fetchMyOrders(): Promise<Order[]> {
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

// ─── Reviews ────────────────────────────────────────────────────────────────

interface ReviewRow {
  id: string
  product_id: number
  author_name: string
  rating: number
  quality_rating: number
  price_rating: number
  delivery_rating: number
  comment: string
  image_url: string | null
  created_at: string
}

function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    productId: row.product_id,
    authorName: row.author_name,
    rating: row.rating,
    qualityRating: row.quality_rating,
    priceRating: row.price_rating,
    deliveryRating: row.delivery_rating,
    comment: row.comment,
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
  }
}

export async function fetchReviews(productId: number): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as ReviewRow[]).map(mapReview)
}

export async function createReview(input: {
  productId: number
  authorName: string
  rating: number
  qualityRating: number
  priceRating: number
  deliveryRating: number
  comment: string
  imageFile?: File
}): Promise<Review> {
  let imageUrl: string | null = null
  if (input.imageFile) {
    const path = `${input.productId}/${crypto.randomUUID()}-${input.imageFile.name}`
    const { error: uploadError } = await supabase.storage.from('review-photos').upload(path, input.imageFile)
    if (uploadError) throw uploadError
    imageUrl = supabase.storage.from('review-photos').getPublicUrl(path).data.publicUrl
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: input.productId,
      author_name: input.authorName,
      rating: input.rating,
      quality_rating: input.qualityRating,
      price_rating: input.priceRating,
      delivery_rating: input.deliveryRating,
      comment: input.comment,
      image_url: imageUrl,
    })
    .select()
    .single()
  if (error) throw error
  return mapReview(data as ReviewRow)
}

// ─── Auth / profile ─────────────────────────────────────────────────────────

interface ProfileRow {
  id: string
  phone: string | null
  full_name: string | null
  address: string | null
  postal_code: string | null
  role: 'customer' | 'admin'
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    phone: row.phone ?? '',
    fullName: row.full_name ?? '',
    address: row.address ?? '',
    postalCode: row.postal_code ?? '',
    role: row.role,
  }
}

// Normalizes a local Iranian mobile number (e.g. "0912 345 6789") to E.164
// ("+989123456789") for Supabase phone auth.
export function normalizeIranPhone(input: string): string {
  const digits = input.replace(/\D/g, '')
  const local = digits.startsWith('98') ? digits.slice(2) : digits.replace(/^0/, '')
  return `+98${local}`
}

export async function sendPhoneOtp(phone: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ phone: normalizeIranPhone(phone) })
  if (error) throw error
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ phone: normalizeIranPhone(phone), token, type: 'sms' })
  if (error) throw error
}

// TEMPORARY: signs in with just a phone number, no SMS verification -- SMS
// sending isn't configured yet, and email-based signup kept hitting
// Supabase's built-in email rate limit even with confirmation disabled. This
// uses anonymous auth instead (no email/SMS involved at all, so no rate
// limit), and just records the phone number on the profile.
//
// There is no proof of phone ownership with this path, so anyone who types
// a phone number can label their (own, anonymous) session with it -- it
// does NOT let one person access another's account, since anonymous
// sessions aren't looked up by phone. The real tradeoff: the same person on
// a different browser/device gets a separate anonymous session and won't
// see their previous order history there. Swap back to
// sendPhoneOtp/verifyPhoneOtp above once the SMS provider is fixed.
export async function signInWithPhoneOnly(phone: string): Promise<void> {
  const normalized = normalizeIranPhone(phone)

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw error
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('AUTH_FAILED')
  const { error } = await supabase.from('profiles').update({ phone: normalized }).eq('id', user.id)
  if (error) throw error
}

export async function fetchProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  return data ? mapProfile(data as ProfileRow) : null
}

export async function updateProfile(input: { fullName: string; address: string; postalCode: string }): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: input.fullName, address: input.address, postal_code: input.postalCode })
    .eq('id', user.id)
    .select()
    .single()
  if (error) throw error
  return mapProfile(data as ProfileRow)
}
