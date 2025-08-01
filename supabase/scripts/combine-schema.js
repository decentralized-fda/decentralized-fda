const fs = require('fs').promises;
const path = require('path');

// Order of schemas to create - core schemas first
const SCHEMA_ORDER = [
    'global',    // Global types and enums MUST be first
    'core',      // Core functionality
    'oauth2',    // OAuth functionality
    'reference', // Reference data
    'personal',  // Personal data
    'cohort',    // Cohort management
    'models',    // Models and simulations
    'finance',   // Financial data
    'commerce',  // E-commerce
    'logistics', // Logistics
    'scheduling' // Scheduling
];

// Order of object types to create - moved alters to the end
const OBJECT_TYPES = [
    { suffix: '.type.sql', subdir: null },        // Types first
    { suffix: '.table.sql', subdir: null },       // Then tables
    { suffix: '.function.sql', subdir: null },    // Functions
    { suffix: '.view.sql', subdir: null },        // Views
    { suffix: '.trigger.sql', subdir: 'triggers' },// Triggers
    { suffix: '.seed.sql', subdir: 'seeds' },     // Seed data
    { suffix: '.alter.sql', subdir: 'alters' },   // Alter statements last
    { suffix: '.policy.sql', subdir: 'policies' } // Policies after alters
];

function extractTableInfo(sql) {
    // Extract table name
    const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:(\w+)\.)?(\w+)/i);
    if (!tableMatch) return null;
    
    const [_, schemaName, tableName] = tableMatch;
    
    // Find all REFERENCES
    const dependencies = new Set();
    const selfRefs = new Set();
    const refMatches = sql.matchAll(/REFERENCES\s+(?:(\w+)\.)?(\w+)/gi);
    
    for (const match of refMatches) {
        const [__, refSchema, refTable] = match;
        const fullRef = `${refSchema || schemaName}.${refTable}`;
        
        // Check if this is a self-reference
        if (refTable === tableName && (!refSchema || refSchema === schemaName)) {
            selfRefs.add(fullRef);
        } else {
            dependencies.add(fullRef);
        }
    }
    
    // If table has self-references, modify the SQL to make those FKs DEFERRABLE
    let modifiedSql = sql;
    if (selfRefs.size > 0) {
        // Replace each self-referential REFERENCES clause with a DEFERRABLE version
        for (const selfRef of selfRefs) {
            const regex = new RegExp(`(REFERENCES\\s+${selfRef.replace('.', '\\.')})([,\\s)]|\\s+ON\\s+)`, 'gi');
            modifiedSql = modifiedSql.replace(regex, '$1 DEFERRABLE INITIALLY DEFERRED$2');
        }
    }
    
    return {
        name: `${schemaName || 'public'}.${tableName}`,
        schema: schemaName,
        sql: modifiedSql,
        dependencies: Array.from(dependencies)
    };
}

function extractSeedInfo(sql) {
    // Extract table name from INSERT INTO statement
    const tableMatch = sql.match(/INSERT\s+INTO\s+(?:(\w+)\.)?(\w+)/i);
    if (!tableMatch) return null;
    
    const [_, schemaName, tableName] = tableMatch;
    
    return {
        name: `${schemaName || 'public'}.${tableName}`,
        schema: schemaName,
        sql: sql,
        // The seed data depends on its corresponding table
        dependencies: [`${schemaName || 'public'}.${tableName}`]
    };
}

function sortTablesByDependencies(tables) {
    const sorted = [];
    const visited = new Set();
    const visiting = new Set();
    
    function visit(table) {
        if (visiting.has(table.name)) {
            console.warn(`Warning: Circular dependency detected for table ${table.name}, will be handled with DEFERRABLE constraints`);
            return;
        }
        if (visited.has(table.name)) return;
        
        visiting.add(table.name);
        
        for (const dep of table.dependencies) {
            const depTable = tables.find(t => t.name === dep);
            if (depTable) {
                visit(depTable);
            }
        }
        
        visiting.delete(table.name);
        visited.add(table.name);
        sorted.push(table);
    }
    
    // Process all tables
    for (const table of tables) {
        if (!visited.has(table.name)) {
            visit(table);
        }
    }
    
    return sorted;
}

async function readSqlFiles(schemaDir, objectType) {
    const files = [];
    try {
        // Update path to look in root directory's schema folder
        const baseDir = path.join(__dirname, '..', '..', 'schema', schemaDir, objectType.subdir || '.');
        const dirContents = await fs.readdir(baseDir, { withFileTypes: true }).catch(() => []);
        
        for (const entry of dirContents) {
            if (entry.isFile() && entry.name.endsWith(objectType.suffix)) {
                const content = await fs.readFile(path.join(baseDir, entry.name), 'utf8');
                
                // If these are tables or seeds, we need to handle dependencies
                if (objectType.suffix === '.table.sql') {
                    const tableInfo = extractTableInfo(content);
                    if (tableInfo) {
                        files.push(tableInfo);
                        continue;
                    }
                } else if (objectType.suffix === '.seed.sql') {
                    const seedInfo = extractSeedInfo(content);
                    if (seedInfo) {
                        files.push(seedInfo);
                        continue;
                    }
                }
                
                files.push(content);
            }
        }
    } catch (error) {
        // Directory or type might not exist for this schema, which is fine
        if (error.code !== 'ENOENT') {
            console.warn(`Warning reading ${objectType.suffix} from ${schemaDir}: ${error.message}`);
        }
    }
    return files;
}

