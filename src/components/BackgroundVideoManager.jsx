import { motion } from 'framer-motion'

const BG_OPACITY = 0.1

export function BackgroundVideoProvider({ children }) {
  return (
    <>
      <div className="bg-video-stage" aria-hidden="true">
        <motion.div
          className="bg-layer-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: BG_OPACITY }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <video
            className="bg-video"
            src="videos/bgvid.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
        </motion.div>
        <div className="bg-video-scrim" />
      </div>
      {children}
    </>
  )
}
