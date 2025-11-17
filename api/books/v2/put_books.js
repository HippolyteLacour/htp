// ...existing code...
const db_books = require("../../../proxy/db_books");
const hateoas = require("../../../utils/hateoas");

module.exports = async function(req, res) {
    const id = parseInt(req.params.id, 10);
    const { title, author } = req.body;
    try {
        await db_books.putById(id, title, author);

        const book = { id, title, author };
        book._links = hateoas.generateBookLinks(req, 'v1', 'books', 'book', id);

        return res.json({
            message: "Livre modifié avec succès.",
            book,
            _links: hateoas.generateBookLinks(req, 'v1', 'books')
        });
    } catch (error) {
        return res.status(400).json("Erreur lors de la modification du livre.");
    }
}