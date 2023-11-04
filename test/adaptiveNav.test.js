const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');  

chai.use(chaiHttp);
chai.should();

describe('Adaptive Navigation API Documentation', () => {
  // Test /app/route endpoint from documentation
  describe('/app/route', () => {
    it('it should return a valid route', (done) => {
      const requestBody = {
        "coordinates": [[-79.045848, 35.904798], [-79.053061, 35.909575]],
        "avoid_features": ["steps"],
        "avoid_obstacles": ["narrow"],
        "restrictions": {
            "surface_type": "cobblestone:flattened",
            "track_type": "grade1",
            "smoothness_type": "good",
            "maximum_incline": 6
        }
      };

      chai.request('http://localhost:5001')
        .post('/app/route')
        .send(requestBody)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          
          // Check general structure
          res.body.should.have.property('type').that.equals('FeatureCollection');
          res.body.should.have.property('features').that.is.an('array');

          // Check properties
          const feature = res.body.features[0];
          feature.should.have.property('bbox').that.is.an('array');
          feature.should.have.property('type').that.equals('Feature');
          feature.should.have.property('properties').that.is.a('object');
          feature.should.have.property('geometry').that.is.a('object');

          // Check summary
          feature.properties.should.have.property('summary').that.is.a('object');
          feature.properties.summary.should.have.property('distance').that.is.a('number');
          feature.properties.summary.should.have.property('duration').that.is.a('number');

          // Check geometry
          feature.geometry.should.have.property('coordinates').that.is.an('array');
          feature.geometry.should.have.property('type').that.equals('LineString');

          // Check steps
          const steps = feature.properties.segments[0].steps;
          steps.should.be.an('array').with.length.greaterThan(0);
          steps.forEach((step) => {
            step.should.have.property('distance').that.is.a('number');
            step.should.have.property('duration').that.is.a('number');
            step.should.have.property('type').that.is.a('number');
            step.should.have.property('instruction').that.is.a('string');
            step.should.have.property('name').that.is.a('string');
            step.should.have.property('way_points').that.is.an('array').with.lengthOf(2);
          });
          done();
        });
    });
  });

  // Test /app/route endpoint connor to brooks with avoiding polygons
  describe('/app/route', () => {
    it('it should return a valid route from connor to brooks', (done) => {
      const requestBody = {
        "coordinates": [[-79.046155, 35.910851], [-79.052946, 35.909613]],
        "avoid_features": ["steps"],
        "avoid_obstacles": ["narrow"],
        "restrictions": {
          "surface_type": "cobblestone:flattened",
          "track_type": "grade1",
          "smoothness_type": "good",
          "maximum_incline": 6
        },
        "avoid_polygons": {
          "type": "Polygon",
          "coordinates": [
            [
              [35.909999, -79.049577],
              [35.91046, -79.04984],
              [35.91069, -79.049188],
              [35.910236, -79.048947],
              [35.909999, -79.049577]
            ]
          ]
        }
      };
      
      chai.request('http://localhost:5001')
        .post('/app/route')
        .send(requestBody)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          
          // Check general structure
          res.body.should.have.property('type').that.equals('FeatureCollection');
          res.body.should.have.property('features').that.is.an('array');

          // Check properties
          const feature = res.body.features[0];
          feature.should.have.property('bbox').that.is.an('array');
          feature.should.have.property('type').that.equals('Feature');
          feature.should.have.property('properties').that.is.a('object');
          feature.should.have.property('geometry').that.is.a('object');

          // Check summary
          feature.properties.should.have.property('summary').that.is.a('object');
          feature.properties.summary.should.have.property('distance').that.is.a('number');
          feature.properties.summary.should.have.property('duration').that.is.a('number');

          // Check geometry
          feature.geometry.should.have.property('coordinates').that.is.an('array');
          feature.geometry.should.have.property('type').that.equals('LineString');

          // Check steps
          const steps = feature.properties.segments[0].steps;
          steps.should.be.an('array').with.length.greaterThan(0);
          steps.forEach((step) => {
            step.should.have.property('distance').that.is.a('number');
            step.should.have.property('duration').that.is.a('number');
            step.should.have.property('type').that.is.a('number');
            step.should.have.property('instruction').that.is.a('string');
            step.should.have.property('name').that.is.a('string');
            step.should.have.property('way_points').that.is.an('array').with.lengthOf(2);
          });
          done();
        });
    });
  });
  

  // Test /app/route/hardcodedtest endpoint
  describe('/app/route/hardcodedtest', () => {
    it('it should return a valid hardcoded route', (done) => {
      chai.request('http://localhost:5001')
        .get('/app/route/hardcodedtest')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
  });
});
