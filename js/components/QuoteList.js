import React from 'react';
import Relay, { createContainer } from 'react-relay';

import { FormattedDate } from 'react-intl';

const QuoteList = (props) => {

	const { viewer } = props;

	function quoteItem({ node }) {
		return <li key={node.id}>{node.text} - <FormattedDate value={new Date(node.created_at) } /></li>;
	}

	return <ul>{viewer.users.edges.map(quoteItem) }</ul>;
};

QuoteList.propTypes = {
	viewer: React.PropTypes.object.isRequired
};

export default createContainer(QuoteList, {
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