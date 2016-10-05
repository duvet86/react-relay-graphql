import React, { Component, PropTypes } from 'react';
import Relay, { createContainer } from 'react-relay';
import { withRouter } from 'react-router';

import LoginMutation from '../mutations/LoginMutation';

class LoginForm extends Component {

	static propTypes = {
		location: PropTypes.object,
		router: React.PropTypes.shape({
			replace: React.PropTypes.func.isRequired
		}).isRequired,
		viewer: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired
	}

	constructor(props) {
		super(props);
		this.state = {
			email: "Luca",
			password: "Luca",
			remember_token: "Luca"
		};
	}

	handleEmailChange = (event) => {
		this.setState({ email: event.target.value });
	}

	handlePasswordChange = (event) => {
		this.setState({ password: event.target.value });
	}

	handlerememberTokenChange = (event) => {
		this.setState({ remember_token: event.target.value });
	}

	handleSubmit = (event) => {
		event.preventDefault();

		const email = this.state.email.trim();
		const password = this.state.password.trim();
		const remember_token = this.state.remember_token.trim();
		if (!email || !password || !remember_token) {
			return;
		}

		const {
			viewer,
			relay,
			location
		} = this.props;

		const onSuccess = ({ loginUser }) => {
			const token = loginUser.userInSession.jwt_token;
			localStorage.setItem('jwt_token', token);
			Relay.injectNetworkLayer(
				new Relay.DefaultNetworkLayer("/graphql", {
					headers: {
						Authorization: 'Bearer ' + token
					}
				})
			);
			if (location.state && location.state.nextPathname) {
				this.props.router.replace(location.state.nextPathname);
			} else {
				this.props.router.replace('/');
			}
		};
		const onFailure = (transaction) => {
			var error = transaction.getError() || new Error('Mutation failed.');
			console.error(error);
		};

		const credentials = {
			email,
			password
		};

    relay.commitUpdate(new LoginMutation({
			credentials,
			viewer,
			user: viewer.userInSession
		}), { onFailure, onSuccess });

		// this.setState({
		// 	email: "",
		// 	password: "",
		// 	remember_token: ""
		// });
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<div>Email: </div>
				<input type="text" name="email" value={this.state.email} onChange={this.handleEmailChange} />
				<div>Password: </div>
				<input type="text" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
				<div>Remeber Token: </div>
				<input type="text" name="remember_token" value={this.state.remember_token} onChange={this.handlerememberTokenChange} />
				<input type="submit" value="Post" />
			</form>
		);
	}
}

export default createContainer(withRouter(LoginForm), {
  fragments: {
		viewer: () => Relay.QL`
      fragment on Viewer {
				${LoginMutation.getFragment('viewer')}
				userInSession {
					jwt_token
					${LoginMutation.getFragment('user')}
				}
      }
    `
  }
});