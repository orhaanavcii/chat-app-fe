import React from 'react';
import { Route, Redirect } from 'react-router-dom';

function getJWT() {
  if (localStorage.getItem('token') === null) return false;
  return true;
}

export default function PrivateRoute({ component: Component, changeLanguage, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        getJWT() ? <Component {...props} /> : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
      }
    />
  );
}
