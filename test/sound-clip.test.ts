process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';

const should = chai.should();

chai.use(chaiHttp);

describe('Sound clips', () => {

    describe('/GET sound-clips', () => {
        it('Should get all sound clips', () => {
            chai.request(server)
                .get('/sound-clips')
                .end((err, res) => {
                   console.log(res);
                });
        });
    });
});