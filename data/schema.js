import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/constants';

import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLID,
	GraphQLInt,
	GraphQLString,
	GraphQLNonNull,
	GraphQLList
} from 'graphql';

import {
	connectionArgs,
	connectionDefinitions,
	connectionFromArray,
	connectionFromPromisedArray,
	cursorForObjectInConnection,
	fromGlobalId,
	globalIdField,
	mutationWithClientMutationId,
	nodeDefinitions,
	toGlobalId
} from 'graphql-relay';

import {
	getViewer,
	Viewer,
	newUser,
	User,
	getAllUsers,
	getUserById,
	getUserByCredentials,
	createUser,
	updateJwtTokenForUser,
	Quote,
	getQuoteById,
	getAllQuotes,
	getQuotesByAuthorId,
	createQuote
} from './bookshelf';

const { nodeInterface, nodeField } = nodeDefinitions(
	(globalId) => {
		const { type, id } = fromGlobalId(globalId);
		if (type === 'User') {
			return getUserById(id).then((user) => user);
		} else if (type === 'Quote') {
			return getQuoteById(id).then((quote) => quote);
		} else if (type === 'Viewer') {
			return getViewer();
		}
		return null;
	},
	(obj) => {
		if (obj instanceof User) {
			return userType;
		} else if (obj instanceof Quote) {
			return quoteType;
		} else if (obj instanceof Viewer) {
			return viewerType;
		}
		return null;
	}
);

const quoteType = new GraphQLObjectType({
	name: 'Quote',
	fields: () => ({
		id: globalIdField('Quote'),
		quoteId: {
			type: new GraphQLNonNull(GraphQLInt),
			resolve: (quote) => quote.id
		},
		text: {
			type: new GraphQLNonNull(GraphQLString),
			description: "quote text"
		},
		author_id: {
			type: new GraphQLNonNull(GraphQLInt),
			description: "quote author"
		},
		created_at: {
			type: GraphQLString,
			description: "created at"
		},
		updated_at: {
			type: GraphQLString,
			description: "updated at"
		},
		author: {
			type: new GraphQLNonNull(userType),
			resolve: ({ author_id }) =>
				getUserById(author_id).then((user) => user)
		}
	}),
	interfaces: [nodeInterface]
});

const {
	connectionType: quotesConnection,
	edgeType: quoteEdge
} = connectionDefinitions({
	name: 'Quote',
	nodeType: quoteType,
});

const userType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: globalIdField('User'),
		userId: {
			type: new GraphQLNonNull(GraphQLInt),
			resolve: (user) => user.id
		},
		email: {
			type: GraphQLString,
			description: "user email"
		},
		password: {
			type: GraphQLString,
			description: "user password"
		},
		remember_token: {
			type: GraphQLString,
			description: "remember token"
		},
		created_at: {
			type: GraphQLString,
			description: "created at"
		},
		updated_at: {
			type: GraphQLString,
			description: "updated at"
		},
		jwt_token: {
			type: GraphQLString,
			description: "jwt token"
		},
		quotes: {
      type: quotesConnection,
			args: connectionArgs,
      resolve: ({ id }, args) =>
				connectionFromPromisedArray(getQuotesByAuthorId(id), args)
    },
		quotesCount: {
			type: new GraphQLNonNull(GraphQLInt),
			resolve: ({ id }) => getQuotesByAuthorId(id)
				.then((quotes) => quotes.length)
		}
	}),
	interfaces: [nodeInterface]
});

const viewerType = new GraphQLObjectType({
	name: 'Viewer',
	fields: {
		id: globalIdField('Viewer'),
		userInSession: {
			type: userType,
			resolve: (viewer, args, request, { rootValue }) => {
				if (rootValue.user) {
					const { id } = rootValue.user;
					return getUserById(id).then((user) => user);
				}
				return newUser;
			}
		},
		userById: {
			type: userType,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLID)
				}
			},
			resolve: (viewer, { id }) =>
				getUserById(id).then((user) => user)
		}
	},
	interfaces: [nodeInterface]
});

const queryType = new GraphQLObjectType({
	name: 'Query',
	fields: {
		node: nodeField,
		viewer: {
			type: viewerType,
			resolve: () => getViewer()
		}
	}
});

const loginMutation = mutationWithClientMutationId({
	name: 'Login',
	inputFields: {
		email: {
			type: new GraphQLNonNull(GraphQLString)
		},
		password: {
			type: new GraphQLNonNull(GraphQLString)
		}
	},
	outputFields: {
		viewer: {
			type: viewerType,
			resolve: () => getViewer()
		},
		userInSession: {
			type: userType,
			resolve: (user) => user
		}
	},
	mutateAndGetPayload: ({ email, password }, request, { rootValue }) => {
		return getUserByCredentials(email, password)
			.then((user) => {
				if (!user) {
					return newUser;
				}

				user.jwt_token = jwt.sign({
					id: user.id,
					name: user.name,
					email: user.email
				}, JWT_SECRET);

				return updateJwtTokenForUser(user.id, user.jwt_token)
					.then((user) => {
						// MAIN HACK				
						rootValue.user = user;
						return user;
					});
			})
			.catch((error) => { throw error; });
	}
});

function getCursor(dataList, item) {
	for (const i of dataList) {
		if (i.id.toString() === item.id.toString()) {
			return cursorForObjectInConnection(dataList, i);
		}
	}
}

const createQuoteMutation = mutationWithClientMutationId({
	name: 'CreateQuote',
	inputFields: {
		text: {
			type: new GraphQLNonNull(GraphQLString)
		},
		author_id: {
			type: new GraphQLNonNull(GraphQLID)
		}
	},
	outputFields: {
		quoteEdge: {
			type: quoteEdge,
			resolve: ({ id }) => getQuoteById(id).then((quote) =>
				getQuotesByAuthorId(quote.id).then((quotes) => {
					return {
						cursor: getCursor(quotes, quote),
						node: quote
					};
			}))
		},
		viewer: {
			type: viewerType,
			resolve: () => getViewer()
		}
	},
	mutateAndGetPayload: ({ text, author_id}) =>
		createQuote(text, author_id)
});

const mutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		loginUser: loginMutation,
		createQuote: createQuoteMutation
	}
});

export default new GraphQLSchema({
	query: queryType,
	mutation: mutationType
});