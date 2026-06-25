import { Fragment } from 'react'

type HighlightedTextProps = {
  text: string
  as?: 'p' | 'span'
  className?: string
  highlightClassName?: string
}

/** Wrap key phrases in **double asterisks** when editors omit them. */
function withAutoHighlights(text: string): string {
  if (/\*\*.+\*\*/.test(text)) return text

  let result = text

  result = result.replace(
    /(crafting )(.+?)( across\b)/i,
    '$1**$2**$3',
  )
  result = result.replace(
    /(through )(.+?)([.!?]|$)/i,
    '$1**$2**$3',
  )
  result = result.replace(
    /(prototyping and )(.+?)([.!?]|$)/i,
    '$1**$2**$3',
  )

  return result
}

function parseHighlightedText(text: string, highlightClassName: string) {
  const parts = withAutoHighlights(text).split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span key={index} className={highlightClassName}>
          {part.slice(2, -2)}
        </span>
      )
    }

    return <Fragment key={index}>{part}</Fragment>
  })
}

export function HighlightedText({
  text,
  as: Tag = 'p',
  className = 'text-[13px] text-muted-foreground/70 leading-relaxed',
  highlightClassName = 'text-foreground',
}: HighlightedTextProps) {
  return <Tag className={className}>{parseHighlightedText(text, highlightClassName)}</Tag>
}
