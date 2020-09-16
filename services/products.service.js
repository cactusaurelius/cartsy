"use strict";

const { MoleculerClientError } = require("moleculer").Errors;
var es_client = require('../elasticsearch')


module.exports = {
    name: "products",

	/**
	 * Actions
	 */
	actions: {

		/**
		 * Create a new product.
		 * Auth is required!
		 * 
		 * @actions
		 * @param {Object} product - product entity
		 * 
		 * @returns {Object} Created entity
		 */
		create: {
			auth: "required",
			params: {
				product: { type: "object" }
			},
			handler(ctx) {
				let entity = ctx.params.article;
				return this.validateEntity(entity)
					.then(() => {

						entity.slug = slug(entity.title, { lower: true }) + "-" + (Math.random() * Math.pow(36, 6) | 0).toString(36);
						entity.author = ctx.meta.user._id.toString();
						entity.createdAt = new Date();
						entity.updatedAt = new Date();

						return this.adapter.insert(entity)
							.then(doc => this.transformDocuments(ctx, { populate: ["author", "favorited", "favoritesCount"]}, doc))
							.then(entity => this.transformResult(ctx, entity, ctx.meta.user))
							.then(json => this.entityChanged("created", json, ctx).then(() => json));
					});
			}
        },

		/**
		 * Get an article by slug
		 * 
		 * @actions
		 * @param {String} id - Article slug
		 * 
		 * @returns {Object} Article entity
		 */
		get: {
			cache: {
				keys: ["#token", "id"]
			},
			params: {
				id: { type: "string" }
			},
			handler(ctx) {
				return this.getById(ctx.params.id)
					.then(entity => {
						if (!entity)
							return this.Promise.reject(new MoleculerClientError("Product not found!", 404));

						return entity;
					})
			}
        },	
        
		/**
		 * Auth is required!
		 * 
		 * @actions
		 * @param {String} id - Product slug
		 * 
		 * @returns {Object} Updated article
		 */
		cart: {
			auth: "required",
			params: {
				product: { type: "string" }
			},
			handler(ctx) {
				return this.Promise.resolve(ctx.params.product)
					// .then(product => this.getById(product))
					.then(product => {
						if (!product)
							return this.Promise.reject(new MoleculerClientError("Product not found", 404));
							
						return ctx.call("carts.add", { product: product, user: ctx.meta.user._id.toString() });
					})
			}
		},
    },

	/**
	 * Methods
	 */
    methods: {
		getById(id){
			return es_client.get({
				index: 'products',
				id: id
			  })
		}
    }

}