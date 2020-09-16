"use strict";

const _ = require('lodash')
const { MoleculerClientError } = require("moleculer").Errors;
var es_client = require('../elasticsearch')

//const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


module.exports = {
	name: "users",
	/**
	 * Default settings
	 */
	settings: {
		// /** Secret for JWT */
		JWT_SECRET: process.env.JWT_SECRET || "cartsy-app",

		/** Public fields */
		fields: ["_id", "username", "email"],
	},
	
	/**
	 * Actions
	 */
	actions: {
			/**
			 * Register a new user
			 * 
			 * @actions
			 * @param {Object} user - User entity
			 * 
			 * @returns {Object} Created entity & token
			 */
			create: {
				params: { //https://github.com/icebob/fastest-validator
					user: {
						$$type: "object",
						username: { type: "string", min: 2, pattern: /^[a-zA-Z0-9]+$/ },
						password: { type: "string", min: 6 },
						email: { type: "email" }
					}
				},
				
				handler(ctx) {
					let entity = ctx.params.user;
					return this.Promise.resolve()
						.then(() => {
							if (entity.email)
								return this.userQuery(entity.email)
								.then(doc => {
									if (doc)
										return Promise.reject(new MoleculerClientError("Email already registered!", 422, "", [{ field: "email", message: "exists"}]));
									
								});
						})
						.then(() => {
							entity.password = bcrypt.hashSync(entity.password, 10);
							// entity.password = entity.password;
							entity.createdAt = new Date();

							return es_client.index(
								{	
									index: 'users',
									type: 'user',
									body: entity 
								})
								// .then(user => this.transformEntity(user, true, ctx.meta.token))					
							}
						);
				}
			},

		/**
		 * Login with username & password
		 * 
		 * @actions
		 * @param {Object} user - User credentials
		 * 
		 * @returns {Object} Logged in user with token
		 */
		login: {
			params: { //https://github.com/icebob/fastest-validator
				user: {
					$$type: "object",
					email: { type: "email" },
					password: { type: "string", min: 6 }
				}
			},
			handler(ctx) {
				const { email, password } = ctx.params.user;

				return this.Promise.resolve()
					.then(() => this.userQuery(email))
					.then(user => {
						if (!user)
							return this.Promise.reject(new MoleculerClientError("Email or password is invalid!", 422, "", [{ field: "email", message: "is not found"}]));

						return bcrypt.compare(password, user._source.password).then(res => {
							if (!res)
							if (user.password ==password)
								return Promise.reject(new MoleculerClientError("Wrong password!", 422, "", [{ field: "email", message: "is not found"}]));
							
							// Transform user entity (remove password and all protected fields)
							// return this.transformDocuments(ctx, {}, user);
							return user
						});
					})
					.then(user => this.transformEntity(user, true, ctx.meta.token));
			}
		},

		/**
		 * Get user by JWT token (for API GW authentication)
		 * 
		 * @actions
		 * @param {String} token - JWT token
		 * 
		 * @returns {Object} Resolved user
		 */
		resolveToken: {
			cache: {
				keys: ["token"],
				ttl: 60 * 60 // 1 day
			},			
			params: {
				token: "string"
			},
			handler(ctx) {
				return new this.Promise((resolve, reject) => {
					jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
						if (err)
							return reject(err);

						resolve(decoded);
					});
					// this.logger.info(`{
					// 	"user": {
					// 		"username": "abdozak",
					// 		"password": "123456789",
					// 		"email": "abdo.zak.ams@gmail.com"
					// 	}
					// }`)
				})
					.then(decoded => {
						if (decoded.id)
							return this.getById(decoded.id);
					});
			}
		},

		/**
		 * Get current user entity.
		 * Auth is required!
		 * 
		 * @actions
		 * 
		 * @returns {Object} User entity
		 */
		me: {
			auth: "required",
			cache: {
				keys: ["#token"]
			},
			handler(ctx) {
				// return this.Promise.resolve().then(() => ctx.params.user.password)
				// return "got to users.me"
				// return ctx.meta
				return this.getById(ctx.meta.user._id)
					.then(user => {
						if (!user)
							return this.Promise.reject(new MoleculerClientError("User not found!", 400));

						return user;
					})
					.then(user => this.transformEntity(user, true, ctx.meta.token));
			}
		},
				
		/**
		 * Get current user entity.
		 * Auth is required!
		 * 
		 * @actions
		 * 
		 * @returns {Object} User entity
		 */
		cart: { //
			auth: "required",
			handler(ctx) {
				// return this.Promise.resolve(ctx.meta.user._id)
				return ctx.call("carts.get", { user: ctx.meta.user._id })
				// .then(product => {
				// 	if (!product)
				// 		return this.Promise.reject(new MoleculerClientError("Product not found", 404));
						
				// 	// return ctx.call("carts.add", { product: product, user: ctx.meta.user._id.toString() });
				// })
			}
		},
	},

	methods: {
		/**
		 * Generate a JWT token from user
		 * 
		 * @param {Object} user 
		 */
		generateJWT(doc) {
			const today = new Date();
			const exp = new Date(today);
			exp.setDate(today.getDate() + 60);

			return jwt.sign({
				id: doc._id,
				email: doc._source.email,
				exp: Math.floor(exp.getTime() / 1000)
			}, this.settings.JWT_SECRET);
		},

		/**
		 * Transform returned user entity. Generate JWT token if neccessary.
		 * 
		 * @param {Object} user 
		 * @param {Boolean} withToken 
		 */
		transformEntity(doc, withToken, token) {
			let user = doc._source;
			if (doc && withToken)
				user.token = token || this.generateJWT(doc);
				user = _.pick(user, ["username", "email", "token"]);
			return { user };
		},

		/**
		 * Query elasticsearch for user with email.
		 * 
		 * @param {String} email 
		 */
		userQuery(email) {
			return es_client.search({
				index: "users",
				body: {
					query: {
						"match_phrase_prefix":{"email": email}
					}
				},
			})
			.then((doc) => {
				return doc.hits.hits[0]
			})
		},

		getById(id){
			return es_client.get({
				index: 'users',
				id: id
			  })
		}
		
	},
	
	
};