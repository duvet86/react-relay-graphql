import Relay from 'react-relay';

export default class LoginMutation extends Relay.Mutation {

  static fragments = {
		viewer: () => Relay.QL`
      fragment on Viewer {
        id
      }
    `,
    user: () => Relay.QL`
      fragment on User {
        id
      }
    `
  };

  getMutation() {
    return Relay.QL`mutation{loginUser}`;
  }

	getFatQuery() {
    return Relay.QL`
      fragment on LoginPayload {
				viewer {
					user
				}
				user {
					id
					userId
					email
					password
					remember_token
					created_at
					updated_at
					jwt_token
				}
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        viewer: this.props.viewer.id,
				user: this.props.user.id
      }
    }];
  }

  getVariables() {
    // inputs to the mutation
    return {
      email: this.props.credentials.email,
      password: this.props.credentials.password
    };
  }

  getOptimisticResponse() {
    return {
      viewer: {
        id: this.props.viewer.id,
				user: {
					id: this.props.user.id,
					email: this.props.credentials.email
				}
      },
			user: {
				email: this.props.credentials.email
			}
    };
  }

}