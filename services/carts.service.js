"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
var es_client = require('../elasticsearch')

module.exports = {
	name: "carts",

	/**
	 * Default settings
	 */
	settings: {

	},

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Get an cart by id
		 * 
		 * @actions
		 * @param {String} id - Article slug
		 * 
		 * @returns {Object} Article entity
		 */
		get: {
			// cache: {
			// 	keys: ["#token", "id"]
			// },
			params: {
				user: { type: "string" }
			},
			handler(ctx) {
				return this.getById(ctx.params.user)
					.then(entity => {
						if (!entity)
							return this.Promise.reject(new MoleculerClientError("Product not found!", 404));

						return entity;
					})
			}
        },	
        
		/**
		 * Create a new favorite record
		 * 
		 * @actions
		 * 
		 * @param {String} product - Article ID
		 * @param {String} user - User ID
		 * @returns {Object} Created favorite record
		 */		
		add: {
			params: {
				product : { type: "string" },
				user: { type: "string" },
			},
			handler(ctx) {
				const { product , user } = ctx.params;
				return this.addCreate(user, product)
					// .then(item => {
					// 	if (item)
					// 		return this.Promise.reject(new MoleculerClientError("Articles has already favorited"));

                    //     return this.addCreate(user, product)
					// });
			}
		},
    },

    
    methods: {
        addCreate(user, product){
            return es_client.update(
                {	
                    index: 'carts',
                    id: user,
                    body: {
                        script: `ctx._source.products.${product} += 1`,
                        upsert:{
                            products: {
                                [product]: 1
                            }
                        }
                    },
                })
        },

		getById(id){
			return es_client.get({
				index: 'carts',
				id: id
			  })
		}
    }
}