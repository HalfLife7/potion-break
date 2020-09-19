const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class UserGame extends Model {
    static get tableName() {
        return 'user_games'
    }

    static get idColumn() {
        return ['user_id', 'game_id']
    }

    static get relationMappings() {
        const User = require('./user')
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'user_games.user_id',
                    to: 'users.id',
                },
            },
        }
    }
}

module.exports = UserGame
