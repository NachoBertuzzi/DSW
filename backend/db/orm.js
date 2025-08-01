import {mikroORM} from "@mikro-orm/core";
import {SqlHighLighter} from "@mikro-orm/sql-highlighter";
const { deportista } = require('../entities/deportista.entity.js');

export const orm = await MikroORM.init({
    entities: ['backend/entity/*.js'],
    dbName: 'entrenamiento_db',
    type: 'mysql',
    clientUrl: 'mysql://root:valen2005@127.0.0.1:3306/entrenamiento_db',
    highlighter: new SqlHighLighter(),
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
    // await generator.dropSquema();
    //await generator.createSchema();
}//esta funcion va a generar la base de datos si no existe y anlaliza si existe 
// si necesita cambios contra el esquema.
