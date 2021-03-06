var World = require(__dirname + '/../../src/world/World')
,   Body = require(__dirname + '/../../src/objects/Body')
,   LinearSpring = require(__dirname + '/../../src/objects/LinearSpring')
,   DistanceConstraint = require(__dirname + '/../../src/constraints/DistanceConstraint')
,   Circle = require(__dirname + '/../../src/shapes/Circle')
,   Plane = require(__dirname + '/../../src/shapes/Plane')
,   Ray = require(__dirname + '/../../src/collision/Ray')
,   RaycastResult = require(__dirname + '/../../src/collision/RaycastResult')
,   LinearSpring = require(__dirname + '/../../src/objects/LinearSpring')
,   Convex = require(__dirname + '/../../src/shapes/Convex');

exports.construct = function(test){
    var world = new World();

    var options = {
        gravity: [123,456]
    };
    world = new World(options);
    test.equal(world.gravity[0], options.gravity[0]);
    test.equal(world.gravity[1], options.gravity[1]);
    test.done();
};

exports.raycast = function(test){
    var world = new World();
    var shape = new Plane();
    var body = new Body();
    body.addShape(shape, [0,0], Math.PI / 2);
    world.addBody(body);
    var result = new RaycastResult();
    var ray = new Ray({
        from: [0, -10],
        to: [0, 10]
    });
    world.raycast(result, ray);
    test.ok(result.hasHit());

    var hitPointWorld = [1,1];
    result.getHitPoint(hitPointWorld, ray);
    test.equal(hitPointWorld[0], 0);
    test.equal(hitPointWorld[1], 0);

    test.equal(result.getHitDistance(ray), 10);

    test.done();
};

exports.addBody = {
    duringStep: function(test){
        var world = new World();
        var body = new Body();
        world.on('postBroadphase', function(){
            test.throws(function(){
                world.addBody(body);
            }, 'should throw on removing bodies during step');
            test.done();
        });
        world.step(1);
    },
    twice: function(test){
        var world = new World();
        var body = new Body();
        world.addBody(body);
        test.throws(function(){
            world.addBody(body);
        }, 'should throw on adding body twice');
        test.done();
    },
};

exports.addConstraint = {
    withoutAddedBodies: function(test){
        var bodyA = new Body();
        var bodyB = new Body();
        var constraint = new DistanceConstraint(bodyA, bodyB);
        var world = new World();
        test.throws(function(){
            world.addConstraint(constraint);
        },'Should throw error if a constraint is added to the world but not its bodies.');

        world.addBody(bodyA);
        world.addBody(bodyB);
        world.addConstraint(constraint);

        test.done();
    },

    duringStep: function(test){
        var bodyA = new Body();
        var bodyB = new Body();
        var constraint = new DistanceConstraint(bodyA, bodyB);
        var world = new World();
        world.on('postBroadphase', function(){
            test.throws(function(){
                world.addConstraint(constraint);
            }, 'should throw on adding constraints during step');
            test.done();
        });
        world.step(1);
    }
};

exports.addContactMaterial = function(test){
    // STUB
    test.done();
};

exports.addSpring = {
    duringStep: function(test){
        var bodyA = new Body();
        var bodyB = new Body();
        var spring = new LinearSpring(bodyA, bodyB);
        var world = new World();
        world.on('postBroadphase', function(){
            test.throws(function(){
                world.addSpring(spring);
            }, 'should throw on adding springs during step');
            test.done();
        });
        world.step(1);
    }
};

exports.clear = function(test){
    var world = new World();

    var bodyA = new Body();
    var bodyB = new Body();
    world.addBody(bodyA);
    world.addBody(bodyB);

    var spring = new LinearSpring(bodyA, bodyB);
    world.addSpring(spring);

    var constraint = new DistanceConstraint(bodyA, bodyB);
    world.addConstraint(constraint);

    world.clear();

    test.deepEqual(world.bodies, []);
    test.deepEqual(world.springs, []);
    test.deepEqual(world.constraints, []);
    test.deepEqual(world.contactMaterials, []);

    test.done();
};

