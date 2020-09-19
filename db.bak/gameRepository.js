class GameRepository {
    constructor(dao) {
        this.dao = dao;
    }

    createTable() {
        const sql = `
        CREATE TABLE 
        IF NOT EXISTS games (
            app_id INTEGER PRIMARY KEY, 
            name TEXT, img_icon_url TEXT, 
            img_logo_url TEXT, 
            header_image_url TEXT, 
            screenshot_1_url TEXT, 
            screenshot_2_url TEXT, 
            screenshot_3_url TEXT, 
            screenshot_4_url TEXT, 
            screenshot_5_url TEXT, 
            movie_1_webm_url TEXT, 
            movie_1_mp4_url TEXT, 
            last_updated TEXT)
        `
        return this.dao.run(sql);
    }
}

module.exports = GameRepository;