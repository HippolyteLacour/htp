const db_books = require("../../../proxy/db_books");
const hateoas = require("../../../utils/hateoas");

module.exports = async function(req,res) {
    const id = parseInt(req.params.id);
     try {
        const book = await db_books.getById(id);
        book._links = hateoas.generateBookLinks(req, book);
        return res.json(book);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }

}