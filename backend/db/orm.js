import 'reflect-metadata'; 
import {MikroORM} from "@mikro-orm/mysql";
import { SqlHighlighter } from '@mikro-orm/sql-highlighter';

export const orm = await MikroORM.init({
    // PRUEBA 1: solo deportista
    entities: ['./entities/*.js'],
    dbName: 'entrenamiento_db',
    clientUrl: 'mysql://root:valen2005@127.0.0.1:3306/entrenamiento_db',
    highlighter: new SqlHighlighter(),
    debug: true,
    schemaGenerator: {  //never in production, solo para desarrollo
        disableForeignKeys: true,
        createForeignKeyConstraints: true,
        ignoreSchema: [],
    },
}); 

export const syncSchema = async () => {
    const generator = orm.getSchemaGenerator();
    await generator.updateSchema();
    console.log('✅ Esquema sincronizado con la base de datos');
    await generator.dropSchema();
    await generator.createSchema();
}//esta funcion va a generar la base de datos si no existe y anlaliza si existe 
// si necesita cambios contra el esquema.

