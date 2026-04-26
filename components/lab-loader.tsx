"use client"

import { useEffect, useState } from "react"

interface LabLoaderProps {
  active: boolean
  className?: string
}

export function LabLoader({ active, className = "" }: LabLoaderProps) {
  const [mounted, setMounted] = useState(active)

  useEffect(() => {
    if (active) {
      setMounted(true)
      return
    }
    const timeoutId = window.setTimeout(() => setMounted(false), 500)
    return () => window.clearTimeout(timeoutId)
  }, [active])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center gap-5 bg-slate-950 transition-opacity duration-500 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      } ${className}`}
      aria-hidden={!active}
      style={{ ["--lab-duration" as string]: "2000ms" }}
    >
      <div className="relative h-56 w-44">
        <svg viewBox="0 0 180 240" className="h-full w-full">
          <defs>
            <clipPath id="flask-liquid-clip">
              <path d="M66 24h48v20l24 34v100c0 17-14 30-30 30H72c-16 0-30-13-30-30V78l24-34z" />
            </clipPath>
          </defs>

          <path
            d="M66 24h48v20l24 34v100c0 17-14 30-30 30H72c-16 0-30-13-30-30V78l24-34z"
            fill="rgba(148, 163, 184, 0.08)"
            stroke="rgb(51 65 85)"
            strokeWidth="6"
            strokeLinejoin="round"
          />

          <g clipPath="url(#flask-liquid-clip)">
            <rect className="lab-liquid" x="40" y="214" width="100" height="160" />
            <path className="lab-wave" d="M36 150 C56 138, 76 162, 96 150 C116 138, 136 162, 156 150 V240 H36 Z" />
            <circle className="lab-bubble bubble-1" cx="62" cy="168" r="4" />
            <circle className="lab-bubble bubble-2" cx="82" cy="182" r="3.5" />
            <circle className="lab-bubble bubble-3" cx="98" cy="174" r="5" />
          </g>
        </svg>
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-300">Preparando fórmula Gain Lab...</p>
    </div>
  )
}
