import 'reflect-metadata'; 
import 'dotenv/config';
import {MikroORM} from "@mikro-orm/mysql";
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const entitiesPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'entities', '*.js');
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || '3306';
const dbName = process.env.DB_NAME || 'entrenamiento_db';
const dbUser = process.env.DB_USER || 'dsw';
const dbPassword = process.env.DB_PASSWORD || 'dsw123';
const driverOptions = process.env.DB_SSL_MODE === 'REQUIRED'
  ? { connection: { ssl: { rejectUnauthorized: false } } }
  : undefined;

export const orm = await MikroORM.init({
  entities: [entitiesPath],
    dbName,
    host: dbHost,
    port: Number(dbPort),
    user: dbUser,
    password: dbPassword,
    driverOptions,
    highlighter: new SqlHighlighter(),
    debug: true,
    schemaGenerator: {  
        disableForeignKeys: true,
        createForeignKeyConstraints: true,
        ignoreSchema: [],
    },
}); 

export const syncSchema = async () => {
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();
  console.log('Esquema sincronizado con la base de datos');
};
