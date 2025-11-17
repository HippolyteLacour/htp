const db_books = require("../../../proxy/db_books");
const hateoas = require("../../../utils/hateoas");

module.exports = async function(req, res) {
    const id = parseInt(req.params.id);
    try {
        const deleteBook = await db_books.deleteById(id);
         return res.json({
            message: "Livre supprimé",
            deleteBook: deleteBook[0],
            _links: hateoas.generateBookLinks(req, 'v1', 'books')
        });
    } catch (error) {
        return res.status(404).json({ message: "Livre non trouvé" });
    }
}