

const requireWriteAccess = require("../../middleware/middleware");

function createAuthRoutes(limiters) {
    return {
        'signin': {
            method : 'POST',
            basePath: 'signin',
            versions : [
                
                {
                    limiters: limiters.ONE_SEC,
                    routeCall : require ('./post_signin')
                },
                
            ],
        },

        'signup': {
            method: 'POST',
            basePath: 'signup',
            versions: [
                {
                    limiters: limiters.FIVE_SEC,
                    routeCall: require('./post_signup')
                },
            ]
        },

    }
};

function initAuthRoutes(app, limiters) {

    const authRoutes = createAuthRoutes(limiters);

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


    for (let key in authRoutes) {
        const route = authRoutes[key];
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

module.exports = { createAuthRoutes,initAuthRoutes}