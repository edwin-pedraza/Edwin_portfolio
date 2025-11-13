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
    <div
      style={{
        color: '#0f172a',
        minHeight: '100vh',
        backgroundImage: `radial-gradient(60% 60% at -10% -10%, ${palette.softer} 0%, transparent 60%), radial-gradient(50% 50% at 110% 0%, ${palette.soft} 0%, transparent 60%), linear-gradient(180deg, ${palette.lightShell} 0%, #e2e8f0 35%, ${palette.lightShell} 100%)`,
        backgroundColor: palette.lightShell,
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
        <Header accent={palette} />
        <Routes>
          <Route index element={<Home blogSettings={blogSettings} loading={loading} accent={palette} themeColors={themeColors} />} />
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
