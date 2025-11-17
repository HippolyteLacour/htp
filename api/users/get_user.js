const db_users = require("../../../proxy/db_users");

module.exports = async function(req,res) {
    const id = parseInt(req.params.id);
     try {
        const user = await db_users.getById(id);
        user._links = hateoas.generateUserLinks(req,user);
        return res.json(user);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

}