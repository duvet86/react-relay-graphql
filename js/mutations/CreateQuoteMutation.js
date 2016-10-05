import Relay from 'react-relay';
import moment from 'moment';

export default class CreateQuoteMutation extends Relay.Mutation {

  static fragments = {
    viewer: () => Relay.QL`
      fragment on User {
        id
				quotesCount
      }
    `
  };

  getMutation() {
    return Relay.QL`mutation{CreateQuote}`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateQuotePayload {
        quoteEdge
        viewer {
          userInSession
        }
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'RANGE_ADD',
      parentName: 'userInSession',
      parentID: this.props.userInSession.id,
      connectionName: 'quotes',
      edgeName: 'quoteEdge',
      rangeBehaviors: {
        '': 'append'
      }
    }];
  }

	// inputs to the mutation	
  getVariables() {
    return {
      userId: this.props.userInSession.userId,
			text: this.props.text
    };
  }

  getOptimisticResponse() {
    return {
      quoteEdge: {
        node: {
          text: this.props.text,
          created_at: moment().format("YYYY-MM-DD")
        }
      },
      viewer: {
        id: this.props.viewer.id,
				userInSession: {
					quotesCount: this.props.userInSession.quotesCount + 1
				}
      }
    };
  }

}