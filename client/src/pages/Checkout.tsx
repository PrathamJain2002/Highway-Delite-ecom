import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import axios from 'axios'

export default function Checkout() {
  const { state } = useLocation() as { state: { expId: string; title: string; date: string; time: string; price: number; city: string } }
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [promo, setPromo] = useState('')
  const [agree, setAgree] = useState(false)
  const [discount, setDiscount] = useState(0)
  const taxes = useMemo(() => Math.round(state.price * 0.059), [state.price])
  const total = useMemo(() => state.price + taxes - discount, [state.price, taxes, discount])

  const applyPromo = async () => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/promo/validate`, { code: promo, subtotal: state.price })
      setDiscount(res.data.discount)
    } catch {
      setDiscount(0)
    }
  }

  const payAndConfirm = async () => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/bookings`, {
      experienceId: state.expId,
      date: state.date,
      time: state.time,
      name,
      email,
      discount,
    })
    navigate('/result', { state: { success: true, ref: res.data.reference } })
  }

  if (!state) return <div className="p-8">No checkout data.</div>

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <span className="font-semibold">Checkout</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <section className="bg-white rounded-xl border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-600">Full name</label>
              <input className="w-full mt-1 rounded-lg border px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-xs text-neutral-600">Email</label>
              <input className="w-full mt-1 rounded-lg border px-3 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
            </div>
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-neutral-600">Promo code</label>
              <input className="w-full mt-1 rounded-lg border px-3 py-2 text-sm" value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="SAVE10" />
            </div>
            <button onClick={applyPromo} className="bg-black text-white px-4 py-2 rounded-lg text-sm">Apply</button>
          </div>
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            I agree to the terms and safety policy
          </label>
        </section>

        <aside className="bg-white rounded-xl border p-4 h-fit text-sm">
          <div className="space-y-2">
            <div className="flex justify-between"><span>Experience</span><span>{state.title}</span></div>
            <div className="flex justify-between"><span>Date</span><span>{state.date}</span></div>
            <div className="flex justify-between"><span>Time</span><span>{state.time}</span></div>
            <div className="flex justify-between"><span>Qty</span><span>1</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>₹{state.price}</span></div>
            <div className="flex justify-between"><span>Taxes</span><span>₹{taxes}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-₹{discount}</span></div>}
            <hr />
            <div className="flex justify-between font-semibold"><span>Total</span><span>₹{total}</span></div>
            <button
              disabled={!agree || !name || !/\S+@\S+\.\S+/.test(email)}
              onClick={payAndConfirm}
              className="w-full mt-2 bg-brand.yellow text-black rounded-lg py-2"
            >
              Pay and Confirm
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}


