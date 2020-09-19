const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class GameScreenshot extends Model {
    static get tableName() {
        return 'game_screenshots'
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
                    from: 'game_screenshots.game_id',
                    to: 'games.id',
                },
            },
        }
    }
}

module.exports = GameScreenshot
