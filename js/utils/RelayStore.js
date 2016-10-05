import Relay from 'react-relay';

const query = Relay.createQuery(Relay.QL`query {
		viewer {
			userInSession {
				jwt_token
			}
		}
	}`, { var: 'value' });

function isLoggedIn() {
	const storegeToken = localStorage.getItem('jwt_token');
	if (storegeToken) {
		Relay.injectNetworkLayer(
				new Relay.DefaultNetworkLayer("/graphql", {
					headers: {
						Authorization: 'Bearer ' + storegeToken
					}
				})
			);
	}
	return new Promise((resolve, reject) => {
		Relay.Store.primeCache({ query }, ({ done, error }) => {
			if (done) {
				const data = Relay.Store.readQuery(query)[0];
				resolve(data.userInSession.jwt_token);
			} else if (error) {
				reject(error);
			}
		});
	});
}

export default {
	isLoggedIn: isLoggedIn
};