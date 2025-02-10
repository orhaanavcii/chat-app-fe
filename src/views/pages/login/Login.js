import React, { useState, useRef } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilLockLocked, cilUser } from '@coreui/icons';
import logo from './logo.png';

const Login = () => {
  const [userForm, setUserForm] = useState(null);

  const onLogin = e => {
    e.preventDefault();
    const user = {
      username: userForm.kullaniciAdi.toString(),
      password: userForm.kullaniciSifre.toString(),
    };
    localStorage.setItem('token', '123');
    localStorage.setItem('userName', userForm.kullaniciAdi.toString());
    window.location.replace('/messages');
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={e => onLogin(e)}>
                    <h1>Giriş Sayfası</h1>
                    <p className="text-medium-emphasis">{'Giriş Yap'}</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder={'Kullanıcı Adı'}
                        required
                        onChange={e =>
                          setUserForm({
                            ...userForm,
                            kullaniciAdi: e.target.value,
                          })
                        }
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder={'Şifre'}
                        required
                        onChange={e =>
                          setUserForm({
                            ...userForm,
                            kullaniciSifre: e.target.value,
                          })
                        }
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton className="px-4" type="submit" style={{ backgroundColor: '#01589F' }}>
                          Giriş Yap
                        </CButton>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol xs={4} className="text-right">
                        <CButton color="link" className="px-0">
                          Şifremi Unuttum!
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white" style={{ width: '44%', backgroundColor: '#01589F' }}>
                <CCardBody className="text-center" style={{ display: 'flex', justifyContent: 'center' }}>
                  <img src={logo} style={{ width: '55%', margin: 'auto' }} />
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Login;
