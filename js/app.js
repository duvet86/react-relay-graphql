import 'babel-polyfill';

import App from './components/App';
import ViewerRoute from './queries/ViewerRoute';
import React from 'react';
import { render } from 'react-dom';
import { RootContainer } from 'react-relay';
import { IntlProvider } from 'react-intl';

render(
  <IntlProvider locale="en">
    <RootContainer
      Component={App}
      route={new ViewerRoute() }
      />
  </IntlProvider>,
  document.getElementById('root')
);