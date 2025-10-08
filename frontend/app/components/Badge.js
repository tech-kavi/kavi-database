// components/Badge.js
export default function Badge({ label, options , truncate=false}) {
  if (!label) return <span>-</span>;

  const colorClass = options[label] || 'bg-gray-100 text-gray-700';

  return (
     <span
      className={`inline-block px-3 py-1 text-xs font-bold rounded-full text-center ${colorClass} ${
        truncate ? 'max-w-[120px] truncate block overflow-hidden whitespace-nowrap' : ''
      }`}
      title={label} // show full text on hover
    >
      {label}
    </span>
  );
}
