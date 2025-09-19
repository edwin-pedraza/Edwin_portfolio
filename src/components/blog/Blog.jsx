import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './page/Header'
import Footer from './page/Footer'
import Home from './page/Home'
import About from './page/About'
import Contact from './page/Contact'
import CreatePost from './page/CreatePost'
import useBlogSettings from './useBlogSettings'
import { buildAccentPalette } from '../admin/themeUtils'

export default function Blog() {
  const { theme: themeColors, blog: blogSettings, loading } = useBlogSettings()
  const palette = useMemo(() => buildAccentPalette(themeColors, 'light'), [themeColors])

  return (
    <div style={{ backgroundColor: palette.lightShell, color: '#0f172a', minHeight: '100vh' }}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
        <Header />
        <Routes>
          <Route index element={<Home blogSettings={blogSettings} loading={loading} accent={palette} />} />
          <Route path="about" element={<About blogSettings={blogSettings} accent={palette} />} />
          <Route path="contact" element={<Contact blogSettings={blogSettings} accent={palette} />} />
          <Route path="create" element={<CreatePost accent={palette} />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
        <Footer blogSettings={blogSettings} accent={palette} />
      </div>
    </div>
  )
}