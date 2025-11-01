export interface MenuItem {
  label: string
  icon: string
  iconActive: string
  path?: string
  action?: () => void
}

export interface NavItemProps {
  label: string
  icon: string
  iconActive: string
  isActive: boolean
  path?: string
  onClick?: () => void
  showLabel?: boolean
}
