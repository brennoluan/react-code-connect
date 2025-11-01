import { NavLink } from 'react-router'
import type { NavItemProps } from '../types/navigation.types'

export function NavItem({
  label,
  icon,
  iconActive,
  isActive,
  path,
  onClick,
  showLabel = true,
}: NavItemProps) {
  const iconSrc = isActive ? iconActive : icon

  const baseClasses = showLabel
    ? `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-prompt`
    : `flex items-center justify-center p-3 rounded-lg transition-all duration-200`

  const activeClasses = isActive
    ? 'bg-petrol-green text-white'
    : 'text-gray hover:bg-petrol-green/20 hover:text-white'

  const content = (
    <>
      <img src={iconSrc} alt={label} className="w-6 h-6" />
      {showLabel && <span className="text-base font-prompt">{label}</span>}
    </>
  )

  if (path) {
    return (
      <NavLink
        to={path}
        className={({ isActive: routeActive }) =>
          `${baseClasses} ${routeActive ? 'bg-petrol-green text-white' : activeClasses}`
        }
      >
        {content}
      </NavLink>
    )
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${activeClasses} ${showLabel ? 'w-full' : ''}`}>
      {content}
    </button>
  )
}
