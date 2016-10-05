import 'babel-polyfill';

import React from 'react';
import { render } from 'react-dom';
//import createHashHistory from 'history/lib/createHashHistory';
import Relay from 'react-relay';
import applyRouterMiddleware from 'react-router/lib/applyRouterMiddleware';
import Router from 'react-router/lib/Router';
import browserHistory from 'react-router/lib/browserHistory';
import useRelay from 'react-router-relay';
import { IntlProvider } from 'react-intl';

import routes from './routes';

render(
	<IntlProvider locale="en">
		<Router
			history={browserHistory}
			routes={routes}
			render={applyRouterMiddleware(useRelay)}
			environment={Relay.Store}
			/>
		</IntlProvider>,
  document.getElementById("root")
);