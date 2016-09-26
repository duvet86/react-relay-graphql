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

// USERS
export const newUser = {
	id: 0,
	email: "",
	password: "",
	jwt: null
};

export class User extends db.Model {
	get tableName() {
		return 'users';
	}
}

export function getUserById(id) {
	return User.forge({ id })
		.fetch()
		.then(user => user && user.toJSON())
		.catch((error) => { throw error; });
}

export function getUserByCredentials(email, password) {
	return User.forge({ email, password })
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
	return User.forge({
			email: relayUser.email,
			password: relayUser.password,
			remember_token: relayUser.remember_token,
			created_at: moment().format("YYYY-MM-DD")
		})
		.save()
		.then(user => user && user.toJSON())
		.catch((error) => { throw error; });
}

export function updateJwtTokenForUser(id, jwt_token) {
	return User.forge({ id })
		.save({ jwt_token })
		.then(user => user && user.toJSON())
		.catch((error) => { throw error; });
}

// QUOTES
export class Quote extends db.Model {
	get tableName() {
		return 'quotes';
	}
}

export function getQuoteById(id) {
	return Quote.forge({ id })
		.fetch()
		.then(quote => quote && quote.toJSON())
		.catch((error) => { throw error; });
}

export function getQuotesByAuthorId(authorId) {
	return Quote.forge({ author_id: authorId })
		.fetch()
		.then(quote => quote && quote.toJSON())
		.catch((error) => { throw error; });
}

export function getAllQuotes() {
	return Quote.forge()
		.fetchAll()
		.then(quote => quote && quote.toJSON())
		.catch((error) => { throw error; });
}

export function createQuote(relayQuote) {
	return Quote.forge({
			text: relayQuote.email,
			author_id: relayQuote.viewerId,
			created_at: moment().format("YYYY-MM-DD")
		})
		.save()
		.then(quote => quote && quote.toJSON())
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
