import React from 'react';
import Route from 'react-router/lib/Route';

import App from './components/App';
import ViewerQuery from './queries/ViewerQuery';

export default (
  <Route
    path="/"
    component={App}
    queries={ViewerQuery}
		>
  </Route>
);