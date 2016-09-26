import React, { Component, PropTypes } from 'react';
import Relay, { createContainer } from 'react-relay';

import LoginMutation from '../mutations/LoginMutation';
import LoginForm from './LoginForm';

class App extends Component {

	static propTypes = {
    viewer: PropTypes.object.isRequired,
    //relay: PropTypes.object.isRequired
  };

  handleLoginForm = (credentials) => {

		const { viewer } = this.props;

		const onSuccess = ({ loginUser }) => {
			const token = loginUser.viewer.user.jwt_token;
			localStorage.setItem('jwt_token', token);
			Relay.injectNetworkLayer(
				new Relay.DefaultNetworkLayer("/graphql", {
					headers: {
						Authorization: 'Bearer ' + token
					}
				})
			);
		};
		const onFailure = (transaction) => {
			var error = transaction.getError() || new Error('Mutation failed.');
			console.error(error);
		};
    Relay.Store.commitUpdate(new LoginMutation({
			credentials,
			viewer,
			user: viewer.user
		}), { onFailure, onSuccess });
  }

  render() {
    const { viewer } = this.props;
		console.log("APP.viewer", viewer);
    return (
      <div>
        <h1>Email: {viewer.user.email}</h1>
        <LoginForm onSave={this.handleLoginForm} />
      </div>
    );
  }
}

export default createContainer(App, {
  fragments: {
		viewer: () => Relay.QL`
      fragment on Viewer {
				${LoginMutation.getFragment('viewer')}
				user {
					email
					jwt_token
					${LoginMutation.getFragment('user')}
				}
      }
    `
  }
});