import React from 'react';
import CIcon from '@coreui/icons-react';
import { cilCursor, cilApps } from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';

function _nav() {
  const items = [
    {
      component: CNavItem,
      name: 'Anasayfa',
      icon: <CIcon icon={cilApps} customClassName="nav-icon" />,
      to: '/dashboard',
    },
    {
      component: CNavTitle,
      name: 'Sayfalar',
    },
    {
      component: CNavItem,
      name: 'Messages',
      icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
      to: '/messages',
    },
  ];

  return items;
}

export default _nav;
