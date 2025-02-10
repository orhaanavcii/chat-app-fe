import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CContainer, CHeader, CHeaderBrand, CHeaderNav, CNavLink, CNavItem } from '@coreui/react';

import { AppHeaderDropdown } from './header/index';

const AppHeader = props => {
  return (
    <CHeader position="sticky" className="mb-2">
      <CContainer fluid>
        <CHeaderBrand className="mx-auto d-md-none" to="/"></CHeaderBrand>
        <CHeaderNav className="d-none d-md-flex me-auto">
          <CNavItem>
            <CNavLink to="/dashboard" component={NavLink} activeclassname="active">
              Dashboard
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav></CHeaderNav>
        <CHeaderNav className="">
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  );
};

export default AppHeader;
