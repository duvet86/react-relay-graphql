import React from 'react';
import Relay from 'react-relay';
import Route from 'react-router/lib/Route';
import ViewerQuery from './queries/ViewerQuery';
import App from './components/App';
import RelayStore from './utils/RelayStore';

function redirectToLogin(nextState, replace, next) {
	RelayStore.isLoggedIn().then((jwt_token) => {
		if (!jwt_token) {
			replace({
				pathname: '/login',
				state: { nextPathname: nextState.location.pathname }
			});
			next();
		} else {
			next();
		}
	});
}

function redirectToDashboard(nextState, replace) {
	RelayStore.isLoggedIn().then((jwt_token) => {
		if (jwt_token) {
			replace('/');
		}
	});
}

export default (
  <Route component={App}>
		<Route
			path="/login"
			onEnter={redirectToDashboard}
			getComponent={(nextState, cb) => {
				require.ensure([], (require) => {
					cb(null, require('./components/LoginForm').default);
				});
			} }
			queries={ViewerQuery}
			/>
		<Route
			path="/"
			onEnter={redirectToLogin}
			getComponent={(nextState, cb) => {
				require.ensure([], (require) => {
					cb(null, require('./components/QuoteList').default);
				});
			} }
			queries={ViewerQuery}
			/>
  </Route>
);