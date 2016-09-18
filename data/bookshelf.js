import knex from 'knex';
import bookshelf from 'bookshelf';
import moment from 'moment';

const dbConfig = {
	client: 'mysql',
	connection: {
		host: '127.0.0.1',
		user: 'root',
		password: '',
		database: 'test',
		charset: 'utf8'
	}
};

const db = bookshelf(knex(dbConfig));

export { db };

export class User extends db.Model {
	get tableName() {
		return 'users';
	}
}

export function getAdminUser() {
	const viewer = new User();
}

export function getUserById(id) {
	return User.forge({ id })
		.fetch()
		.then(user => user && user.toJSON())
		.catch((error) => { throw error; });
}

export function getAllUsers() {
	return User.forge()
		.fetchAll()
		.then(users => users && users.toJSON())
		.catch((error) => { throw error; });
}

export function createUser(relayUser) {
	const userToSave = {
		email: relayUser.email,
		password: relayUser.password,
		remember_token: relayUser.remember_token,
		created_at: moment().format("YYYY-MM-DD")
	};

	return User.forge(userToSave)
		.save()
		.then(user => user && user.toJSON())
		.catch((error) => { throw error; });
}


// ------- Admin stuff -------
export class Viewer {
	constructor() {
		this.id = 1;
	}
}

const viewer = new Viewer();

export function getViewer() {
	return viewer;
}