exports.clone = function(test){
    // STUB
    test.done();
};

exports.disableBodyCollision = function(test){
    var bodyA = new Body({ mass:1 }),
        bodyB = new Body({ mass:1 }),
        world = new World();
    bodyA.addShape(new Circle({ radius: 1 }));
    bodyB.addShape(new Circle({ radius: 1 }));
    world.addBody(bodyA);
    world.addBody(bodyB);
    world.disableBodyCollision(bodyA,bodyB);
    world.step(1/60);
    test.equal(world.narrowphase.contactEquations.length,0);
    world.enableBodyCollision(bodyA,bodyB);
    world.step(1/60);
    test.equal(world.narrowphase.contactEquations.length,1);
    test.done();
};

exports.getBodyById = function(test){
    // STUB
    test.done();
};

exports.getContactMaterial = function(test){
    // STUB
    test.done();
};

exports.hitTest = function(test){
    var b = new Body(),
        world = new World();
    world.addBody(b);
    test.deepEqual(world.hitTest([0,0],[b]) , [], "Should miss bodies without shapes");

    b.addShape(new Circle({ radius: 1 }));
    test.deepEqual(world.hitTest([0,0],[b]) , [b], "Should hit Circle");
    test.deepEqual(world.hitTest([1.1,0],[b]) , [], "Should miss Circle");

    b = new Body();
    b.addShape(new Convex({ vertices: [ [-1,-1],
                            [ 1,-1],
                            [ 1, 1],
                            [-1, 1]] }));
    test.deepEqual(world.hitTest([0,0],  [b]) , [b],  "Should hit Convex");
    test.deepEqual(world.hitTest([1.1,0],[b]) , [], "Should miss Convex");
    test.done();
};

exports.integrateBody = function(test){
    // STUB
    test.done();
};

// TODO test other aspects of removeBody
exports.removeBody = {
    duringStep: function(test){
        var world = new World();
        var body = new Body();
        world.addBody(body);
        world.on('postBroadphase', function(){
            test.throws(function(){
                world.removeBody(body);
            }, 'should throw on adding bodies during step');
            test.done();
        });
        world.step(1);
    },
    "removes relevant pairs from disabledBodyCollisionPairs": function(test){
        var body1 = new Body({id: 1}),
            body2 = new Body({id: 2}),
            body3 = new Body({id: 3}),
            world = new World();
        world.addBody(body1);
        world.addBody(body2);
        world.addBody(body3);
        world.disableBodyCollision(body1, body2);
        world.disableBodyCollision(body2, body1);
        world.disableBodyCollision(body3, body3);

        world.removeBody(body1);

        test.equal(world.disabledBodyCollisionPairs.length, 2);
        test.equal(world.disabledBodyCollisionPairs[0].id, body3.id);
        test.equal(world.disabledBodyCollisionPairs[1].id, body3.id);
        test.done();
    }
};

exports.removeConstraint = {
    duringStep: function(test){
        var world = new World();
        var bodyA = new Body();
        world.addBody(bodyA);
        var bodyB = new Body();
        world.addBody(bodyB);

        var constraint = new DistanceConstraint(bodyA, bodyB);
        world.addConstraint(constraint);

        world.on('postBroadphase', function(){
            test.throws(function(){
                world.removeConstraint(constraint);
            }, 'should throw on removing constraints during step');
            test.done();
        });
        world.step(1);
    }
};

exports.removeContactMaterial = function(test){
    // STUB
    test.done();
};

exports.removeSpring = {
    duringStep: function(test){
        var bodyA = new Body();
        var bodyB = new Body();
        var spring = new LinearSpring(bodyA, bodyB);
        var world = new World();
        world.addSpring(spring);
        world.on('postBroadphase', function(){
            test.throws(function(){
                world.removeSpring(spring);
            }, 'should throw on removing springs during step');
            test.done();
        });
        world.step(1);
    }
};

exports.runNarrowphase = function(test){
    // STUB
    test.done();
};

