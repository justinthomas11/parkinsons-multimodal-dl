import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🧠</span>
          <span className="navbar-logo-text">NeuroPredict</span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Home
          </NavLink>
          <NavLink to="/predict" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Predictor
          </NavLink>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            GitHub ↗
          </a>
        </nav>

        <Link to="/predict" className="btn btn-primary btn-sm">
          Try Predictor
        </Link>
      </div>
    </header>
  )
}
