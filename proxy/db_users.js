const books = require("./../mockDB/users");

module.exports = {
    getAll : async (limit, page) => {
        const startIndex = (page - 1) * limit;
        return users.slice(startIndex, startIndex + limit);
    },

    getById : async (id) => {
        const user = users.find((b) => b.id === id);
        if(!user) {
            throw "User not found";
        }   
        return user;
    },
    signin: async (username, password) => {
        const newUser = {
            username,
            password
        };
        if(!username || !password) {
            throw "username and password are required";
        }
        users.getById(user);
        return newUser;
    },
    signup: async (username, password) => {
         const newUser = {
            id: users.length ? users[users.length - 1].id + 1 : 1,
            username: username,
            password, 
        };

        if(!username || !password) {
            throw "username and password are required";
        }

        users.push(newUser);
        return newUser;
    }
    
    
}