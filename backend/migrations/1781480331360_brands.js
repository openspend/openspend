/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = async (pgm) => {
    const createJsonTable = async (name) => {
        pgm.createTable(name, {
            id: {
                type: 'text',
                primaryKey: true,
                default: pgm.func('gen_random_uuid()'),
            },
            data: {
                type: 'jsonb',
                notNull: true,
                default: '{}',
            },
            created_at: {
                type: 'timestamptz',
                notNull: true,
                default: pgm.func('now()'),
            },
            updated_at: {
                type: 'timestamptz',
                notNull: true,
                default: pgm.func('now()'),
            },
        });

        await pgm.sql(`
      CREATE TRIGGER ${name}_updated_at
      BEFORE UPDATE ON "${name}"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
    };

    // Create the Firestore-style JSONB collections
    await createJsonTable('brands');

    // Optional: indexes on JSONB ids
    pgm.createIndex('brands', 'id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
    pgm.dropTable('brands');
};
