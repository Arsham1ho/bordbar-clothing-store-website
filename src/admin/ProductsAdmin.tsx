import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Tag, CreditCard, Ruler, Image as ImageIcon, FileText, CheckCircle, Sparkles } from 'lucide-react'
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

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-bold text-navy-800 mb-3 pb-2 border-b border-navy-100">
      {icon}
      {title}
    </h4>
  )
}

function TagInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const items = splitList(value)
  const [input, setInput] = useState('')

  const addItem = () => {
    const v = input.trim()
    if (!v || items.includes(v)) { setInput(''); return }
    onChange([...items, v].join('، '))
    setInput('')
  }

  const removeItem = (item: string) => {
    onChange(items.filter(i => i !== item).join('، '))
  }

  return (
    <div>
      <label className="block text-xs font-medium text-navy-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[1.75rem]">
        {items.length === 0 && <span className="text-xs text-navy-300">هنوز موردی اضافه نشده</span>}
        {items.map(item => (
          <span key={item} className="flex items-center gap-1.5 bg-navy-50 text-navy-700 text-sm px-3 py-1.5 rounded-full">
            {item}
            <button type="button" onClick={() => removeItem(item)} className="text-navy-400 hover:text-red-500 transition-colors">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-sm text-right"
        />
        <button type="button" onClick={addItem} className="w-9 h-9 flex-shrink-0 rounded-xl bg-navy-800 text-white flex items-center justify-center hover:bg-navy-600 transition-colors">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

function ImageListInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = splitList(value)
  const [input, setInput] = useState('')

  const addItem = () => {
    const v = input.trim()
    if (!v) return
    onChange([...items, v].join('، '))
    setInput('')
  }

  const removeItem = (url: string) => {
    onChange(items.filter(u => u !== url).join('، '))
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="text-xs text-navy-300 py-2 mb-2">هنوز تصویری اضافه نشده</p>
      ) : (
        <div className="space-y-2 mb-3">
          {items.map(url => (
            <div key={url} className="flex items-center gap-2 bg-navy-50/60 rounded-xl p-2">
              <img
                src={url}
                alt=""
                className="w-10 h-12 object-cover rounded-lg flex-shrink-0 bg-navy-100"
                onError={e => { e.currentTarget.style.opacity = '0.15' }}
              />
              <span className="flex-1 min-w-0 text-xs text-navy-500 truncate" dir="ltr">{url}</span>
              <button
                type="button"
                onClick={() => removeItem(url)}
                className="w-7 h-7 rounded-lg bg-white text-navy-400 hover:text-red-500 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
          placeholder="آدرس تصویر را وارد کنید..."
          dir="ltr"
          className="flex-1 px-3 py-2 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-sm text-left"
        />
        <button type="button" onClick={addItem} className="w-9 h-9 flex-shrink-0 rounded-xl bg-navy-800 text-white flex items-center justify-center hover:bg-navy-600 transition-colors">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
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
      <label className="block text-xs font-medium text-navy-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={draft[key] as string}
        onChange={e => onChange({ ...draft, [key]: e.target.value })}
        className="w-full px-3 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-sm text-right"
      />
    </div>
  )

  const previewImage = splitList(draft.images)[0]

  return (
    <div className="fixed inset-0 bg-navy-950/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50" onClick={onCancel}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 p-6 pb-5 border-b border-navy-100 sticky top-0 bg-white rounded-t-3xl z-10">
          <button onClick={onCancel} className="w-9 h-9 rounded-full bg-navy-50 text-navy-500 hover:bg-navy-100 hover:text-navy-800 flex items-center justify-center transition-colors">
            <X size={17} />
          </button>
          <div className="flex items-center gap-3 text-right">
            <div>
              <h3 className="text-lg font-bold text-navy-900">{title}</h3>
              {draft.name && <p className="text-xs text-navy-400">{draft.name}</p>}
            </div>
            <div className="w-12 h-14 rounded-xl bg-navy-50 overflow-hidden flex-shrink-0">
              {previewImage && (
                <img src={previewImage} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
              )}
            </div>
          </div>
        </div>

        <div className="p-6 pt-5">
          <div className="mb-6">
            <SectionHeader icon={<Tag size={15} className="text-gold-500" />} title="اطلاعات پایه" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('name', 'نام محصول (فارسی)')}
              {field('nameEn', 'نام محصول (انگلیسی)')}
              {field('category', 'دسته‌بندی')}
            </div>
          </div>

          <div className="mb-6">
            <SectionHeader icon={<CreditCard size={15} className="text-gold-500" />} title="قیمت و امتیاز" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {field('price', 'قیمت (تومان)', 'number')}
              {field('originalPrice', 'قیمت قبل از تخفیف', 'number')}
              {field('rating', 'امتیاز (۰ تا ۵)', 'number')}
              {field('reviews', 'تعداد نظرات', 'number')}
            </div>
          </div>

          <div className="mb-6">
            <SectionHeader icon={<Ruler size={15} className="text-gold-500" />} title="سایز و رنگ" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TagInput label="سایزها" value={draft.sizes} onChange={v => onChange({ ...draft, sizes: v })} placeholder="مثال: M — اینتر بزنید" />
              <TagInput label="رنگ‌ها" value={draft.colors} onChange={v => onChange({ ...draft, colors: v })} placeholder="مثال: سرمه‌ای — اینتر بزنید" />
            </div>
          </div>

          <div className="mb-6">
            <SectionHeader icon={<ImageIcon size={15} className="text-gold-500" />} title="تصاویر محصول" />
            <ImageListInput value={draft.images} onChange={v => onChange({ ...draft, images: v })} />
          </div>

          <div className="mb-6">
            <SectionHeader icon={<FileText size={15} className="text-gold-500" />} title="توضیحات و مشخصات" />
            <label className="block text-xs font-medium text-navy-500 mb-1.5">توضیحات</label>
            <textarea
              value={draft.description}
              onChange={e => onChange({ ...draft, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-navy-200 focus:outline-none focus:border-navy-500 text-sm text-right mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('material', 'جنس')}
              {field('care', 'راهنمای مراقبت')}
            </div>
          </div>

          <div className="mb-2">
            <SectionHeader icon={<CheckCircle size={15} className="text-gold-500" />} title="وضعیت محصول" />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onChange({ ...draft, inStock: !draft.inStock })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  draft.inStock ? 'bg-green-100 text-green-700' : 'bg-navy-50 text-navy-400'
                }`}
              >
                <CheckCircle size={14} />
                {draft.inStock ? 'موجود است' : 'ناموجود'}
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...draft, isNew: !draft.isNew })}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  draft.isNew ? 'bg-emerald-100 text-emerald-700' : 'bg-navy-50 text-navy-400'
                }`}
              >
                <Sparkles size={14} />
                نشان «جدید»
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 pt-4 border-t border-navy-100 sticky bottom-0 bg-white sm:rounded-b-3xl">
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
