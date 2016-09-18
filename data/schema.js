import {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLInt,
	GraphQLString,
	GraphQLNonNull,
	GraphQLList
} from 'graphql';

import {
	connectionArgs,
	connectionDefinitions,
	connectionFromArray,
	cursorForObjectInConnection,
	fromGlobalId,
	globalIdField,
	mutationWithClientMutationId,
	nodeDefinitions,
	toGlobalId
} from 'graphql-relay';

import {
	User,
	Viewer,
	getViewer,
	getAllUsers,
	getUserById,
	createUser,
	getAdminUser
} from './bookshelf';

const { nodeInterface, nodeField } = nodeDefinitions(
	(globalId) => {
		console.log("globalId", globalId);
		const { type, id } = fromGlobalId(globalId);
		console.log("type", type);
		console.log("id", id);
		if (type === 'User') {
			return getUserById(id).then((user) => user);
		} else if (type === 'Viewer') {
			return getViewer();
		}
		return null;
	},
	(obj) => {
		if (obj instanceof User) {
			return userType;
		} else if (obj instanceof Viewer) {
			return viewerType;
		}
		return null;
	}
);

const userType = new GraphQLObjectType({
	name: 'User',
	fields: () => ({
		id: globalIdField('User'),
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
		}
	}),
	interfaces: [nodeInterface]
});

const {
	connectionType: usersConnection,
	edgeType: userEdge
} = connectionDefinitions({
	name: 'User',
	nodeType: userType,
});

const viewerType = new GraphQLObjectType({
	name: 'Viewer',
	fields: {
		id: globalIdField('Viewer'),
		users: {
			type: usersConnection,
			args: connectionArgs,
			resolve: (viewer, args) =>
				getAllUsers().then((users) => connectionFromArray(users, args))
		},
		totalCount: {
			type: GraphQLInt,
			resolve: () => getAllUsers().then(users => users.length)
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

function getCursor(dataList, item) {
	for (const i of dataList) {
		if (i.id.toString() === item.id.toString()) {
			return cursorForObjectInConnection(dataList, i);
		}
	}
}

const createUserMutation = mutationWithClientMutationId({
	name: 'CreateUser',
	inputFields: {
		email: {
			type: new GraphQLNonNull(GraphQLString)
		},
		password: {
			type: new GraphQLNonNull(GraphQLString)
		},
		remember_token: {
			type: GraphQLString
		}
	},
	outputFields: {
		userEdge: {
			type: userEdge,
			resolve: ({ id }) => getUserById(id).then((user) => getAllUsers().then((users) => {
				return {
					cursor: getCursor(users, user),
					node: user
				};
			})
			)
		},
		viewer: {
			type: viewerType,
			resolve: () => getViewer()
		}
	},
	mutateAndGetPayload: (user) => createUser(user)
});

const mutationType = new GraphQLObjectType({
	name: 'Mutation',
	fields: {
		createUser: createUserMutation
	}
});

export default new GraphQLSchema({
	query: queryType,
	mutation: mutationType
});