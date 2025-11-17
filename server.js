const express = require("express");
const app = express();
const PORT = 3000;
const { default: rateLimit } = require("express-rate-limit");
const swaggerGenerate = require("./swagger/swagger-generate");
const { initRoutes } = require("./api/books/routes");
const cors = require('cors');


const corsOptions = {
  origin: 'http://localhost:3000', // remplacer par votre domaine autorisé
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204, // pour le preflight
};

app.use(cors(corsOptions));

app.use(express.json());


const limiters = {
    ONE_SEC : rateLimit({limit: 1, windowMs: 1000, message: "Please retry after 1 second"}),
    FIVE_SEC : rateLimit({limit: 1, windowMs: 5000, message: "Please retry after 5 seconds"})
}

initRoutes(app, limiters);

swaggerGenerate(app, limiters);


function errorHandler (err, req, res, next) {
  console.error(err.stack)
  res.send('Unhandled error occurred!' + err.message)
}

app.use(errorHandler);

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});


app.listen(PORT, () => {
  console.log(`📚 Serveur lancé sur http://localhost:${PORT}`);
});


/** 

let userCookieStore = {
    userId: timestamp
};

const timeBeteweenCalls = 1000; // 5 seconds
function request(session){
    const lastCall = userCookieStore[session.userId];

    if(lastCall && (Date.now() - lastCall < timeBeteweenCalls)){
        return false;
    }
    userCookieStore[session.userId] = Date.now();

}

*/
