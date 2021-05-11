process.env.NODE_ENV = 'test';
require('dotenv').config()

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';

const expect = chai.expect;
chai.use(chaiHttp);

describe('Sound clips', () => {

    describe('/GET sound-clips', () => {
        it('Should get all sound clips', (done) => {
            chai.request(server)
                .get('/sound-clips')
                .end((err, res) => {
                   expect(err).to.be.null;
                   expect(res).to.have.status(200);
                   done();
                });
        });
    });
});

export {};