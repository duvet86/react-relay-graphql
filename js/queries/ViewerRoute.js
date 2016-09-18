import Relay, { Route } from 'react-relay';

export default class extends Route {
  static routeName = 'ViewerRoute';
  static queries = {
    viewer: () => Relay.QL`query { viewer }`
  };
}