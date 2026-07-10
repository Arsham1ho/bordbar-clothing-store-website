import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { createProduct, deleteProduct, fetchProducts, updateProduct } from '../lib/db'
import type { Product } from '../types'

function formatPrice(p: number) {
  return p.toLocaleString('fa-IR') + ' تومان'
}

interface Draft {
  name: string
  nameEn: string
  price: string
  originalPrice: string
  category: string
  sizes: string
  colors: string
  images: string
  rating: string
  reviews: string
  inStock: boolean
  isNew: boolean
  description: string
  material: string
  care: string
}

const emptyDraft: Draft = {
  name: '', nameEn: '', price: '', originalPrice: '', category: '',
  sizes: '', colors: '', images: '', rating: '0', reviews: '0',
  inStock: true, isNew: false, description: '', material: '', care: '',
}

function draftFromProduct(p: Product): Draft {
  return {
    name: p.name,
    nameEn: p.nameEn,
    price: String(p.price),
    originalPrice: p.originalPrice ? String(p.originalPrice) : '',
    category: p.category,
    sizes: p.sizes.join('، '),
    colors: p.colors.join('، '),
    images: p.images.join('، '),
    rating: String(p.rating),
    reviews: String(p.reviews),
    inStock: p.inStock,
    isNew: p.isNew,
    description: p.description,
    material: p.material,
    care: p.care,
  }
}

function splitList(v: string) {
  return v.split(/[,،]/).map(s => s.trim()).filter(Boolean)
}

function draftToInput(d: Draft): Omit<Product, 'id'> {
  return {
    name: d.name.trim(),
    nameEn: d.nameEn.trim(),
    price: Number(d.price) || 0,
    originalPrice: d.originalPrice ? Number(d.originalPrice) : undefined,
    category: d.category.trim(),
    sizes: splitList(d.sizes),
    colors: splitList(d.colors),
    images: splitList(d.images),
    rating: Number(d.rating) || 0,
    reviews: Number(d.reviews) || 0,
    inStock: d.inStock,
    isNew: d.isNew,
    description: d.description.trim(),
    material: d.material.trim(),
    care: d.care.trim(),
  }
}

function ProductForm({
  draft,
  onChange,
  onCancel,
  onSubmit,
  saving,
  title,
}: {
  draft: Draft
  onChange: (d: Draft) => void
  onCancel: () => void
  onSubmit: () => void
  saving: boolean
  title: string
}) {
  const field = (key: keyof Draft, label: string, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={draft[key] as string}
        onChange={e => onChange({ ...draft, [key]: e.target.value })}
        className="w-full px-3 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-sm text-right"
      />
    </div>
  )

  return (
    <div className="fixed inset-0 bg-navy-950/50 flex items-center justify-center p-4 z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <button onClick={onCancel} className="text-navy-400 hover:text-navy-700"><X size={20} /></button>
          <h3 className="text-lg font-bold text-navy-900">{title}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {field('name', 'نام محصول (فارسی)')}
          {field('nameEn', 'نام محصول (انگلیسی)')}
          {field('price', 'قیمت (تومان)', 'number')}
          {field('originalPrice', 'قیمت قبل از تخفیف (اختیاری)', 'number')}
          {field('category', 'دسته‌بندی')}
          {field('rating', 'امتیاز (۰ تا ۵)', 'number')}
          {field('reviews', 'تعداد نظرات', 'number')}
        </div>

        {field('sizes', 'سایزها (با ، از هم جدا کنید — مثال: S، M، L)')}
        <div className="h-4" />
        {field('colors', 'رنگ‌ها (با ، از هم جدا کنید)')}
        <div className="h-4" />
        {field('images', 'آدرس تصاویر (با ، از هم جدا کنید)')}
        <div className="h-4" />

        <label className="block text-sm font-medium text-navy-700 mb-1.5">توضیحات</label>
        <textarea
          value={draft.description}
          onChange={e => onChange({ ...draft, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-sm text-right mb-4"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {field('material', 'جنس')}
          {field('care', 'راهنمای مراقبت')}
        </div>

        <div className="flex gap-6 mb-6">
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" checked={draft.inStock} onChange={e => onChange({ ...draft, inStock: e.target.checked })} />
            موجود است
          </label>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" checked={draft.isNew} onChange={e => onChange({ ...draft, isNew: e.target.checked })} />
            نشان "جدید"
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-navy-200 text-navy-700 py-3 rounded-2xl font-medium hover:border-navy-500 transition-colors">
            انصراف
          </button>
          <button
            onClick={onSubmit}
            disabled={saving || !draft.name || !draft.price || !draft.category}
            className="flex-1 bg-navy-800 text-white py-3 rounded-2xl font-bold hover:bg-navy-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetchProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openNew = () => {
    setDraft(emptyDraft)
    setEditing('new')
  }

  const openEdit = (p: Product) => {
    setDraft(draftFromProduct(p))
    setEditing(p)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const input = draftToInput(draft)
      if (editing === 'new') {
        const created = await createProduct(input)
        setProducts(prev => [...prev, created])
      } else if (editing) {
        const updated = await updateProduct(editing.id, input)
        setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      }
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p: Product) => {
    if (!window.confirm(`محصول «${p.name}» حذف شود؟`)) return
    await deleteProduct(p.id)
    setProducts(prev => prev.filter(x => x.id !== p.id))
  }

  const toggle = async (p: Product, key: 'inStock' | 'isNew') => {
    const updated = await updateProduct(p.id, { ...p, [key]: !p[key] })
    setProducts(prev => prev.map(x => (x.id === updated.id ? updated : x)))
  }

  if (loading) return <p className="text-navy-400 text-center py-16">در حال بارگذاری محصولات...</p>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-navy-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-navy-600 transition-colors"
        >
          <Plus size={16} />
          افزودن محصول
        </button>
        <h2 className="text-xl font-bold text-navy-900">محصولات ({products.length.toLocaleString('fa-IR')})</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-navy-100/60 shadow-sm overflow-hidden">
            <div className="flex gap-3 p-4">
              <img src={p.images[0]} alt={p.name} className="w-16 h-20 object-cover rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-navy-900 text-sm truncate">{p.name}</p>
                <p className="text-xs text-navy-400 mb-1">{p.category}</p>
                <p className="font-medium text-navy-800 text-sm">{formatPrice(p.price)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
              <button
                onClick={() => toggle(p, 'inStock')}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
              >
                {p.inStock ? 'موجود' : 'ناموجود'}
              </button>
              <button
                onClick={() => toggle(p, 'isNew')}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.isNew ? 'bg-emerald-100 text-emerald-700' : 'bg-navy-50 text-navy-400'}`}
              >
                جدید
              </button>
              <div className="mr-auto flex gap-1">
                <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-navy-50 text-navy-600 flex items-center justify-center hover:bg-navy-100 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => remove(p)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <ProductForm
          draft={draft}
          onChange={setDraft}
          onCancel={() => setEditing(null)}
          onSubmit={submit}
          saving={saving}
          title={editing === 'new' ? 'افزودن محصول جدید' : 'ویرایش محصول'}
        />
      )}
    </div>
  )
}
