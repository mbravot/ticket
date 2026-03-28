export default function Badge({ label, color }) {
  if (!color) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{label}</span>

  const bg = color + '22'
  const border = color + '55'

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
      style={{ backgroundColor: bg, color, borderColor: border }}
    >
      {label}
    </span>
  )
}
