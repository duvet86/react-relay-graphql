import React, { Component } from 'react';
import Relay, { createContainer } from 'react-relay';

import CreateUserMutation from '../mutations/CreateUserMutation';

import UserList from './UserList';
import UserForm from './UserForm';

class App extends Component {

  handleCreateUser = (user) => {
    Relay.Store.commitUpdate(new CreateUserMutation({
      user,
      viewer: this.props.viewer
    }));
  }

  render() {

    const { viewer } = this.props;

    return (
      <div>
        <h1>User</h1>
        <UserList viewer={viewer} />
        <UserForm onSave={this.handleCreateUser} />
      </div>
    );
  }
}

export default createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${UserList.getFragment('viewer')}
        ${CreateUserMutation.getFragment('viewer')}
      }
    `
  }
});