exports.setGlobalStiffness = function(test){
    var world = new World();
    world.setGlobalStiffness(123);
    test.equal(world.defaultContactMaterial.stiffness, 123);
    // TODO: check constraints etc
    test.done();
};

exports.setGlobalRelaxation = function(test){
    var world = new World();
    world.setGlobalRelaxation(123);
    test.equal(world.defaultContactMaterial.relaxation, 123);
    // TODO: check constraints etc
    test.done();
};

exports.step = function(test){
    // STUB
    test.done();
};

exports.events = {
    beginContact : function(test){
        var world = new World(),
            bodyA = new Body({ mass:1 }),
            bodyB = new Body({ mass:1 });
        world.addBody(bodyA);
        world.addBody(bodyB);
        var shapeA = new Circle({ radius: 1 }),
            shapeB = new Circle({ radius: 1 });
        bodyA.addShape(shapeA);
        bodyB.addShape(shapeB);
        var beginContactHits = 0,
            endContactHits = 0;
        world.on("beginContact",function(evt){
            test.ok( evt.shapeA.id === shapeA.id || evt.shapeA.id === shapeB.id );
            test.ok( evt.shapeB.id === shapeA.id || evt.shapeB.id === shapeB.id );
            test.ok( evt.bodyA.id === bodyA.id || evt.bodyA.id === bodyB.id );
            test.ok( evt.bodyB.id === bodyA.id || evt.bodyB.id === bodyB.id );
            beginContactHits++;
        });
        world.on("endContact",function(evt){
            test.ok( evt.shapeA.id === shapeA.id || evt.shapeA.id === shapeB.id );
            test.ok( evt.shapeB.id === shapeA.id || evt.shapeB.id === shapeB.id );
            test.ok( evt.bodyA.id === bodyA.id || evt.bodyA.id === bodyB.id );
            test.ok( evt.bodyB.id === bodyA.id || evt.bodyB.id === bodyB.id );
            endContactHits++;
        });

        // First overlap - one new beginContact
        world.step(1/60);
        test.equal(beginContactHits, 1);
        test.equal(endContactHits, 0);

        // Still overlapping - should maintain
        world.step(1/60);
        test.equal(beginContactHits, 1);
        test.equal(endContactHits, 0);

        // End the overlap
        bodyA.position[0] = 10;
        world.step(1/60);
        test.equal(beginContactHits, 1);
        test.equal(endContactHits,1);

        test.done();
    },


    beginContact2 : function(test){
        var world = new World(),
            // 3 circles, A overlaps B which overlaps C
            bodyA = new Body({ mass:1, position:[-1.1,0] }),
            bodyB = new Body({ mass:1, position:[0,0] }),
            bodyC = new Body({ mass:1, position:[1.1,0] });
        world.addBody(bodyA);
        world.addBody(bodyB);
        world.addBody(bodyC);
        var shapeA = new Circle({ radius: 1 }),
            shapeB = new Circle({ radius: 1 }),
            shapeC = new Circle({ radius: 1 });
        bodyA.addShape(shapeA);
        bodyB.addShape(shapeB);
        bodyC.addShape(shapeC);

        var beginContactHits = 0,
            endContactHits = 0;

        world.on("beginContact",function(evt){
            beginContactHits++;
        });

        world.on("endContact",function(evt){
            endContactHits++;
        });

        // First overlap - two new beginContact
        world.step(1/60);
        test.equal(beginContactHits, 2);
        test.equal(endContactHits, 0);

        // Still overlapping - should not report anything
        world.step(1/60);
        test.equal(beginContactHits, 2);
        test.equal(endContactHits, 0);

        // End one overlap
        bodyA.position[1] = 10;
        world.step(1/60);
        test.equal(beginContactHits, 2);
        test.equal(endContactHits,1);

        // End another overlap
        bodyB.position[1] = -10;
        world.step(1/60);
        test.equal(beginContactHits, 2);
        test.equal(endContactHits,2);

        test.done();
    },
};
