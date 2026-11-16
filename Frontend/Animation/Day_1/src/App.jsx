import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import './App.css'

function App() {
  const boxRef = useRef(null)
  const tweenRef = useRef(null)
  const [status, setStatus] = useState('Idle')

  // Cleanup on unmount → always kill the animation
  useEffect(() => {
    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill()
      }
    }
  }, [])

  const playAnimation = () => {
    // Kill any existing animation first
    if (tweenRef.current) {
      tweenRef.current.kill()
    }

    setStatus('Playing')

    tweenRef.current = gsap.to(boxRef.current, {
      x: 180,
      rotation: 360,
      scale: 1.2,
      duration: 1.4,
      ease: 'power2.inOut',
      yoyo: true,
      repeat: 1,
      onComplete: () => setStatus('Completed'),
    })
  }

  const pauseAnimation = () => {
    if (tweenRef.current) {
      tweenRef.current.pause()
      setStatus('Paused')
    }
  }

  const resumeAnimation = () => {
    if (tweenRef.current) {
      tweenRef.current.resume()
      setStatus('Playing')
    }
  }

  const killAnimation = () => {
    if (tweenRef.current) {
      tweenRef.current.kill()
      tweenRef.current = null
      // Reset the box to original position
      gsap.set(boxRef.current, { x: 0, rotation: 0, scale: 1 })
      setStatus('Killed & Reset')
    }
  }

  return (
    <div className="app">
      <h1>GSAP + React</h1>
      <p className="subtitle">Simple demo with play / pause / kill</p>

      <div className="box-container">
        <div ref={boxRef} className="box">
          BOX
        </div>
      </div>

      <div className="controls">
        <button className="primary" onClick={playAnimation}>
          Play
        </button>
        <button onClick={pauseAnimation}>Pause</button>
        <button onClick={resumeAnimation}>Resume</button>
        <button className="danger" onClick={killAnimation}>
          Kill
        </button>
      </div>

      <p className="status">
        Status: <span>{status}</span>
      </p>
    </div>
  )
}

export default App