async function createMigration() {
    const migrationParts = [];
    
    // Add header
    migrationParts.push('-- Migration generated by combine-schema.js');
    migrationParts.push('-- Creates schemas and objects in dependency order\n');
    
    // Create schemas first
    migrationParts.push('-- Create schemas');
    for (const schema of SCHEMA_ORDER) {
        migrationParts.push(`CREATE SCHEMA IF NOT EXISTS ${schema};`);
    }
    migrationParts.push('');
    
    // First create all types from all schemas
    migrationParts.push('-- Types and Enums');
    for (const schema of SCHEMA_ORDER) {
        const schemaDir = schema;  // Changed from path.join('schema', schema)
        const typeFiles = await readSqlFiles(schemaDir, { suffix: '.type.sql', subdir: null });
        
        if (typeFiles.length > 0) {
            migrationParts.push(`-- ${schema} types`);
            migrationParts.push(typeFiles.join('\n\n'));
            migrationParts.push('');
        }
    }
    
    // Then collect all tables and other objects from all schemas
    const allTables = [];
    const allSeeds = [];
    const allAlters = [];
    const otherObjects = new Map(); // schema -> type -> content[]
    
    for (const schema of SCHEMA_ORDER) {
        const schemaDir = schema;
        
        // Process each object type except types (already handled)
        for (const objectType of OBJECT_TYPES) {
            if (objectType.suffix === '.type.sql') continue; // Skip types
            
            const files = await readSqlFiles(schemaDir, objectType);
            
            if (files.length > 0) {
                if (objectType.suffix === '.table.sql') {
                    allTables.push(...files);
                } else if (objectType.suffix === '.seed.sql') {
                    allSeeds.push(...files);
                } else if (objectType.suffix === '.alter.sql') {
                    allAlters.push(...files);
                } else {
                    if (!otherObjects.has(schema)) {
                        otherObjects.set(schema, new Map());
                    }
                    if (!otherObjects.get(schema).has(objectType.suffix)) {
                        otherObjects.get(schema).set(objectType.suffix, []);
                    }
                    otherObjects.get(schema).get(objectType.suffix).push(...files);
                }
            }
        }
    }
    
    // Sort all tables by dependencies
    const sortedTables = sortTablesByDependencies(allTables);
    
    // Add tables
    migrationParts.push('-- Tables (in dependency order)');
    migrationParts.push(sortedTables.map(t => t.sql).join('\n\n'));
    migrationParts.push('');
    
    // Add non-seed objects schema by schema
    for (const schema of SCHEMA_ORDER) {
        if (!otherObjects.has(schema)) continue;
        
        const schemaObjects = otherObjects.get(schema);
        for (const objectType of OBJECT_TYPES) {
            if (objectType.suffix === '.table.sql' || 
                objectType.suffix === '.type.sql' || 
                objectType.suffix === '.seed.sql' ||
                objectType.suffix === '.alter.sql') continue; // Already handled or will be handled later
            
            const objects = schemaObjects.get(objectType.suffix);
            if (objects && objects.length > 0) {
                migrationParts.push(`-- ${schema} ${objectType.suffix.replace('.sql', '')}`);
                migrationParts.push(objects.join('\n\n'));
                migrationParts.push('');
            }
        }
    }
    
    // Add all ALTER statements after all tables and other objects
    if (allAlters.length > 0) {
        migrationParts.push('-- Alter statements (after all tables are created)');
        migrationParts.push(allAlters.join('\n\n'));
        migrationParts.push('');
    }
    
    // Sort seeds by dependencies (including table dependencies)
    const sortedSeeds = sortTablesByDependencies([...sortedTables, ...allSeeds]);
    
    // Add seeds (only the ones that weren't in sortedTables)
    migrationParts.push('-- Seed data (in dependency order)');
    migrationParts.push(sortedSeeds.filter(obj => allSeeds.includes(obj)).map(s => s.sql).join('\n\n'));
    migrationParts.push('');
    
    // Write the combined migration
    const migrationDir = path.join(__dirname, '..', 'migrations');
    await fs.mkdir(migrationDir, { recursive: true });
    
    // Use 00000000000000 for initial schema migration
    const migrationPath = path.join(migrationDir, '00000000000000_initial_schema.sql');
    
    await fs.writeFile(migrationPath, migrationParts.join('\n'));
    console.log(`Created migration at ${migrationPath}`);
}

createMigration()
    .then(() => console.log('Done!'))
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    }); 