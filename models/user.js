const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class User extends Model {
    static get tableName() {
        return 'users'
    }

    static get relationMappings() {
        const UserGame = require('./userGame')
        const PotionBreak = require('./potionBreak')
        return {
            games: {
                relation: Model.HasManyRelation,
                modelClass: UserGame,
                join: {
                    from: 'users.id',
                    to: 'user_games.user_id',
                },
            },
            potionBreaks: {
                relation: Model.HasManyRelation,
                modelClass: PotionBreak,
                join: {
                    from: 'users.id',
                    to: 'potion_breaks.user_id',
                },
            },
        }
    }
}

module.exports = User
