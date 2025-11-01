import { useLocation } from 'react-router'
import { NavItem } from './NavItem'
import { menuItems } from '../constants/menuItems'
import logo from '../../../assets/Logo.png'

export function DesktopNav() {
  const location = useLocation()

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-dark-gray min-h-screen p-6 fixed left-0 top-0">
      {/* Logo */}
      <div className="mb-12">
        <img src={logo} alt="Code Connect" className="w-full max-w-[180px]" />
      </div>

      {/* Menu Items */}
      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            iconActive={item.iconActive}
            isActive={item.path ? location.pathname === item.path : false}
            path={item.path}
            onClick={item.action}
            showLabel={true}
          />
        ))}
      </nav>
    </aside>
  )
}
