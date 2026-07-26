export default function Footer({ text, version, copyright, links }) {
  return (
    <footer className="flex flex-col items-center gap-2 py-3 text-center text-[11px] text-slate-400 dark:text-slate-500">
      {links && links.length > 0 && (
        <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href?.startsWith('http') ? '_blank' : undefined}
              rel={link.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={link.onClick}
              className="font-medium text-slate-500 transition-colors duration-200 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
      <p className="flex items-center gap-2">
        <span>{text}</span>
        {version && (
          <>
            <span aria-hidden="true">·</span>
            <span>v{version}</span>
          </>
        )}
      </p>
      {copyright && <p>{copyright}</p>}
    </footer>
  )
}
