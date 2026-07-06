import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { X, CameraOff } from 'lucide-react'

const VIEWPORT_ID = 'qr-scan-viewport'

export default function QRScanner({ onScan, onClose }) {
  const [error, setError] = useState(null)
  const scannerRef = useRef(null)
  const firedRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode(VIEWPORT_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          if (firedRef.current) return
          firedRef.current = true
          // Stop camera then fire callback
          scanner.stop().catch(() => {}).finally(() => onScan(decodedText))
        },
        () => {} // per-frame decode errors: normale, ignora
      )
      .catch((err) => {
        const msg = String(err).toLowerCase()
        if (msg.includes('permission') || msg.includes('notallowed') || msg.includes('denied')) {
          setError('Permesso fotocamera negato. Usa la ricerca manuale per nome o codice tessera.')
        } else {
          setError('Fotocamera non disponibile. Verifica che il sito sia aperto in HTTPS e che nessuna altra app stia usando la camera.')
        }
      })

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Scansiona tessera QR</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1 min-h-[44px] flex items-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* html5-qrcode inietta il video qui — tenuto sempre nel DOM */}
        <div id={VIEWPORT_ID} className={`w-full ${error ? 'hidden' : ''}`} />

        {error ? (
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <CameraOff size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={onClose} className="btn-secondary w-full text-sm">
              Chiudi — usa ricerca manuale
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-400 text-xs py-3 px-4">
            Inquadra il QR code della tessera
          </p>
        )}
      </div>
    </div>
  )
}
