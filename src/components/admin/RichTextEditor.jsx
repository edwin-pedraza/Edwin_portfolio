import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'

export default function RichTextEditor({ value, onChange, accent, placeholder = 'Write here…', onUploadImage }) {
  const editorRef = useRef(null)
  const [color, setColor] = useState('#0f172a')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // Ensure paragraphs are created on Enter for predictable editing
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p')
    } catch (error) {
      console.warn('RichTextEditor: default paragraph separator unsupported', error)
    }
    // Only update if different to avoid moving caret
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || ''
    }
  }, [value])

  function exec(cmd, arg) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, arg)
    // Emit change
    onChange?.(editorRef.current?.innerHTML || '')
  }

  function handleInput() {
    onChange?.(editorRef.current?.innerHTML || '')
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function handlePaste(e) {
    // Paste as either fenced code or plain text to avoid messy HTML
    const text = (e.clipboardData || window.clipboardData).getData('text')
    if (text && /```([\s\S]*?)```/m.test(text)) {
      e.preventDefault()
      const code = text.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/```\s*$/, '')
      const html = `<pre><code>${escapeHtml(code)}</code></pre>`
      document.execCommand('insertHTML', false, html)
      onChange?.(editorRef.current?.innerHTML || '')
      return
    }
    e.preventDefault()
    document.execCommand('insertText', false, text)
  }

  function createLink() {
    const url = window.prompt('Enter URL:')
    if (!url) return
    exec('createLink', url)
  }

  function insertAtCursor(html) {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount) return
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const temp = document.createElement('div')
    temp.innerHTML = html
    const frag = document.createDocumentFragment()
    let node
    while ((node = temp.firstChild)) frag.appendChild(node)
    range.insertNode(frag)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
    onChange?.(editorRef.current?.innerHTML || '')
  }

  async function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    if (typeof onUploadImage !== 'function') return
    for (const file of files) {
      try {
        const url = await onUploadImage(file)
        if (url) insertAtCursor(`<img src="${url}" alt="" />`)
      } catch (_) { /* ignore */ }
    }
  }

  async function handlePickImage(ev) {
    const file = ev.target.files?.[0]
    if (!file || typeof onUploadImage !== 'function') return
    try {
      const url = await onUploadImage(file)
      if (url) insertAtCursor(`<img src="${url}" alt="" />`)
    } catch (_) { /* ignore */ }
    ev.target.value = ''
  }

  return (
    <div className="rounded-2xl border border-slate-300 overflow-hidden bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div
        className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-2 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <button type="button" className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Undo" onClick={() => exec('undo')}>
          ↶
        </button>
        <button type="button" className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Redo" onClick={() => exec('redo')}>
          ↷
        </button>
        <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200 text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          onChange={(e) => exec('formatBlock', e.target.value)}
          defaultValue="p"
        >
          <option value="p">Paragraph</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

        <button type="button" className="px-2 py-1 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700" title="Bold" onClick={() => exec('bold')}>
          B
        </button>
        <button type="button" className="px-2 py-1 italic hover:bg-slate-100 dark:hover:bg-slate-700" title="Italic" onClick={() => exec('italic')}>
          I
        </button>
        <button type="button" className="px-2 py-1 underline hover:bg-slate-100 dark:hover:bg-slate-700" title="Underline" onClick={() => exec('underline')}>
          U
        </button>
        <label className="ml-1 inline-flex items-center gap-2 text-xs">
          <span>Aa</span>
          <input
            type="color"
            value={color}
            onChange={(e) => { setColor(e.target.value); exec('foreColor', e.target.value) }}
          />
        </label>

        <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Align left" onClick={() => exec('justifyLeft')}>
          ⟸
        </button>
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Align center" onClick={() => exec('justifyCenter')}>
          ≡
        </button>
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Align right" onClick={() => exec('justifyRight')}>
          ⟹
        </button>

        <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />

        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Numbered list" onClick={() => exec('insertOrderedList')}>
          1·
        </button>
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Bulleted list" onClick={() => exec('insertUnorderedList')}>
          •
        </button>

        <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Quote" onClick={() => exec('formatBlock', 'blockquote')}>
          ❝
        </button>
        <button
          type="button"
          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Code block"
          onClick={() => {
            const sel = window.getSelection()
            const inPre = sel && sel.anchorNode && editorRef.current && editorRef.current.contains(sel.anchorNode) && (sel.anchorNode.closest ? sel.anchorNode.closest('pre') : null)
            if (inPre) {
              // unwrap the pre
              const pre = sel.anchorNode.closest('pre')
              if (pre) {
                const text = pre.textContent
                const p = document.createElement('p')
                p.textContent = text
                pre.replaceWith(p)
                onChange?.(editorRef.current?.innerHTML || '')
              }
              return
            }
            const selected = sel && sel.toString ? sel.toString() : ''
            if (selected) {
              const html = `<pre><code>${escapeHtml(selected)}</code></pre>`
              document.execCommand('insertHTML', false, html)
              onChange?.(editorRef.current?.innerHTML || '')
            } else {
              exec('formatBlock', 'pre')
            }
          }}
        >
          {'</>'}
        </button>
        <button
          type="button"
          className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Exit all code blocks"
          onClick={() => {
            const root = editorRef.current
            if (!root) return
            const pres = Array.from(root.querySelectorAll('pre'))
            pres.forEach((pre) => {
              const text = pre.textContent || ''
              // Split by double newline into paragraphs
              const parts = text.split(/\n{2,}/).map((t) => t.trim()).filter(Boolean)
              const frag = document.createDocumentFragment()
              parts.forEach((t) => {
                const p = document.createElement('p')
                p.textContent = t
                frag.appendChild(p)
              })
              pre.replaceWith(frag)
            })
            onChange?.(editorRef.current?.innerHTML || '')
          }}
        >
          ⎚
        </button>

        <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Link" onClick={createLink}>
          ⛓
        </button>
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Remove format" onClick={() => exec('removeFormat')}>
          ⌫
        </button>
        {onUploadImage && (
          <>
            <span className="mx-1 h-5 w-px bg-slate-300 dark:bg-slate-600" />
            <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Insert image" onClick={() => fileInputRef.current?.click()}>
              🖼
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
          </>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        spellCheck
        className={`min-h-[260px] w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base leading-7 text-slate-900 shadow-inner outline-none transition focus-visible:ring-2 focus-visible:ring-sky-100 ${dragOver ? 'ring-2 ring-sky-300' : ''}`}
        style={{
          caretColor: accent?.base || '#0ea5e9',
          lineHeight: 1.7,
          borderColor: dragOver ? (accent?.soft || '#bae6fd') : '#e2e8f0',
          boxShadow: 'inset 0 1px 2px rgba(15,23,42,0.1)',
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable] { font-family: 'Inter', 'ui-sans-serif', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; color: #0f172a; }
        [contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #94a3b8; }
        [contenteditable] p { margin: 0 0 0.9rem 0; line-height: 1.75; color: #1e293b; }
        [contenteditable] h2 { font-size: 1.35rem; font-weight: 600; margin: 1.2rem 0 0.5rem; color: #0f172a; }
        [contenteditable] h3 { font-size: 1.15rem; font-weight: 600; margin: 0.9rem 0 0.4rem; color: #0f172a; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.35rem; margin: 0.9rem 0; color: #334155; }
        [contenteditable] ul { list-style-type: disc; }
        [contenteditable] ol { list-style-type: decimal; }
        [contenteditable] li { margin-bottom: 0.45rem; }
        [contenteditable] a { color: ${accent?.base || '#0ea5e9'}; text-decoration: underline; font-weight: 500; }
        [contenteditable] blockquote { border-left: 4px solid ${accent?.base || '#0ea5e9'}; padding-left: .9rem; margin: 1rem 0; color: #475569; background: #f1f5f9; border-radius: 0 1rem 1rem 0; }
        [contenteditable] code { background: #e2e8f0; color: #0f172a; border-radius: 0.45rem; padding: 0.15rem 0.45rem; font-size: 0.9em; font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
        [contenteditable] pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem 1.25rem; border-radius: 1.25rem; overflow: auto; white-space: pre-wrap; font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; color: #0f172a; box-shadow: inset 0 1px 2px rgba(15,23,42,.08); }
        [contenteditable] pre code { background: transparent; padding: 0; color: inherit; font-size: 0.95em; }
      `}</style>
    </div>
  )
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  accent: PropTypes.object,
  onUploadImage: PropTypes.func,
}
