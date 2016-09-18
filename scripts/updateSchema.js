import path from 'path';
import fs from 'fs';
import { graphql } from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';
import schema from '../data/schema';
import { db } from '../data/bookshelf';

const jsonFile = path.join(__dirname, '../data/schema.json');
const graphQLFile = path.join(__dirname, '../data/schema.graphql');

(async function updateSchema() {
    try {
        const json = await graphql(schema, introspectionQuery);
        fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
        fs.writeFileSync(graphQLFile, printSchema(schema));
        console.log('Schema has been regenerated');
    } catch (err) {
        console.error(err.stack);
    }
    finally {
        db.knex.destroy();
    }
})();