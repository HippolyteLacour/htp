

const requireWriteAccess = require("../../middleware/middleware");

function createBookRoutes(limiters) {
    return {
        'signin': {
            method : 'POST',
            versions : [
                
                {
                    limiters: limiters.ONE_SEC,
                    routeCall : require ('./post_signin')
                },
                
            ],
        },

        'signup': {
            method: 'POST',
            versions: [
                {
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./post_signup')
                },
            ]
        },

    }
};

function initRoutes(app, limiters) {

    const bookRoutes = createBookRoutes(limiters);

    /** 
    const bookRoutes = {
        'v1' : {
            'books' : {
                method : 'GET',
                limiters: limiters.FIVE_SEC,
                routeCall : require('./v1/get_books'),
            },
        },
        'v2' : {
            'books' : {
                method : 'GET',
                limiters: limiters.FIVE_SEC,
                routeCall : require('./v2/get_books'),
            }
        }
    }

*/


    for (let key in bookRoutes) {
        const route = bookRoutes[key];
        route.versions.forEach(version => {
            const base = "/api/" + (route.basePath || "books");
            const path = route.params ? base + "/:id" : base;

            const handlers = [version.limiters];
            if (route.protected) handlers.push(requireWriteAccess);
            handlers.push(version.routeCall);

            app[route.method.toLowerCase()](path, ...handlers);
        });
    }


}

module.exports = { createBookRoutes,initRoutes}