import { useLocation } from 'react-router'
import { NavItem } from './NavItem'
import { menuItems } from '../constants/menuItems'

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-dark-gray border-t border-gray/20 h-16 z-50">
      <div className="flex items-center justify-around w-full px-4">
        {menuItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            iconActive={item.iconActive}
            isActive={item.path ? location.pathname === item.path : false}
            path={item.path}
            onClick={item.action}
            showLabel={false}
          />
        ))}
      </div>
    </nav>
  )
}
