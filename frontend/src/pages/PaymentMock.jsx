import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  QrCode,
  Clock3,
  Building2,
  IndianRupee,
  ShieldCheck,
} from 'lucide-react'
import { Button, Card } from '../components/ui'

const PAYMENT_WINDOW_MS = 5 * 60 * 1000

const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function PaymentMock() {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const amount = searchParams.get('amount') || '0'
  const campaignTitle = searchParams.get('campaignTitle') || 'SAHYOG Campaign'
  const donorName = searchParams.get('donorName') || 'Supporter'
  const donorPhone = searchParams.get('donorPhone') || ''
  const expiresAtParam = Number(searchParams.get('expiresAt'))
  const expiresAt =
    Number.isFinite(expiresAtParam) && expiresAtParam > 0 ? expiresAtParam : 0
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    if (!expiresAt) return

    const syncRemaining = () => {
      const next = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setRemainingSeconds(next)
    }

    syncRemaining()
    const timer = setInterval(() => {
      syncRemaining()
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  const expired = remainingSeconds <= 0

  const upiUri = useMemo(() => {
    const params = new URLSearchParams({
      pa: 'sahyog@upi',
      pn: 'SAHYOG',
      am: String(amount || 0),
      cu: 'INR',
      tn: `Donation ${orderId || ''}`,
    })
    return `upi://pay?${params.toString()}`
  }, [amount, orderId])

  const qrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
      upiUri
    )}`
  }, [upiUri])

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <Card
        hover={false}
        className="w-full max-w-5xl !p-0 overflow-hidden border border-slate-200 shadow-xl"
      >
        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          <div className="bg-white p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-500">
                    Payment Gateway
                  </p>
                  <h1 className="font-heading text-2xl font-bold text-slate-900">
                    Cashfree Payments
                  </h1>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 px-3 py-1 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Secure Checkout
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                UPI QR
              </span>
              <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                UPI Apps
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3 mb-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                    Pay To
                  </p>
                  <p className="font-heading text-xl font-bold text-slate-900">
                    SAHYOG
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${expired ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}
                >
                  <Clock3 className="h-4 w-4" />
                  {expired ? 'Expired' : formatTimer(remainingSeconds)}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500 text-xs">Order ID</p>
                  <p className="font-semibold text-slate-900 break-all">
                    {orderId}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500 text-xs">Campaign</p>
                  <p className="font-semibold text-slate-900">
                    {campaignTitle}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500 text-xs">Donor</p>
                  <p className="font-semibold text-slate-900">{donorName}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-slate-500 text-xs">Phone</p>
                  <p className="font-semibold text-slate-900">
                    {donorPhone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 text-white p-5 sm:p-6">
              <p className="text-xs uppercase tracking-wide text-slate-300 mb-2">
                Amount Payable
              </p>
              <p className="text-4xl font-heading font-extrabold flex items-center gap-1">
                <IndianRupee className="h-8 w-8" />
                {Number(amount || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => navigate('/fund')} variant="ghost">
                Back to Fund
              </Button>
              <Button
                onClick={() => window.open(upiUri, '_self')}
                disabled={expired}
              >
                Pay via UPI App
              </Button>
            </div>
          </div>

          <div className="bg-slate-50 border-l border-slate-200 p-6 sm:p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-[320px] text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold mb-4">
                <QrCode className="h-4 w-4" />
                Scan & Pay
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3">
                <img
                  src={qrUrl}
                  alt="Payment QR"
                  className="w-full h-auto rounded-xl"
                />
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Scan this QR from any UPI app to pay exactly the entered amount
                to SAHYOG.
              </p>
              <div className="mt-4 rounded-xl bg-white border border-slate-200 px-3 py-2 text-left text-xs text-slate-600">
                <p>
                  <span className="font-semibold">UPI ID:</span> sahyog@upi
                </p>
                <p>
                  <span className="font-semibold">Merchant:</span> SAHYOG
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-4">
                Powered by Cashfree Payments
              </p>
              <Link
                to="/fund"
                className="inline-flex mt-3 text-xs text-primary hover:underline"
              >
                Cancel payment and return
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
