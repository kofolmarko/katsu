'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const LINES = [
  'RESUME_OS v2026.1',
  '> inserting memory card...',
  '> 1 save file found',
  '> loading save game...',
  '> ready.',
]

const CHAR_MS = 15

const BRAILLE = ['⠾', '⠽', '⠻', '⠯', '⠷', '⠸']

const LINE_DELAYS: number[] = (() => {
  const GAP = 80
  const delays: number[] = []
  let t = 200
  for (const line of LINES) {
    delays.push(t)
    t += line.length * CHAR_MS + GAP
  }
  return delays
})()

const PROMPT_DELAY =
  LINE_DELAYS[LINE_DELAYS.length - 1] +
  LINES[LINES.length - 1].length * CHAR_MS +
  150

interface LoadingScreenProps {
  sceneReady: boolean
  onEnter: () => void
}

export default function LoadingScreen({ sceneReady, onEnter }: LoadingScreenProps) {
  const [lineCount, setLineCount] = useState(0)
  const [promptVisible, setPromptVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [pendingEnter, setPendingEnter] = useState(false)
  const enterCalledRef = useRef(false)
  const brailleRef = useRef<HTMLSpanElement>(null)
  const brailleWaitRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const t = [
      ...LINE_DELAYS.map((delay, i) =>
        setTimeout(() => setLineCount(i + 1), delay)
      ),
      setTimeout(() => setPromptVisible(true), PROMPT_DELAY),
    ]
    return () => t.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const frames = BRAILLE.length
    let frame = 0
    let lastTime = 0
    let rafId: number
    const update = (time: number) => {
      if (time - lastTime >= 80) {
        lastTime = time
        frame = (frame + 1) % frames
        if (brailleRef.current) brailleRef.current.textContent = BRAILLE[frame]
        if (brailleWaitRef.current) brailleWaitRef.current.textContent = BRAILLE[frame]
      }
      rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [])

  const triggerExit = useCallback(() => {
    if (enterCalledRef.current) return
    enterCalledRef.current = true
    setExiting(true)
    setTimeout(onEnter, 450)
  }, [onEnter])

  const handleEnter = useCallback(() => {
    if (!promptVisible) return
    if (!sceneReady) { setPendingEnter(true); return }
    triggerExit()
  }, [promptVisible, sceneReady, triggerExit])

  useEffect(() => {
    if (pendingEnter && sceneReady) triggerExit()
  }, [pendingEnter, sceneReady, triggerExit])

  useEffect(() => {
    const onKey = () => handleEnter()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleEnter])

  const isWaiting = promptVisible && (!sceneReady || pendingEnter)
  const dotsVisible = lineCount < LINES.length

  return (
    <div
      className={`ls-root${exiting ? ' ls-exiting' : ''}`}
      onClick={handleEnter}
      style={{
        cursor: promptVisible && !isWaiting ? 'pointer' : 'default',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      <div className="ls-window">
        <div className="ls-titlebar">
          <div className="ls-traffic">
            <span className="ls-td ls-td-red" />
            <span className="ls-td ls-td-yellow" />
            <span className="ls-td ls-td-green" />
          </div>
          <span className="ls-title-text">resume_os — bash</span>
        </div>

        <div className="ls-terminal">
          {LINES.slice(0, lineCount).map((line, i) => (
            <div
              key={i}
              className="ls-line"
              style={{
                animation: `typewriter ${line.length * CHAR_MS}ms steps(${line.length}, end) forwards`,
              } as React.CSSProperties}
            >
              {line}
            </div>
          ))}

          {dotsVisible && (
            <div className="ls-loader" aria-hidden="true">
              <span ref={brailleRef} className="ls-braille">⠾</span>
            </div>
          )}

          {promptVisible && (
            <div className="ls-prompt-line">
              {isWaiting ? (
                <div className="ls-loader" aria-hidden="true">
                  <span ref={brailleWaitRef} className="ls-braille">⠾</span>
                </div>
              ) : (
                <>press any key to continue<span className="ls-cursor">_</span></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
