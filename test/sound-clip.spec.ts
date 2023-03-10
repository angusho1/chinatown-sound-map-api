process.env.NODE_ENV = 'test';
require('dotenv').config()

import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../app';

const expect = chai.expect;
chai.use(chaiHttp);

export {};