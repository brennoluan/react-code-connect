import type { MenuItem } from '../types/navigation.types'

import feedGray from '../../../assets/icons/feed-gray.svg'
import feedWhite from '../../../assets/icons/feed-white.svg'
import accountGray from '../../../assets/icons/account-circle-gray.svg'
import accountWhite from '../../../assets/icons/account-circle-white.svg'
import logoutIcon from '../../../assets/icons/logout.svg'

export const menuItems: MenuItem[] = [
  {
    label: 'Feed',
    icon: feedGray,
    iconActive: feedWhite,
    path: '/',
  },
  {
    label: 'Perfil',
    icon: accountGray,
    iconActive: accountWhite,
    path: '/profile',
  },
  {
    label: 'Sair',
    icon: logoutIcon,
    iconActive: logoutIcon,
    action: () => {
      // Por enquanto apenas redireciona para login
      // Futuramente integrar com sistema de autenticação
      window.location.href = '/login'
    },
  },
]
