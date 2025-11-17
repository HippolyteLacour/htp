const books = require("./../mockDB/books");

module.exports = {
    getAll : async (limit, page) => {
        const startIndex = (page - 1) * limit;
        console.log("Limit:", limit, "Page:", page, "StartIndex:", startIndex);
        return books.slice(startIndex, startIndex + limit);
    },

    getById : async (id) => {
        const book = books.find((b) => b.id === id);
        if(!book) {
            throw "Book not found";
        }   
        return book;
    },
    postById: async (title, author) => {
         const newBook = {
            id: books.length ? books[books.length - 1].id + 1 : 1,
            title,
            author,
        };

        if(!title || !author) {
            throw "Title and Author are required";
        }

        books.push(newBook);
        return newBook;
    },
    deleteById: async (id) => {
        const indexBook = books.findIndex((b) => b.id === id);
        if(indexBook === -1) {
            throw "Book not found";
        }   
        return books.splice(indexBook, 1);
    },

    putById : async (id, title, author) => {
        const bookIndex = books.findIndex((b) => b.id === id);
         if (bookIndex === -1) {
            throw "Book not found";
        }

        if (!title || !author) {
            throw "Title and Author are required";
        }

        books[bookIndex] = { id, title, author };
        return books[bookIndex];
    }  
    
}