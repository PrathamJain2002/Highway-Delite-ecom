import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import logo from '../../logo.png'

type Experience = {
  _id: string
  title: string
  city: string
  price: number
  imageUrl: string
  shortDescription: string
}

export default function Home() {
  const navigate = useNavigate()
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await axios.get<Experience[]>(
          `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/experiences`
        )
        setExperiences(res.data)
      } catch (e) {
        setError('Failed to load experiences')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return experiences
    return experiences.filter((e) => e.title.toLowerCase().includes(q))
  }, [experiences, query])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand.yellow" />
            <img src={logo} alt="Highway Delite" className="h-8 object-contain" />
          </div>
          <div className="ml-auto flex gap-2">
            <input
              className="w-80 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand.yellow"
              placeholder="Search experiences"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="bg-brand.yellow text-black px-4 py-2 rounded-lg text-sm font-medium" type="button">
              Search
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {loading && <p className="text-sm text-neutral-500">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((exp) => (
            <div key={exp._id} className="bg-[#F0F0F0] rounded-xl shadow-card overflow-hidden">
              <img src={exp.imageUrl} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{exp.title}</h3>
                  <span className="text-xs bg-[#D6D6D6] px-2 py-1 rounded">{exp.city}</span>
                </div>
                <p className="text-xs text-neutral-600 line-clamp-2 mb-4">{exp.shortDescription}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">From <span className="font-semibold">₹{exp.price}</span></span>
                  <button
                    onClick={() => navigate(`/experiences/${exp._id}`)}
                    className="text-xs px-3 py-1.5"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <p className="text-sm text-neutral-500">No experiences found.</p>
          )}
        </div>
      </main>
    </div>
  )
}


