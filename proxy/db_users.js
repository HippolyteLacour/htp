const users = require("./../mockDB/users");
const { hashPassword, verifyPassword } = require("../utils/auth");
 
module.exports = {
    getAll: async (idUser) => {
        const actualUser = users.find((u) => u.id === idUser);
        console.log("actualUser", actualUser);
        if(actualUser.admin !== true){
            throw "Access denied";
        }
        return users;
    },
 
    getById: async (id, idUser) => {
        const actualUser = users.find((u) => u.id === idUser);
        console.log("actualUser", actualUser);

        if(actualUser.admin !== true){
            console.log("Access denied");
            throw "Access denied";
        }

        
        const user = users.find((u) => u.id === id);
        if (!user) {
            throw "User not found";
        }
        console.log("user", user);
        return user;
    },
 
    signin: async (username, password) => {


        if (!username) {
            throw "username and password are required";
        }
 
        // find by username / name / email
        const user = users.find(
            (u) => u.username === username || u.name === username
        );
 
        if (!user) {
            throw "User Does not exist";
        }
 
        // If stored as hashed (passwordHash + passwordSalt), verify
        if (user.passwordHash && user.passwordSalt) {
            const ok = verifyPassword(password, user.passwordHash, user.passwordSalt);
            if (!ok) throw "Password incorrect";
            return user;
        }
 
        // Fallback: if stored as plain password, compare and migrate to hashed storage
        if (user.password) {
            if (user.password !== password) throw "Password incorrect";
 
            // migrate: hash and replace plain password
            const { salt, hash } = hashPassword(password);
            delete user.password;
            user.passwordHash = hash;
            user.passwordSalt = salt;
            return user;
        }
 
        // No usable credential stored
        throw "Invalid credentials";
    },
 
    signup: async (username, password) => {
        if (!username || !password) {
            throw "username and password are required";
        }
 
        // check for existing user
        const existing = users.find((u) => u.username === username || u.name === username || u.email === username);
        if (existing) {
            throw "User already exists";
        }
 
        const { salt, hash } = hashPassword(password);
 
        const newUser = {
            id: users.length ? users[users.length - 1].id + 1 : 1,
            username: username,
            passwordHash: hash,
            passwordSalt: salt,
            admin: false,
        };
 
        users.push(newUser);
        return newUser;
    },
};
 