'use client'

import { forwardRef } from 'react'
import { PSP_CONFIG, PSP_IFRAME_ID } from '@/lib/config'

interface IframeScreenProps {
  visible: boolean
}

export const IFRAME_FADE_MS = 320

// Rendered at a fixed native CSS pixel size (PSP_CONFIG.screen.width/height)
// and positioned/sized into view each frame by <ScreenTracker> via a
// translate+scale transform on this wrapper ref. Keeping the native size
// fixed means xmb-katsu's internal layout (which uses vw/vh clamp()) stays
// consistent regardless of the browser window size.
const IframeScreen = forwardRef<HTMLDivElement, IframeScreenProps>(
  function IframeScreen({ visible }, ref) {
    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: PSP_CONFIG.screen.width,
          height: PSP_CONFIG.screen.height,
          transformOrigin: 'top left',
          // Tracker writes translate()/scale() into transform directly; we
          // must not override it here. Initial value keeps it off-screen
          // until the first frame of tracking applies.
          transform: 'translate(-10000px, -10000px)',
          willChange: 'transform, opacity',
          zIndex: 5,
          background: '#000',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          opacity: visible ? 1 : 0,
          transition: `opacity ${IFRAME_FADE_MS}ms ease-out`,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <iframe
          id={PSP_IFRAME_ID}
          src={PSP_CONFIG.screen.url}
          // Grant autoplay permission to the cross-origin iframe so its sound
          // effects work without requiring the user to click inside it first.
          allow="autoplay"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
        />
      </div>
    )
  }
)

export default IframeScreen
