const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class Charity extends Model {
    static get tableName() {
        return 'charities'
    }

    static get relationMappings() {
        const PotionBreak = require('./potionBreak')
        return {
            games: {
                relation: Model.HasManyRelation,
                modelClass: PotionBreak,
                join: {
                    from: 'charities.id',
                    to: 'potion_breaks.platform_id',
                },
            },
        }
    }
}

module.exports = Charity
