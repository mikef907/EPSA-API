import { IsLive } from '../config';
import Knex from 'knex';

const connections = require('./knexfile');

const knexConfig = IsLive ? connections.production : connections.development;

export const knex = Knex(knexConfig);
