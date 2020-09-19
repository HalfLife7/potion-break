const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class GameMovie extends Model {
    static get tableName() {
        return 'game_movies'
    }

    static get idColumn() {
        return ['game_id', 'id']
    }

    static get relationMappings() {
        const Game = require('./game')
        return {
            game: {
                relation: Model.BelongsToOneRelation,
                modelClass: Game,
                join: {
                    from: 'game_movies.game_id',
                    to: 'games.id',
                },
            },
        }
    }
}

module.exports = GameMovie
