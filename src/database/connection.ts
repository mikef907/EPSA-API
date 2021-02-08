import { IsLive } from '../config';
import Knex from 'knex';

const connections = require('../../knexfile');

console.log('Is Live', IsLive);

const knexConfig = IsLive ? connections.development : connections.production;

export const knex = Knex(knexConfig);
