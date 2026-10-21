"use client"

import { Shield } from "lucide-react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { useEffect } from "react"

const CYCLE = 16
const TRAVEL_SECONDS = 0.8 // time a beam takes to cross its line
const MIN_GAP = 3 // shortest rest between runs (seconds)
const MAX_GAP = 7 // longest rest between runs (seconds)
const PAD = 0.02 // keeps round caps fully hidden off-path

type Pt = [number, number]

// Builds a path with softly rounded corners from a list of points
function rounded(points: Pt[], r = 8) {
 let d = `M${points[0][0]} ${points[0][1]}`
 for (let i = 1;i < points.length - 1;i++) {
  const [px, py] = points[i - 1]
  const [cx, cy] = points[i]
  const [nx, ny] = points[i + 1]
  const l1 = Math.hypot(cx - px, cy - py)
  const l2 = Math.hypot(nx - cx, ny - cy)
  const r1 = Math.min(r, l1 / 2)
  const r2 = Math.min(r, l2 / 2)
  const ax = cx - ((cx - px) / l1) * r1
  const ay = cy - ((cy - py) / l1) * r1
  const bx = cx + ((nx - cx) / l2) * r2
  const by = cy + ((ny - cy) / l2) * r2
  d += ` L${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`
 }
 const [lx, ly] = points[points.length - 1]
 return `${d} L${lx} ${ly}`
}

/*
  Shield box in the 320x352 viewBox: x 104-216, y 120-232 (center 160,176).
  Every connector: outer edge -> straight stub -> 45° jog (40 x 40) -> 24px straight into the port.
  Left/right and top/bottom are exact mirrors of each other.
  Order: top x2, right x2, bottom x2, left x2
*/
const connectors = [
 // top
 [[92, 24], [92, 56], [132, 96], [132, 120]],
 [[228, 24], [228, 56], [188, 96], [188, 120]],
 // right
 [[304, 108], [280, 108], [240, 148], [216, 148]],
 [[304, 244], [280, 244], [240, 204], [216, 204]],
 // bottom
 [[92, 328], [92, 296], [132, 256], [132, 232]],
 [[228, 328], [228, 296], [188, 256], [188, 232]],
 // left
 [[16, 108], [40, 108], [80, 148], [104, 148]],
 [[16, 244], [40, 244], [80, 204], [104, 204]],
].map((pts) => rounded(pts as Pt[]))

// One color per beam (same order as connectors)
const COLORS = [
 "#3b82f6", // blue
 "#a855f7", // purple
 "#ec4899", // pink
 "#f97316", // orange
 "#eab308", // yellow
 "#22c55e", // green
 "#14b8a6", // teal
 "#06b6d4", // cyan
]

// Ports relative to the shield box (size-28 = 112px), same order as connectors
const ports = [
 { left: 28, top: 0 },
 { left: 84, top: 0 },
 { left: 112, top: 28 },
 { left: 112, top: 84 },
 { left: 28, top: 112 },
 { left: 84, top: 112 },
 { left: 0, top: 28 },
 { left: 0, top: 84 },
]

// Comet: long faint tail -> short bright head, all sharing the same head position
const LAYERS = [
 { len: 0.24, opacity: 0.15, width: 1.5 },
 { len: 0.13, opacity: 0.4, width: 2 },
 { len: 0.05, opacity: 1, width: 2.5 },
]
const MAX = LAYERS[0].len
const HEAD_START = -PAD
const HEAD_END = 1 + MAX + PAD

function Layer({
 d,
 color,
 len,
 opacity,
 width,
 head,
}: {
 d: string
 color: string
 len: number
 opacity: number
 width: number
 head: MotionValue<number>
}) {
 // offset = len - headPosition
 const strokeDashoffset = useTransform(head, (h) => len - h)

 return (
  <motion.path
   d={d}
   pathLength={1}
   fill='none'
   stroke={color}
   strokeOpacity={opacity}
   strokeWidth={width}
   strokeLinecap='round'
   strokeLinejoin='round'
   strokeDasharray={`${len} 2`}
   style={{ strokeDashoffset }}
  />
 )
}

function Beam({ d, color }: { d: string; color: string }) {
 const head = useMotionValue(HEAD_START)

 // Random rest -> travel -> new random rest, forever.
 // Runs in useEffect so there is no server/client hydration mismatch.
 useEffect(() => {
  let cancelled = false
  let controls: ReturnType<typeof animate> | undefined
  let timer: ReturnType<typeof setTimeout> | undefined

  const run = () => {
   const wait = (MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP)) * 1000
   timer = setTimeout(() => {
    if (cancelled) return
    head.set(HEAD_START)
    controls = animate(head, HEAD_END, {
     duration: TRAVEL_SECONDS,
     ease: "linear",
     onComplete: () => {
      if (!cancelled) run()
     },
    })
   }, wait)
  }

  run()

  return () => {
   cancelled = true
   if (timer) clearTimeout(timer)
   controls?.stop()
  }
 }, [head])

 return (
  <g style={{ filter: `drop-shadow(0 0 3px ${color})` }}>
   {LAYERS.map((layer) => (
    <Layer key={layer.len} d={d} color={color} head={head} {...layer} />
   ))}
  </g>
 )
}

export function AuthDecoration() {
 const shouldAnimate = !useReducedMotion()

 return (
  <div aria-hidden className='pointer-events-none absolute inset-0 overflow-hidden'>
   <motion.div
    className='absolute inset-0 bg-[radial-gradient(circle,var(--color-primary)_1.5px,transparent_1.5px)] bg-[length:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_72%)]'
    initial={false}
    animate={shouldAnimate ? { opacity: [0.12, 0.18, 0.12] } : { opacity: 0.15 }}
    transition={{ duration: CYCLE / 2, repeat: Infinity, ease: "easeInOut" }}
   />

   <motion.div
    className='absolute bottom-0 right-0 h-[22rem] w-80'
    initial={shouldAnimate ? { opacity: 0 } : false}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.2, ease: "easeOut" }}
   >
    <motion.div className='absolute inset-0'>
     <svg viewBox='0 0 320 352' fill='none' className='absolute inset-0 size-full overflow-visible'>
      {connectors.map((d, i) => (
       <path
        key={`track-${i}`}
        d={d}
        stroke={COLORS[i]}
        strokeOpacity={0.25}
        strokeWidth={1}
        strokeLinejoin='round'
       />
      ))}

      {shouldAnimate &&
       connectors.map((d, i) => <Beam key={`beam-${i}`} d={d} color={COLORS[i]} />)}
     </svg>

     <div className='absolute left-1/2 top-30 z-10 flex size-28 -translate-x-1/2 items-center justify-center rounded-lg border bg-background/60'>
      <Shield className='size-16 text-muted-foreground/30' strokeWidth={0.6} />

      {ports.map((port, i) => (
       <span
        key={`port-${i}`}
        className='absolute size-1.5'
        style={{
         left: port.left,
         top: port.top,
         transform: "translate(-50%, -50%)",
         backgroundColor: COLORS[i],
         boxShadow: `0 0 6px ${COLORS[i]}`,
        }}
       />
      ))}
     </div>
    </motion.div>
   </motion.div>
  </div>
 )
}