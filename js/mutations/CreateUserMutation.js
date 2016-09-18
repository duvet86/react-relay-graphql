import Relay from 'react-relay';
import moment from 'moment';

export default class CreateUserMutation extends Relay.Mutation {

  // we only need to request the id to perform this mutation
  static fragments = {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        totalCount
      }
    `
  };

  getMutation() {
    return Relay.QL`mutation{createUser}`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateUserPayload {
        userEdge
        viewer {
          totalCount
					users
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'viewer',
      parentID: this.props.viewer.id,
      connectionName: 'users',
      edgeName: 'userEdge',
      rangeBehaviors: {
        '': 'append'
      }
    }];
  }

  getVariables() {
    // inputs to the mutation
    return {
      email: this.props.user.email,
      password: this.props.user.password,
      remember_token: this.props.user.remember_token
    };
  }

  getOptimisticResponse() {
    return {
      // FIXME: totalCount gets updated optimistically, but this edge does not
      // get added until the server responds
      userEdge: {
        node: {
          email: this.props.user.email,
          created_at: moment().format("YYYY-MM-DD")
        }
      },
      viewer: {
        id: this.props.viewer.id,
        totalCount: this.props.viewer.totalCount + 1
      }
    };
  }

}