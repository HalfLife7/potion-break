const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class PotionBreak extends Model {
    static get tableName() {
        return 'potion_breaks'
    }

    static get relationMappings() {
        const User = require('./user')
        const Game = require('./game')
        const Charity = require('./pocharitytionBreak')
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: Game,
                join: {
                    from: 'potion_breaks.user_id',
                    to: 'users.id',
                },
            },
            game: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'potion_breaks.game_id',
                    to: 'games.id',
                },
            },
            charity: {
                relation: Model.BelongsToOneRelation,
                modelClass: Charity,
                join: {
                    from: 'potion_breaks.charity_id',
                    to: 'charity.id',
                },
            },
        }
    }
}

module.exports = PotionBreak
