import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const mongoUrl = process.env.MONGO_URL || ''
const useDb = !!mongoUrl

// Schemas
const ExperienceSchema = new mongoose.Schema({
  title: String,
  city: String,
  price: Number,
  imageUrl: String,
  shortDescription: String,
  description: String,
  days: [
    {
      date: String,
      slots: [
        {
          time: String,
          soldOut: Boolean,
          left: Number,
        },
      ],
    },
  ],
})
const BookingSchema = new mongoose.Schema({
  experienceId: String,
  date: String,
  time: String,
  name: String,
  email: String,
  discount: Number,
  reference: String,
})

const Experience = mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema)
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema)

// In-memory fallback data
let memory = { experiences: [], bookings: [] }
// basic in-memory seed so app works without DB
function seedMemory() {
  const today = new Date()
  const day = (n) => {
    const d = new Date(today)
    d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
  }
  const base = [
    {
      _id: '1',
      title: 'Kayaking',
      city: 'Udupi',
      price: 999,
      imageUrl: 'https://images.unsplash.com/photo-1443980995706-8d107e98e707?q=80&w=1400&auto=format&fit=crop',
      shortDescription: 'Curated small-group experience. Certified guide.',
      description: 'Curated small-group experience. Certified guide. Safety first with gear included. Helmet and life jackets along with an expert will accompany in kayaking.',
    },
    {
      _id: '2',
      title: 'Nandi Hills Sunrise',
      city: 'Bangalore',
      price: 899,
      imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop',
      shortDescription: 'Certified guide. Safety first with gear included.',
      description: 'Scenic routes, trained guides, and safety briefing. Minimum age 10.',
    },
    {
      _id: '3',
      title: 'Coffee Trail',
      city: 'Coorg',
      price: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1400&auto=format&fit=crop',
      shortDescription: 'Curated small-group experience. Certified guide.',
      description: 'Visit lush estates and taste fresh brews among the hills.',
    },
  ]
  memory.experiences = base.map((b) => ({
    ...b,
    days: [0, 1, 2, 3].map((i) => ({
      date: day(i),
      slots: [
        (() => { const soldOut = i === 1; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '07:00 am', soldOut, left } })(),
        (() => { const soldOut = false; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '09:00 am', soldOut, left } })(),
        (() => { const soldOut = i === 2; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '11:00 am', soldOut, left } })(),
        (() => { const soldOut = i === 0; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '01:00 pm', soldOut, left } })(),
      ],
    })),
  }))
}

async function init() {
  if (useDb) {
    await mongoose.connect(mongoUrl)
  }
  if (!useDb) seedMemory()
}

init().catch(console.error)

// API
app.get('/health', (_, res) => res.json({ ok: true }))

app.get('/experiences', async (_, res) => {
  const list = useDb ? await Experience.find({}).lean() : memory.experiences
  const withLeft = list.map((e) => ({
    ...e,
    days: e.days.map((d) => ({
      ...d,
      slots: d.slots.map((s) => {
        if (s.soldOut) return { ...s, left: 0 }
        const left = typeof s.left === 'number' ? s.left : Math.floor(Math.random() * 10) + 1
        return { ...s, left }
      }),
    })),
  }))
  res.json(withLeft)
})

app.get('/experiences/:id', async (req, res) => {
  const id = req.params.id
  const item = useDb ? await Experience.findById(id).lean() : memory.experiences.find((e) => e._id === id)
  if (!item) return res.status(404).json({ message: 'Not found' })
  const withLeft = {
    ...item,
    days: item.days.map((d) => ({
      ...d,
      slots: d.slots.map((s) => {
        if (s.soldOut) return { ...s, left: 0 }
        const left = typeof s.left === 'number' ? s.left : Math.floor(Math.random() * 10) + 1
        return { ...s, left }
      }),
    })),
  }
  res.json(withLeft)
})

app.post('/promo/validate', (req, res) => {
  const schema = z.object({ code: z.string(), subtotal: z.number() })
  const { code, subtotal } = schema.parse(req.body)
  const normalized = code.trim().toUpperCase()
  let discount = 0
  if (normalized === 'SAVE10') discount = Math.round(subtotal * 0.1)
  if (normalized === 'FLAT100') discount = 100
  res.json({ valid: discount > 0, discount })
})

app.post('/bookings', async (req, res) => {
  const schema = z.object({
    experienceId: z.string(),
    date: z.string(),
    time: z.string(),
    name: z.string().min(2),
    email: z.string().email(),
    discount: z.number().optional().default(0),
  })
  const data = schema.parse(req.body)

  // prevent double booking for same slot
  const exists = useDb
    ? await Booking.findOne({ experienceId: data.experienceId, date: data.date, time: data.time })
    : memory.bookings.find((b) => b.experienceId === data.experienceId && b.date === data.date && b.time === data.time)
  if (exists) return res.status(409).json({ message: 'Slot already booked' })

  const reference = uuid().slice(0, 8).toUpperCase()
  const booking = { ...data, reference }

  if (useDb) {
    await Booking.create(booking)
  } else {
    memory.bookings.push(booking)
  }

  res.json({ ok: true, reference })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`API listening on ${port}`))


