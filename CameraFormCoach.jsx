import { useEffect, useRef, useState } from 'react'

const POSE_SCRIPT = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js'

function loadPose() {
  if (window.Pose) return Promise.resolve(window.Pose)
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${POSE_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Pose), { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = POSE_SCRIPT
    script.onload = () => resolve(window.Pose)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function midpoint(first, second) { return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 } }
function angle(first, vertex, last) {
  const firstVector = { x: first.x - vertex.x, y: first.y - vertex.y }
  const lastVector = { x: last.x - vertex.x, y: last.y - vertex.y }
  const radians = Math.atan2(lastVector.y, lastVector.x) - Math.atan2(firstVector.y, firstVector.x)
  return Math.abs(Math.atan2(Math.sin(radians), Math.cos(radians)) * 180 / Math.PI)
}

export default function CameraFormCoach({ targetReps, currentSet, onSet, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const poseRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  const phaseRef = useRef('standing')
  const repsRef = useRef(0)
  const lastFeedbackRef = useRef('Move into the camera view so I can better detect your position.')
  const [cameraState, setCameraState] = useState('requesting')
  const [tracking, setTracking] = useState(true)
  const [paused, setPaused] = useState(false)
  const [reps, setReps] = useState(0)
  const [feedback, setFeedback] = useState('Move into the camera view so I can better detect your position.')
  const [poseState, setPoseState] = useState('Waiting for camera')
  const [depth, setDepth] = useState('--')

  useEffect(() => {
    let disposed = false
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera is not available in this browser.')
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }, audio: false })
        if (disposed) { stream.getTracks().forEach((track) => track.stop()); return }
        streamRef.current = stream
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraState('ready')
        const Pose = await loadPose()
        if (disposed) return
        const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` })
        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.65, minTrackingConfidence: 0.65 })
        pose.onResults(handleResults)
        poseRef.current = pose
        processFrame()
      } catch (error) {
        setCameraState(error.name === 'NotAllowedError' ? 'denied' : 'error')
        setFeedback(error.name === 'NotAllowedError' ? 'Camera permission was denied. Enable camera access to use AI Form Coach.' : error.message || 'Camera unavailable. Use normal set tracking instead.')
      }
    }
    start()
    return () => {
      disposed = true
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      poseRef.current?.close?.()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  async function processFrame() {
    if (poseRef.current && videoRef.current?.readyState >= 2 && !paused && tracking) await poseRef.current.send({ image: videoRef.current })
    animationRef.current = requestAnimationFrame(processFrame)
  }

  function handleResults(results) {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return
    canvas.width = video.videoWidth || 720
    canvas.height = video.videoHeight || 720
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    const landmarks = results.poseLandmarks
    if (!landmarks) { setPoseState('No person detected'); setFeedback('Move into the camera view so I can better detect your position.'); return }
    const visible = [11, 12, 23, 24, 25, 26].every((index) => (landmarks[index]?.visibility || 0) > 0.55)
    if (!visible) { setPoseState('Move into frame'); setFeedback('Move into the camera view so I can better detect your position.'); return }
    drawLandmarks(context, landmarks, canvas.width, canvas.height)
    const leftKnee = angle(landmarks[23], landmarks[25], landmarks[27])
    const rightKnee = angle(landmarks[24], landmarks[26], landmarks[28])
    const kneeAngle = (leftKnee + rightKnee) / 2
    const hips = midpoint(landmarks[23], landmarks[24])
    const shoulders = midpoint(landmarks[11], landmarks[12])
    const upright = Math.abs(shoulders.x - hips.x) < 0.25
    const squatting = kneeAngle < 125
    const standing = kneeAngle > 155
    const approximateDepth = Math.max(0, Math.min(100, Math.round((155 - kneeAngle) / 0.55)))
    setDepth(`${approximateDepth}%`)
    setPoseState(squatting ? 'Squatting' : standing ? 'Standing' : 'Moving')
    if (!upright) { setFeedback('Keep your chest more upright.'); return }
    if (squatting && phaseRef.current === 'standing') { phaseRef.current = 'squatting'; setFeedback(approximateDepth >= 55 ? 'Good depth. Drive through your feet.' : 'Try going a little deeper.'); return }
    if (standing && phaseRef.current === 'squatting') {
      phaseRef.current = 'standing'
      repsRef.current += 1
      setReps(repsRef.current)
      setFeedback(approximateDepth >= 55 ? 'Good rep!' : 'Try going a little deeper next rep.')
      if (repsRef.current >= targetReps) {
        onSet(currentSet)
        repsRef.current = 0
        setReps(0)
      }
    }
  }

  function drawLandmarks(context, landmarks, width, height) {
    const connections = [[11, 12], [11, 23], [12, 24], [23, 24], [23, 25], [24, 26], [25, 27], [26, 28]]
    context.strokeStyle = '#a7d886'
    context.lineWidth = 4
    connections.forEach(([first, second]) => { context.beginPath(); context.moveTo(landmarks[first].x * width, landmarks[first].y * height); context.lineTo(landmarks[second].x * width, landmarks[second].y * height); context.stroke() })
    context.fillStyle = '#ff6b3d'
    landmarks.forEach((landmark, index) => { if ([11, 12, 23, 24, 25, 26, 27, 28].includes(index)) { context.beginPath(); context.arc(landmark.x * width, landmark.y * height, 6, 0, Math.PI * 2); context.fill() } })
  }

  function toggleCamera() {
    const next = !tracking
    setTracking(next)
    streamRef.current?.getTracks().forEach((track) => { track.enabled = next })
    if (!next) setFeedback('AI tracking is off. Use Complete Set in the workout screen to log this set.')
  }

  return <div className="camera-coach-backdrop"><section className="camera-coach" role="dialog" aria-modal="true" aria-labelledby="camera-coach-title"><header className="camera-coach-header"><div><p className="kicker orange-text">AI FORM COACH</p><h2 id="camera-coach-title">Squat form check</h2><p>Set {currentSet + 1} · Target {targetReps} reps</p></div><button className="close-runner" onClick={onClose} aria-label="Exit camera coach">×</button></header><div className="camera-preview"><video ref={videoRef} muted playsInline className={tracking ? '' : 'camera-off'} /><canvas ref={canvasRef} /><div className="camera-status"><span className={cameraState === 'ready' ? 'status-dot ready' : 'status-dot'} />{cameraState === 'ready' ? tracking ? 'Tracking locally' : 'Camera paused' : cameraState === 'requesting' ? 'Requesting camera...' : 'Camera unavailable'}</div>{cameraState !== 'ready' && <div className="camera-error"><strong>{cameraState === 'denied' ? 'Camera permission needed' : 'Camera coach unavailable'}</strong><span>{feedback}</span><button className="button-outline" onClick={onClose}>Use normal set tracking</button></div>}</div><div className="camera-metrics"><div><small>REPS</small><strong>{reps}</strong><span>/ {targetReps}</span></div><div><small>POSE</small><strong>{poseState}</strong></div><div><small>DEPTH</small><strong>{depth}</strong></div></div><div className={`form-feedback ${feedback === 'Good rep!' ? 'good' : ''}`}><span>{feedback === 'Good rep!' ? '🟢' : '🟡'}</span>{feedback}</div><div className="camera-controls"><button className="camera-control" onClick={() => setPaused((value) => !value)}>{paused ? '▶ Resume' : 'Ⅱ Pause'}</button><button className="camera-control" onClick={toggleCamera}>{tracking ? 'Camera off' : 'Camera on'}</button><button className="button-primary" onClick={onClose}>Exit Coach</button></div><p className="camera-disclaimer">AI form feedback is an estimate, not medical advice or a replacement for a qualified trainer. Video is processed locally and is not uploaded or stored by WorkoutAI.</p></section></div>
}
