import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

type Slot = { time: string; soldOut: boolean }
type Day = { date: string; slots: Slot[] }
type Experience = {
  _id: string
  title: string
  city: string
  price: number
  imageUrl: string
  description: string
  days: Day[]
}

export default function Details() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exp, setExp] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await axios.get<Experience>(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/experiences/${id}`
      )
      setExp(res.data)
      setSelectedDate(res.data.days[0]?.date ?? null)
      setLoading(false)
    }
    load()
  }, [id])

  const slotsForDay = useMemo(() => {
    if (!exp || !selectedDate) return []
    return exp.days.find((d) => d.date === selectedDate)?.slots ?? []
  }, [exp, selectedDate])

  const subtotal = useMemo(() => (exp ? exp.price * quantity : 0), [exp, quantity])
  const taxes = useMemo(() => Math.round((exp?.price || 0) * 0.059 * quantity), [exp?.price, quantity])
  const total = useMemo(() => subtotal + taxes, [subtotal, taxes])

  if (loading) return <div className="p-8">Loading…</div>
  if (!exp) return <div className="p-8">Not found</div>

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-sm">← Details</Link>
          <div className="ml-auto flex gap-2">
            <input className="w-80 rounded-lg border px-3 py-2 text-sm" placeholder="Search" />
            <button className="bg-brand.yellow text-black px-4 py-2 rounded-lg text-sm font-medium">Search</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        <div>
          <img src={exp.imageUrl} className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl" />
          <h1 className="text-2xl font-semibold mt-6">{exp.title}</h1>
          <p className="text-sm text-neutral-600 mt-2 max-w-3xl">{exp.description}</p>

          <div className="mt-6">
            <p className="font-medium mb-2">Choose date</p>
            <div className="flex flex-wrap gap-2">
              {exp.days.map((d) => (
                <button
                  key={d.date}
                  onClick={() => { setSelectedDate(d.date); setSelectedTime(null) }}
                  className={`px-3 py-1.5 rounded border text-sm ${selectedDate===d.date ? 'border-black' : 'bg-white'}`}
                >
                  {new Date(d.date).toDateString().slice(4, 10)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="font-medium mb-2">Choose time</p>
            <div className="flex flex-wrap gap-2">
              {slotsForDay.map((s) => (
                <button
                  key={s.time}
                  disabled={s.soldOut}
                  onClick={() => setSelectedTime(s.time)}
                  className={`px-3 py-1.5 rounded border text-sm disabled:opacity-40 ${selectedTime===s.time ? 'border-black' : 'bg-white'}`}
                >
                  {s.time} {s.soldOut && <span className="text-red-600 ml-1">Sold out</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="font-medium mb-2">About</p>
            <div className="bg-[#EEEEEE] rounded-lg p-4 text-sm">
              {exp.description}
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-xl border p-4 h-fit">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span>Starts at</span><span>₹{exp.price}</span></div>
            <div className="flex justify-between items-center">
              <span>Quantity</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 grid place-items-center border rounded bg-[#EFEFEF]"
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-7 h-7 grid place-items-center border rounded bg-[#EFEFEF]"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between"><span>Taxes</span><span>₹{taxes}</span></div>
            <hr />
            <div className="flex justify-between font-semibold"><span>Total</span><span>₹{total}</span></div>
            <button
              disabled={!selectedDate || !selectedTime}
              onClick={() =>
                navigate('/checkout', {
                  state: { expId: exp._id, title: exp.title, date: selectedDate, time: selectedTime, price: exp.price, city: exp.city }
                })
              }
              className="w-full mt-2 rounded-lg py-2 text-sm bg-brand.yellow text-black disabled:bg-[#D7D7D7]"
            >
              Confirm
            </button>
          </div>
        </aside>
      </main>
    </div>
  )
}


