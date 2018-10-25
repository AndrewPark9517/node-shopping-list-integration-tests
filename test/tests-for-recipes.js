const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

const expect = chai.expect;

describe('Recipes', function() {

    // Using promise to run server so that test doesn't 
    // accidentally run before the server starts running
    before(function() {
        return runServer();
    })

    // get in that habit of closing servers in case there are
    // multiple test modules that also has a 'before' block
    after(function() {
        return closeServer();
    })

    it('should list recipe on GET', function() {
        return chai
        .request(app)
        .get('/recipes')
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('array');

            // since we create 2 recipes on app load
            expect(res.body.length).to.be.at.least(1);
            
            // each recipe should be an object with key/value pairs
            // for 'id', 'name', and 'ingredients'
            const expectedKeys = ['id', 'name', 'ingredients'];
            res.body.forEach(function(recipe) {
                expect(recipe).to.be.a('object');
                expect(recipe).to.include.keys(expectedKeys);
            });
        })
    });

    it('should add an item on POST', function() {
        const newRecipe = {
            name: 'coffee',
            ingredients: ['coffee grounds', 'water', 'milk']
        };

        return chai
        .request(app)
        .post('/recipes')
        .send(newRecipe)
        .then(function(res) {
            expect(res).to.have.status(201);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'name', 'ingredients');
            expect(res.body.id).to.not.equal(null);
            // response should deep equal 'newRecipe' if we assign 'id'
            // to it from res.body.id
            expect(res.body).to.deep.equal(
                Object.assign(newRecipe, { id: res.body.id})
            );
        });
    });

    // test strategy: (for updating )
    // 1. create new recipe (w/ name and ingredients) to replace old recipe 
    // 2. make a get request to get the current list of recipes with current id's
    // 3. get the id of the first and give it to new recipe
    // 4. make a put request to that id and send the new recipe
    // 5. check the response for status code updated info
    it('should update an item on PUT', function () {
        const updateRecipe = {
            name: 'sticky rice',
            ingredients: ['2 cups water', '1 cups rice']
        };

        return (
            chai
            .request(app)
            .get('/recipes')
            .then(function(res) {
                updateRecipe.id = res.body[0].id;
            
                return chai
                    .request(app)
                    .put(`/recipes/${updateRecipe.id}`)
                    .send(updateRecipe);
            })
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.a('object');
                expect(res.body).to.deep.equal(updateRecipe);
            })
        );
    });

    // test strategy: (to delete)
    // 1. get current list of recipes
    // 2. get id of first recipe
    // 3. send delete request 
    // 4. check status code

    it('should delete an item on DELETE', function() {
        return ( 
            chai
            .request(app)
            .get('/recipes')
            .then(function(res) {
                return chai.request(app).delete(`/recipes/${res.body[0].id}`)
            })
            .then(function(res) {
                expect(res).to.have.status(204);
            })
        );
    });

}); 