const db_users = require("../../proxy/db_users");
const hateoas = require("../../utils/hateoas");

module.exports = async function(req, res) {
    const id = parseInt(req.params.id);
    const idUser = parseInt(req.query.idUser);
    
    try {
        const user = await db_users.getById(id, idUser);
        user._links = hateoas.generateUserLinks(req, user);
        return res.json(user);
    } catch (error) {
        return res.status(400).json({ message: error });
    }

}