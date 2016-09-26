import express from 'express';
import graphQLHTTP from 'express-graphql';
import jwt from 'express-jwt';
import {
	APP_PORT,
	GRAPHQL_PORT,
	JWT_SECRET
} from './utils/constants';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import chokidar from 'chokidar';
import path from 'path';
import { clean } from 'require-clean';
import { exec } from 'child_process';

let graphQLServer;
let appServer;

function startAppServer(callback) {
  // Serve the Relay app
  const compiler = webpack({
    entry: path.resolve(__dirname, 'js', 'root.js'),
    module: {
      loaders: [
        {
          exclude: /node_modules/,
          loader: 'babel',
          test: /\.js$/
        }
      ]
    },
    output: { filename: '/root.js', path: '/', publicPath: '/js/' }
  });

  appServer = new WebpackDevServer(compiler, {
    contentBase: '/public/',
    proxy: { '/graphql': `http://localhost:${GRAPHQL_PORT}` },
    publicPath: '/js/',
    stats: 'errors-only'
  });

  // Serve static resources
  appServer.use('/', express.static(path.resolve(__dirname, 'public')));
  appServer.listen(APP_PORT, () => {
    console.log(`App is now running on http://localhost:${APP_PORT}`);
    if (callback) {
      callback();
    }
  });
}

function startGraphQLServer(callback) {
  // Expose a GraphQL endpoint
  clean('./data/schema');

  const schema = require('./data/schema').default;
  const graphQLApp = express();

	const authenticate = jwt({
		secret: JWT_SECRET,
		credentialsRequired: false,
		userProperty: 'user'
	});

	graphQLApp.use('/', authenticate, (req, res, next) => {
		console.log("SERVER.user", req.user);
		const options = {
			rootValue: {
				user: req.user
			},
			graphiql: true,
			pretty: true,
			schema
		};

		return graphQLHTTP(req => options)(req, res, next);
	});

	graphQLServer = graphQLApp.listen(GRAPHQL_PORT, () => {
		console.log(
			`GraphQL server is now running on http://localhost:${GRAPHQL_PORT}`
		);
		if (callback) {
			callback();
		}
	});
}

function startServers(callback) {
  // Shut down the servers
  if (appServer) {
    appServer.listeningApp.close();
  }
  if (graphQLServer) {
    graphQLServer.close();
  }

  // Compile the schema
  exec('npm run update-schema', (error, stdout) => {
    console.log(stdout);
    let doneTasks = 0;
    function handleTaskDone() {
      doneTasks++;
      if (doneTasks === 2 && callback) {
        callback();
      }
    }
    startGraphQLServer(handleTaskDone);
    startAppServer(handleTaskDone);
  });
}

chokidar.watch('./data/{bookshelf,schema}.js')
  .on('change', path => {
    console.log(`\`${path}\` changed. Restarting.`);
    startServers(() =>
      console.log('Restart your browser to use the updated schema.')
    );
  });

startServers();