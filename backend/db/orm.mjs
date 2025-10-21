import 'reflect-metadata'; 
import {MikroORM} from "@mikro-orm/mysql";
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export const orm = await MikroORM.init({
    entities: ['./entities/*.js'],
    dbName: 'entrenamiento_db',
    clientUrl: 'mysql://dsw:dsw123@127.0.0.1:3306/entrenamiento_db',
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
