import React, { Component, PropTypes } from 'react';

class UserForm extends Component {

	static propTypes = {
		onSave: PropTypes.func.isRequired
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

		this.props.onSave({ email, password, remember_token });

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

export default UserForm;