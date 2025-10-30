import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.env') })

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
const Experience = mongoose.model('Experience', ExperienceSchema)

const today = new Date()
const day = (n) => {
  const d = new Date(today)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

const sample = [
  {
    title: 'Kayaking',
    city: 'Udupi',
    price: 999,
    imageUrl: 'https://images.unsplash.com/photo-1443980995706-8d107e98e707?q=80&w=1400&auto=format&fit=crop',
    shortDescription: 'Curated small-group experience. Certified guide.',
    description: 'Curated small-group experience. Certified guide. Safety first with gear included. Helmet and life jackets along with an expert will accompany in kayaking.',
    days: [0,1,2,3].map((i) => ({ date: day(i), slots: [
      (() => { const soldOut = i===1; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '07:00 am', soldOut, left } })(),
      (() => { const soldOut = false; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '09:00 am', soldOut, left } })(),
      (() => { const soldOut = i===2; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '11:00 am', soldOut, left } })(),
      (() => { const soldOut = true; const left = 0; return { time: '01:00 pm', soldOut, left } })(),
    ] }))
  },
  {
    title: 'Nandi Hills Sunrise',
    city: 'Bangalore',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop',
    shortDescription: 'Certified guide. Safety first with gear included.',
    description: 'Scenic routes, trained guides, and safety briefing. Minimum age 10.',
    days: [0,1,2,3].map((i) => ({ date: day(i), slots: [
      (() => { const soldOut = false; const left = Math.floor(Math.random()*10)+1; return { time: '06:00 am', soldOut, left } })(),
      (() => { const soldOut = i===0; const left = soldOut ? 0 : Math.floor(Math.random()*10)+1; return { time: '08:00 am', soldOut, left } })(),
      (() => { const soldOut = false; const left = Math.floor(Math.random()*10)+1; return { time: '10:00 am', soldOut, left } })(),
    ] }))
  },
  {
    title: 'Coffee Trail',
    city: 'Coorg',
    price: 1299,
    imageUrl: 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?q=80&w=1400&auto=format&fit=crop',
    shortDescription: 'Curated small-group experience. Certified guide.',
    description: 'Visit lush estates and taste fresh brews among the hills.',
    days: [0,1,2,3].map((i) => ({ date: day(i), slots: [
      (() => { const soldOut = false; const left = Math.floor(Math.random()*10)+1; return { time: '09:00 am', soldOut, left } })(),
      (() => { const soldOut = false; const left = Math.floor(Math.random()*10)+1; return { time: '11:00 am', soldOut, left } })(),
      (() => { const soldOut = false; const left = Math.floor(Math.random()*10)+1; return { time: '01:00 pm', soldOut, left } })(),
    ] }))
  }
]

async function run() {
  if (!process.env.MONGO_URL) {
    console.error('Missing MONGO_URL')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGO_URL)
  await Experience.deleteMany({})
  await Experience.insertMany(sample)
  console.log('Seeded experiences:', sample.length)
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })


