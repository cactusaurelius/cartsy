"use strict";

const _ = require('lodash')
const ApiGateway = require("moleculer-web");
const { UnAuthorizedError } = ApiGateway.Errors;


module.exports = {
    name: "api",
	mixins: [ApiGateway],

	settings: {
		port: process.env.API_PORT || 5004,

        routes: [{
            aliases: {

                // create
                "POST /users/create": "users.create",

                // Login
                "POST /users/login": "users.login",

				// Current user
				"GET /user": "users.me",
				"GET /user/cart": "users.cart",

                // Products
                "GET /products": "products.list",
                
                "GET /products/:id": "products.get",
                
                "POST /products/:product/cart": "products.cart",
                
				"POST /carts/uncart/:id": "products.uncart",

            },
            authorization: true
        }],

        // onError(req, res, err) {
        //     res.setHeader("Content-Type", "text/plain");
        //     res.writeHead(501);
        //     res.end("Global error: " + err.message);
        // }
    },
    methods: {
		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		authorize(ctx, route, req) {
			let token;
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0];
				if (type === "Token" || type === "Bearer")
					token = req.headers.authorization.split(" ")[1];
			}

			return this.Promise.resolve(token)
				.then(token => {
					if (token) {
						// Verify JWT token
						return ctx.call("users.resolveToken", { token })
							.then(user => {
								if (user) {
									this.logger.info("Authenticated via JWT: ", user.username);
									// Reduce user fields (it will be transferred to other nodes)
                                    ctx.meta.user = user._source;
                                    ctx.meta.user._id = user._id;
                                    
									ctx.meta.token = token;
								}
								return user;
							})
							.catch(err => {
								// Ignored
								return null;
							});
					}
				})
				.then(user => {
					if (req.$endpoint.action.auth == "required" && !user)
						return this.Promise.reject(new UnAuthorizedError());
				});
		},
    }
    }

