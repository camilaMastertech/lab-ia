import { useEffect, useMemo, useState } from 'react'
import sourceHtml from '../tech-hall-pocket (1).html?raw'
import sourceHtmlEn from '../tech-hall-pocket.en.html?raw'
import sourceHtmlPepsico from '../pepsico.html?raw'

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
  const view = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const path = window.location.pathname
    if (params.get('cliente') === 'pepsico' || path.endsWith('/pepsico')) return 'pepsico'
    if (params.get('lang') === 'en' || path.endsWith('/en')) return 'en'
    return 'pt'
  }, [])

  const { style, body, lang, title } = useMemo(() => {
    const source =
      view === 'pepsico' ? sourceHtmlPepsico : view === 'en' ? sourceHtmlEn : sourceHtml
    const parts = extractDocumentParts(source)
    // A página PepsiCo reaproveita o CSS do site principal (não tem <style> próprio).
    const style = parts.style || extractDocumentParts(sourceHtml).style
    return { ...parts, style }
  }, [view])

  // Barreira simples de senha para a página PepsiCo (proteção leve, não criptográfica —
  // o conteúdo ainda vai no bundle; serve só para não deixar a URL aberta a qualquer um).
  const [unlocked, setUnlocked] = useState(
    () =>
      view !== 'pepsico' ||
      (typeof window !== 'undefined' &&
        window.sessionStorage.getItem('labia_pepsico') === '1'),
  )
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)

  const submitPw = (event) => {
    event.preventDefault()
    if (pw.trim().toLowerCase() === 'pepsico') {
      window.sessionStorage.setItem('labia_pepsico', '1')
      setUnlocked(true)
    } else {
      setPwError(true)
    }
  }

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

  if (view === 'pepsico' && !unlocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background:
            'radial-gradient(ellipse at 65% 15%, #DAE6F5 0%, #F4F7FC 45%, #E8F0F8 100%)',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        <form
          onSubmit={submitPw}
          style={{
            width: '100%',
            maxWidth: '360px',
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '2px',
            padding: '2.25rem 2rem',
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#8A8880',
              marginBottom: '1.25rem',
            }}
          >
            lab.IA <span style={{ color: '#4A4840' }}>×</span> PepsiCo
          </p>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: '1.6rem',
              lineHeight: 1.1,
              color: '#1A1916',
              marginBottom: '0.5rem',
            }}
          >
            Conteúdo restrito
          </h1>
          <p style={{ fontSize: '13px', fontWeight: 300, color: '#4A4840', marginBottom: '1.5rem' }}>
            Informe a senha para acessar a proposta.
          </p>
          <input
            type="password"
            value={pw}
            autoFocus
            onChange={(e) => {
              setPw(e.target.value)
              setPwError(false)
            }}
            placeholder="senha"
            aria-label="senha"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              color: '#1A1916',
              background: '#FFFFFF',
              border: `1px solid ${pwError ? '#C0392B' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: '2px',
              outline: 'none',
              marginBottom: pwError ? '0.5rem' : '1rem',
            }}
          />
          {pwError && (
            <p style={{ fontSize: '12px', color: '#C0392B', marginBottom: '1rem' }}>
              Senha incorreta.
            </p>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '14px',
              fontWeight: 500,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              color: '#F4F7FC',
              background: '#1A1916',
              border: 'none',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return <div dangerouslySetInnerHTML={{ __html: body }} />
}
