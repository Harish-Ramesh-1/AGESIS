import { useEffect, useState } from 'react'
import clsx from 'clsx'
import slide1 from '../../../assets/images/login/1.svg'
import slide2 from '../../../assets/images/login/2.svg'
import slide3 from '../../../assets/images/login/3.svg'
import slide4 from '../../../assets/images/login/4.svg'

const SLIDES = [
  { id: 'slide-1', src: slide1 },
  { id: 'slide-2', src: slide2 },
  { id: 'slide-3', src: slide3 },
  { id: 'slide-4', src: slide4 },
]

const SLIDE_INTERVAL = 4500

export default function BrandCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_INTERVAL)
    return () => window.clearInterval(timerId)
  }, [])

  return (
    <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-clay border border-white/50 shadow-glass dark:border-white/10">
      {SLIDES.map((slide, slideIndex) => {
        const isActive = slideIndex === index
        return (
          <img
            key={slide.id}
            src={slide.src}
            alt="Agesis International School"
            aria-hidden={!isActive}
            className={clsx(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-premium',
              isActive
                ? 'opacity-100 animate-[slow-zoom_9s_ease-in-out_infinite_alternate]'
                : 'opacity-0',
            )}
          />
        )
      })}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-clay ring-1 ring-inset ring-white/15"
      />

      <div className="absolute bottom-5 right-5 flex gap-1.5" role="tablist" aria-label="Photo slides">
        {SLIDES.map((slide, dotIndex) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            onClick={() => setIndex(dotIndex)}
            aria-label={`Show slide ${dotIndex + 1}`}
            aria-selected={dotIndex === index}
            className={clsx(
              'h-1.5 rounded-full transition-all duration-300 ease-premium focus-visible:outline-none',
              dotIndex === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70',
            )}
          />
        ))}
      </div>
    </div>
  )
}
