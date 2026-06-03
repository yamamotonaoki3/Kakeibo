import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import styles from './Layout.module.css'

const TABS = [
  { path: '/',                 icon: '📅', label: 'カレンダー' },
  { path: '/transactions',     icon: '📋', label: '一覧' },
  { path: '/transactions/new', icon: '➕', label: '入力' },
  { path: '/summary',          icon: '📊', label: 'サマリー' },
  { path: '/accounts',         icon: '⚙️', label: '設定' },
]

function isTabActive(tabPath: string, pathname: string): boolean {
  if (tabPath === '/transactions/new') return pathname === '/transactions/new'
  if (tabPath === '/transactions') {
    return pathname.startsWith('/transactions') && pathname !== '/transactions/new'
  }
  if (tabPath === '/accounts') {
    return pathname === '/accounts' || pathname === '/categories'
  }
  return pathname === tabPath
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.logo}>Kakeibo</span>
        <div className={styles.userArea}>
          <span className={styles.displayName}>{user?.displayName}</span>
          <button className="btn-ghost" onClick={handleLogout}>ログアウト</button>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <nav className={styles.tabbar}>
        {TABS.map(tab => (
          <button
            key={tab.path}
            className={`${styles.tabItem} ${isTabActive(tab.path, pathname) ? styles.active : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
