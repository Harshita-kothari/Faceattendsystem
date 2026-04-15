import { Camera, ScanFace, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function FaceCapture({ onFramesChange, maxFrames = 5, label = 'Capture face samples' }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(document.createElement('canvas'))
  const [active, setActive] = useState(false)
  const [frames, setFrames] = useState([])
  const [error, setError] = useState('')

  useEffect(() => () => stopCamera(), [])

  async function startCamera() {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'user' },
        },
        audio: false,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
    } catch {
      setError('Allow camera access and try again. On mobile, make sure the browser has permission to use the front camera.')
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setActive(false)
  }

  function captureFrame() {
    const video = videoRef.current
    if (!video || video.readyState < 2) {
      setError('Wait for the camera preview to become ready, then capture the sample.')
      return
    }
    const canvas = canvasRef.current
    const maxWidth = 960
    const scale = Math.min(1, maxWidth / Math.max(video.videoWidth || maxWidth, 1))
    canvas.width = Math.max(320, Math.round((video.videoWidth || maxWidth) * scale))
    canvas.height = Math.max(320, Math.round((video.videoHeight || maxWidth) * scale))
    canvas.getContext('2d').drawImage(video, 0, 0)
    const image = canvas.toDataURL('image/jpeg', 0.72)
    const nextFrames = [...frames, image].slice(0, maxFrames)
    setFrames(nextFrames)
    onFramesChange?.(nextFrames)
  }

  return (
    <div className="card-panel p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Capture 5 to 10 clear images for better matching.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs dark:bg-slate-800">{frames.length}/{maxFrames}</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-slate-950">
        <video ref={videoRef} className="h-56 w-full object-cover sm:h-64" playsInline muted />
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {active ? (
          <>
            <button onClick={captureFrame} type="button" className="action-primary w-full justify-center sm:w-auto">
              <ScanFace size={16} />
              Capture sample
            </button>
            <button onClick={stopCamera} type="button" className="action-secondary w-full justify-center sm:w-auto">
              <Square size={16} />
              Stop
            </button>
          </>
        ) : (
          <button onClick={startCamera} type="button" className="action-primary w-full justify-center sm:w-auto">
            <Camera size={16} />
            Start camera
          </button>
        )}
      </div>
      {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
      {frames.length ? (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {frames.map((frame, index) => (
            <img
              key={`${index}-${frame.slice(0, 18)}`}
              src={frame}
              alt={`Captured sample ${index + 1}`}
              className="aspect-square w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
