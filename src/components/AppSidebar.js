import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react';
import { AppSidebarNav } from './AppSidebarNav';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import logo from './logo.png';
// sidebar nav config
import navigation from '../_nav';

const AppSidebar = () => {
  const dispatch = useDispatch();
  const unfoldable = useSelector(state => state.sidebarUnfoldable);
  return (
    <CSidebar position="fixed" unfoldable={!unfoldable}>
      <CSidebarBrand className="d-none d-md-flex" to="/">
        <center>
          <a href="/dashboard">
            <img className="sidebar-brand-full" src={logo} style={{ width: '25%' }} />
          </a>
        </center>
        <img className="sidebar-brand-narrow" src={logo} style={{ width: '65%' }} />
      </CSidebarBrand>
      <CSidebarNav>
        <SimpleBar>
          <AppSidebarNav items={navigation()} />
        </SimpleBar>
      </CSidebarNav>
      <CSidebarToggler
        className="d-lg-flex"
        onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
      />
    </CSidebar>
  );
};

export default React.memo(AppSidebar);
