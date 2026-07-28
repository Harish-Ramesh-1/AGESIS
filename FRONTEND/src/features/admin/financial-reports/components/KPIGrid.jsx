import SummaryCard from './SummaryCard'

export default function KPIGrid({ cards, status }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      {cards.map((card) => (
        <SummaryCard
          key={card.label}
          icon={card.icon}
          label={card.label}
          value={card.value}
          meta={card.meta}
          trend={card.trend}
          status={card.status ?? status}
        />
      ))}
    </div>
  )
}
