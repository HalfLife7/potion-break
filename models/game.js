const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class Game extends Model {
    static get tableName() {
        return 'games'
    }

    static get relationMappings() {
        const GameScreenshot = require('./gameScreenshot')
        const GameMovie = require('./gameMovie')
        const UserGame = require('./userGame')
        const PotionBreak = require('./potionBreak')
        return {
            screenshots: {
                relation: Model.HasManyRelation,
                modelClass: GameScreenshot,
                join: {
                    from: 'games.id',
                    to: 'game_screenshots.game_id',
                },
            },
            movies: {
                relation: Model.HasManyRelation,
                modelClass: GameMovie,
                join: {
                    from: 'games.id',
                    to: 'game_movies.game_id',
                },
            },
            userGames: {
                relation: Model.HasManyRelation,
                modelClass: UserGame,
                join: {
                    from: 'games.id',
                    to: 'user_games.game_id',
                },
            },
            potionBreaks: {
                relation: Model.HasManyRelation,
                modelClass: PotionBreak,
                join: {
                    from: 'games.id',
                    to: 'potion_breaks.game_id',
                },
            },
        }
    }
}

module.exports = Game
