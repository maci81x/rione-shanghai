import { useEffect, useRef, useState } from 'react'
import { X, Camera, CameraOff } from 'lucide-react'
import jsQR from 'jsqr'

export default function QRScanner({ onScan, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setReady(true)
        animRef.current = requestAnimationFrame(tick)
      } catch (e) {
        if (cancelled) return
        setError(
          e.name === 'NotAllowedError'
            ? 'Permesso fotocamera negato. Usa la ricerca manuale.'
            : 'Fotocamera non disponibile. Assicurati che il sito sia aperto in HTTPS.'
        )
      }
    }

    startCamera()
    return () => {
      cancelled = true
      cancelAnimationFrame(animRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const tick = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) {
      animRef.current = requestAnimationFrame(tick)
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(video, 0, 0)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })
    if (code?.data) {
      cancelAnimationFrame(animRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      onScan(code.data)
      return
    }
    animRef.current = requestAnimationFrame(tick)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Camera size={18} /> Scansiona QR tessera
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-black" style={{ aspectRatio: '1 / 1' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />
          {ready && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 border-2 border-[#FFED00] rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
            </div>
          )}
        </div>

        {error ? (
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <CameraOff size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={onClose} className="btn-secondary w-full text-sm">
              Chiudi e usa ricerca manuale
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xs py-3">
            Inquadra il QR code della tessera
          </p>
        )}
      </div>
    </div>
  )
}
