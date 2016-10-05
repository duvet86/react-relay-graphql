import React from 'react';
import Relay, { createContainer } from 'react-relay';

import { FormattedDate } from 'react-intl';

const QuoteList = (props) => {

	const { viewer } = props;
	console.log("QuoteList.viewer", viewer);
	const { userInSession } = viewer;

	function quoteItem({ node }) {
		return <li key={node.quoteId}>{node.text} - <FormattedDate value={new Date(node.created_at) } /></li>;
	}

	return (
		<div>
			<h1>Count: {userInSession.quotesCount}</h1>
			<ul>{userInSession.quotes.edges.map(quoteItem) }</ul>
		</div>
	);
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
				userInSession {
					quotesCount
					quotes(first: $limit) {
						edges {
							node {
								quoteId
								text
								created_at
							}
						}
					}
				}
			}
		`
	}

	// fragments: {
	// 	user: () => Relay.QL`
	// 		fragment on User {
	// 			quotes(first: $limit) {
	// 				edges {
	// 					node {
	// 						quoteId
	// 						text
	// 						created_at
	// 					}
	// 				}
	// 			}
	// 		}
	// 	`
});