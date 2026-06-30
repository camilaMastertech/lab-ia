import { useEffect, useMemo } from 'react'
import sourceHtml from '../tech-hall-pocket (1).html?raw'
import sourceHtmlEn from '../tech-hall-pocket.en.html?raw'

function extractDocumentParts(html) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const style = doc.querySelector('style')?.textContent ?? ''
  const body = doc.body.innerHTML
  const lang = doc.documentElement.lang || 'pt-BR'
  const title = doc.title || 'lab.IA — Mastertech'

  return { style, body, lang, title }
}

export default function App() {
  const isEnglish = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('lang') === 'en' || window.location.pathname.endsWith('/en')
  }, [])

  const { style, body, lang, title } = useMemo(
    () => extractDocumentParts(isEnglish ? sourceHtmlEn : sourceHtml),
    [isEnglish],
  )

  useEffect(() => {
    const previousLang = document.documentElement.lang
    const previousTitle = document.title
    const styleTag = document.createElement('style')
    styleTag.setAttribute('data-lab-ia-style', 'true')
    styleTag.textContent = style
    document.head.appendChild(styleTag)
    document.documentElement.lang = lang
    document.title = title

    const fontPreconnects = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ]

    const createdLinks = fontPreconnects.map((href) => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = href
      if (href.includes('gstatic')) {
        link.crossOrigin = 'anonymous'
      }
      document.head.appendChild(link)
      return link
    })

    const fontStylesheet = document.createElement('link')
    fontStylesheet.rel = 'stylesheet'
    fontStylesheet.href =
      'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300;1,9..144,400&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,300&display=swap'
    document.head.appendChild(fontStylesheet)

    return () => {
      document.documentElement.lang = previousLang
      document.title = previousTitle
      styleTag.remove()
      fontStylesheet.remove()
      createdLinks.forEach((link) => link.remove())
    }
  }, [lang, style, title])

  useEffect(() => {
    const hamburger = document.getElementById('hamburger')
    const menuOverlay = document.getElementById('menuOverlay')
    const backdrop = document.getElementById('backdrop')
    const menuLinks = document.querySelectorAll('.menu-link')

    if (!hamburger || !menuOverlay || !backdrop) {
      return undefined
    }

    const toggleMenu = () => {
      hamburger.classList.toggle('open')
      menuOverlay.classList.toggle('open')
      backdrop.classList.toggle('open')
    }

    const closeMenu = () => {
      hamburger.classList.remove('open')
      menuOverlay.classList.remove('open')
      backdrop.classList.remove('open')
    }

    const closeMenuWithDelay = () => {
      window.setTimeout(closeMenu, 400)
    }

    hamburger.addEventListener('click', toggleMenu)
    backdrop.addEventListener('click', closeMenu)
    menuLinks.forEach((link) => link.addEventListener('click', closeMenuWithDelay))

    return () => {
      hamburger.removeEventListener('click', toggleMenu)
      backdrop.removeEventListener('click', closeMenu)
      menuLinks.forEach((link) => link.removeEventListener('click', closeMenuWithDelay))
    }
  }, [])

  return <div dangerouslySetInnerHTML={{ __html: body }} />
}
