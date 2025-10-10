import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'

export default function RichTextEditor({ value, onChange, accent, placeholder = 'Write here…' }) {
  const editorRef = useRef(null)
  const [color, setColor] = useState('#0f172a')

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    // Ensure paragraphs are created on Enter for predictable editing
    try { document.execCommand('defaultParagraphSeparator', false, 'p') } catch (_) {}
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

  function handlePaste(e) {
    // Paste as plain text to avoid messy HTML; basic formatting can be re-applied
    e.preventDefault()
    const text = (e.clipboardData || window.clipboardData).getData('text')
    document.execCommand('insertText', false, text)
  }

  function createLink() {
    const url = window.prompt('Enter URL:')
    if (!url) return
    exec('createLink', url)
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
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Link" onClick={createLink}>
          ⛓
        </button>
        <button type="button" className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700" title="Remove format" onClick={() => exec('removeFormat')}>
          ⌫
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        spellCheck
        className="min-h-[240px] w-full px-4 py-3 text-base leading-7 outline-none bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
        style={{ caretColor: accent?.base || '#0ea5e9', lineHeight: 1.7 }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before { content: attr(data-placeholder); color: #94a3b8; }
        [contenteditable] p { margin: 0 0 0.75rem 0; }
        [contenteditable] h2 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        [contenteditable] h3 { font-size: 1.125rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.25rem; margin: 0.75rem 0; }
        [contenteditable] a { color: ${accent?.base || '#0ea5e9'}; text-decoration: underline; }
      `}</style>
    </div>
  )
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  accent: PropTypes.object,
}
