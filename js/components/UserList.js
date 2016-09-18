import React from 'react';
import Relay, { createContainer } from 'react-relay';

import { FormattedDate } from 'react-intl';

const UserList = (props) => {

	const { viewer } = props;

	function createUserItem({ node }) {
		return <li key={node.id}>{node.email} - <FormattedDate value={new Date(node.created_at) } /></li>;
	}

	return <ul>{viewer.users.edges.map(createUserItem) }</ul>;
};

UserList.propTypes = {
	viewer: React.PropTypes.object.isRequired
};

export default createContainer(UserList, {
	initialVariables: {
		limit: 100
	},
	fragments: {
		viewer: () => Relay.QL`
			fragment on Viewer {
				totalCount
				users(first: $limit) {
					edges {
						node {
							id
							email
							created_at
						}
					}
				}
			}
		`
	}
});