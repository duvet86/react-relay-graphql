// import 'babel-polyfill';

// import React from 'react';
// import { render } from 'react-dom';
// import createHashHistory from 'history/lib/createHashHistory';
// import Relay from 'react-relay';
// import applyRouterMiddleware from 'react-router/lib/applyRouterMiddleware';
// import Router from 'react-router/lib/Router';
// import useRouterHistory from 'react-router/lib/useRouterHistory';
// import useRelay from 'react-router-relay';

// import routes from './routes';

// const history = useRouterHistory(createHashHistory)({ queryKey: false });

// render(
//   <Router
//     history={history}
//     routes={routes}
//     render={applyRouterMiddleware(useRelay)}
//     environment={Relay.Store}
// 		/>,
//   document.getElementById("root")
// );

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