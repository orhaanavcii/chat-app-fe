import React from 'react';

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Messages = React.lazy(() => import('./views/messages'));
const Table2 = React.lazy(() => import('./views/tables/Table2'));

const routes = () => [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/messages', name: 'Messagges', component: Messages },
  // { path: '/table2', name: 'Table2', component: Table2 },
];

export default routes;
