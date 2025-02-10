import React from 'react';
import {
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';

import { cilSettings, cilUser } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const AppHeaderDropdown = () => {
  const logOut = () => {
    sessionStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'spaceBetween', textAlign: 'center' }}>
      <div>
        <CDropdown variant="nav-item">
          <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
            <div id="profileImage">AA</div>
          </CDropdownToggle>
          <CDropdownMenu className="pt-0" placement="bottom-end">
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', marginBottom: '10px' }}>
              <div id="profileImage" style={{ margin: '12px auto 5px auto' }}>
                {'AA'}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 'bold ' }}>{sessionStorage.getItem('userName')}</div>
              <div style={{ fontSize: '12px' }}>{sessionStorage.getItem('userName')}</div>
            </div>
            <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
            <CDropdownItem href="#">
              <CIcon icon={cilUser} className="me-2" />
              Profile
            </CDropdownItem>
            <CDropdownItem href="#">
              <CIcon icon={cilSettings} className="me-2" />
              Settings
            </CDropdownItem>
            <CDropdownDivider />
            <CDropdownItem href="#">
              <button className="btn" onClick={() => logOut()}>
                <i className="fa fa-sign-out" aria-hidden="true"></i> {'Çıkış Yap'}
              </button>
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </div>
    </div>
  );
};

export default AppHeaderDropdown;
