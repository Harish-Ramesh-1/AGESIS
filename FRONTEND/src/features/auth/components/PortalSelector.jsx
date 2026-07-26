import { useRef } from 'react'
import { PORTALS } from '../../../constants/roles'
import PortalCard from './PortalCard'

export default function PortalSelector({ selectedPortalId, onSelect }) {
  const cardRefs = useRef([])

  function handleKeyDown(event, index) {
    const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const isPrev = event.key === 'ArrowLeft' || event.key === 'ArrowUp'
    if (!isNext && !isPrev) return

    event.preventDefault()
    const nextIndex = isNext
      ? (index + 1) % PORTALS.length
      : (index - 1 + PORTALS.length) % PORTALS.length

    onSelect(PORTALS[nextIndex].id)
    cardRefs.current[nextIndex]?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Select a portal" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PORTALS.map((portal, index) => (
        <div key={portal.id} onKeyDown={(event) => handleKeyDown(event, index)}>
          <PortalCard
            ref={(node) => {
              cardRefs.current[index] = node
            }}
            portal={portal}
            isSelected={portal.id === selectedPortalId}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  )
}
