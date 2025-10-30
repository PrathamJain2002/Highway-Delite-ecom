import { Link, useLocation } from 'react-router-dom'

export default function Result() {
  const { state } = useLocation() as { state?: { success: boolean; ref: string } }
  const success = state?.success
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <div className={`w-14 h-14 mx-auto rounded-full grid place-items-center ${success ? 'bg-green-100' : 'bg-red-100'}`}>
          <span className={`text-2xl ${success ? 'text-green-600' : 'text-red-600'}`}>✓</span>
        </div>
        <h1 className="text-2xl font-semibold mt-4">{success ? 'Booking Confirmed' : 'Booking Failed'}</h1>
        {success && <p className="text-sm text-neutral-600 mt-2">Ref ID: {state?.ref}</p>}
        <Link to="/" className="inline-block mt-6 bg-neutral-200 px-4 py-2 rounded">Back to Home</Link>
      </div>
    </div>
  )
}


