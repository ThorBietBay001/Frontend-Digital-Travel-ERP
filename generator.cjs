const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'openapi.json');
const openapi = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

function getModuleFromPath(p) {
    if (p.includes('khach-hang-controller') || p.includes('tour-cong-khai') || p.includes('/auth/') || p.includes('/public/')) return null;
    if (p.includes('/api/khach-hang/')) return null; 

    if (p.includes('/san-pham/tour-mau')) return 'tour-template';
    if (p.includes('/dieu-hanh/tour-thuc-te')) return 'tour-instance';
    if (p.includes('/san-pham/loai-phong') || p.includes('/san-pham/dich-vu-them')) return 'services';
    if (p.includes('/san-pham/hanh-dong-xanh')) return 'green-actions';
    if (p.includes('/kinh-doanh/dat-tour')) return 'orders';
    if (p.includes('/kinh-doanh/khach-hang')) return 'customers';
    if (p.includes('/kinh-doanh/yeu-cau-ho-tro')) return 'complaints';
    if (p.includes('/kinh-doanh/voucher')) return 'promotions';
    if (p.includes('/dieu-hanh/hdv-kha-dung') || p.includes('/dieu-hanh/phan-cong')) return 'dispatch';
    if (p.includes('/ke-toan/chi-phi') || p.includes('/ke-toan/quyet-toan') || p.includes('/ke-toan/giao-dich-hoan')) return 'finance';
    if (p.includes('/quan-tri/nhat-ky-bao-mat')) return 'system/logs';
    if (p.includes('/quan-tri/nhan-vien') || p.includes('/quan-tri/dang-ky-nhan-vien')) return 'system/accounts';
    if (p.includes('/quan-tri/vai-tro')) return 'system/accounts'; 
    if (p.includes('/dieu-hanh/nhan-vien') && p.includes('nang-luc')) return 'system/hr';

    return null;
}

function extractRefs(schema, refs = new Set()) {
    if (!schema) return refs;
    if (schema.$ref) {
        refs.add(schema.$ref.split('/').pop());
    }
    if (schema.items) extractRefs(schema.items, refs);
    if (schema.properties) {
        Object.values(schema.properties).forEach(prop => extractRefs(prop, refs));
    }
    if (schema.allOf) schema.allOf.forEach(s => extractRefs(s, refs));
    if (schema.anyOf) schema.anyOf.forEach(s => extractRefs(s, refs));
    return refs;
}

function resolveAllDependencies(schemaNames) {
    const resolved = new Set(schemaNames);
    let added = true;
    while (added) {
        added = false;
        const currentSize = resolved.size;
        for (const name of Array.from(resolved)) {
            const schema = openapi.components.schemas[name];
            if (schema) {
                const refs = extractRefs(schema);
                for (const ref of Array.from(refs)) {
                    if (!resolved.has(ref)) {
                        resolved.add(ref);
                        added = true;
                    }
                }
            }
        }
    }
    return resolved;
}

function mapType(schema) {
    if (!schema) return 'any';
    if (schema.$ref) return schema.$ref.split('/').pop();
    if (schema.enum) return schema.enum.map(e => typeof e === 'string' ? `'${e}'` : e).join(' | ');
    switch (schema.type) {
        case 'integer':
        case 'number': return 'number';
        case 'string': return 'string';
        case 'boolean': return 'boolean';
        case 'array': return `${mapType(schema.items)}[]`;
        case 'object':
            if (schema.additionalProperties) return `Record<string, ${mapType(schema.additionalProperties)}>`;
            if (schema.properties) {
                const props = Object.entries(schema.properties).map(([key, propSchema]) => {
                    const isRequired = schema.required && schema.required.includes(key);
                    return `  ${key}${isRequired ? '' : '?'}: ${mapType(propSchema)};`;
                }).join('\n');
                return `{\n${props}\n}`;
            }
            return 'Record<string, any>';
        default: return 'any';
    }
}

function formatUrl(url) {
    return url.replace(/{([^}]+)}/g, '${$1}');
}

function buildMethod(operationId, method, url, op) {
    let params = [];
    let methodParams = [];
    let queryParams = false;
    let bodyType = 'any';

    if (op.parameters) {
        op.parameters.forEach(p => {
            if (p.in === 'path') params.push(`${p.name}: string`);
            else if (p.in === 'query') queryParams = true;
        });
    }

    if (queryParams) params.push(`params?: Record<string, any>`);

    if (op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
        const schema = op.requestBody.content['application/json'].schema;
        bodyType = mapType(schema);
        params.push(`data: ${bodyType}`);
        methodParams.push('data');
    }

    let returnType = 'any';
    let extractData = false;

    if (op.responses && op.responses['200'] && op.responses['200'].content && op.responses['200'].content['application/json']) {
        const schema = op.responses['200'].content['application/json'].schema;
        returnType = mapType(schema);
    } else if (op.responses && op.responses['200'] && op.responses['200'].content && op.responses['200'].content['*/*']) {
        const schema = op.responses['200'].content['*/*'].schema;
        returnType = mapType(schema);
    }

    if (returnType.startsWith('ApiResponse')) extractData = true;

    let paramSig = params.join(', ');
    const urlStr = url.includes('{') ? `\`${formatUrl(url.replace('/api', ''))}\`` : `'${url.replace('/api', '')}'`;

    let callStr = `await api.${method}<${returnType}>(${urlStr}`;
    if (method === 'post' || method === 'put' || method === 'patch') {
        callStr += methodParams.includes('data') ? `, data` : `, {}`;
        if (queryParams) callStr += `, { params }`;
    } else {
        if (queryParams) callStr += `, { params }`;
    }
    callStr += `)`;

    return {
        name: operationId || `${method}${url.split('/').pop().replace(/[^a-zA-Z]/g, '')}`,
        signature: `async (${paramSig})`,
        body: `const response = ${callStr};\n        return response.data${extractData ? '.data' : ''};`,
        dependencies: extractRefs(op)
    };
}

const modules = {};

Object.entries(openapi.paths).forEach(([url, methods]) => {
    const mod = getModuleFromPath(url);
    if (!mod) return;

    if (!modules[mod]) modules[mod] = { methods: [], schemas: new Set() };

    Object.entries(methods).forEach(([method, op]) => {
        let m = buildMethod(op.operationId, method, url, op);
        modules[mod].methods.push(m);
        
        if (op.requestBody && op.requestBody.content && op.requestBody.content['application/json']) {
            extractRefs(op.requestBody.content['application/json'].schema, modules[mod].schemas);
        }
        if (op.responses) {
            Object.values(op.responses).forEach(r => {
                if (r.content && (r.content['application/json'] || r.content['*/*'])) {
                    const c = r.content['application/json'] || r.content['*/*'];
                    extractRefs(c.schema, modules[mod].schemas);
                }
            });
        }
    });
});

const updatedFiles = [];

Object.entries(modules).forEach(([modName, modData]) => {
    const allSchemas = resolveAllDependencies(modData.schemas);
    let mockDataContent = `// --- AUTO GENERATED FROM OPENAPI ---\n\n`;
    
    Array.from(allSchemas).forEach(schemaName => {
        const schema = openapi.components.schemas[schemaName];
        if (schema) {
            mockDataContent += `export interface ${schemaName} ${mapType(schema)}\n\n`;
        }
    });

    let mockDataPath = path.join(__dirname, `src/pages/${modName}/mockData.ts`);
    const basePath = path.dirname(mockDataPath);
    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });

    let existingMockData = '';
    if (fs.existsSync(mockDataPath)) {
        existingMockData = fs.readFileSync(mockDataPath, 'utf8');
        if (existingMockData.includes('// --- END AUTO GENERATED ---')) {
            existingMockData = existingMockData.substring(existingMockData.lastIndexOf('// --- END AUTO GENERATED ---') + 29 || existingMockData.length);
        } else if (existingMockData.includes('// --------------------------')) {
            existingMockData = existingMockData.substring(existingMockData.lastIndexOf('// --------------------------') + 29 || existingMockData.length);
        }
    }

    fs.writeFileSync(mockDataPath, mockDataContent + '// --- END AUTO GENERATED ---\n' + existingMockData.replace(/^\\s+/, ''));
    updatedFiles.push(`src/pages/${modName}/mockData.ts`);

    const importedTypes = Array.from(allSchemas).filter(t => !["null", "any"].includes(t)).join(',\n    ');
    const relativePathLevels = modName.split('/').length;
    let importPrefix = '../';
    for(let i = 1; i < relativePathLevels; i++) importPrefix += '../';
    let importPath = `${importPrefix}pages/${modName}/mockData`;

    const camelName = modName.split('/').pop().replace(/-([a-z])/g, g => g[1].toUpperCase());
    const serviceName = camelName + 'Service';
    
    let serviceContent = `import api from '${importPrefix}services/api';\n`;
    if (importedTypes.length > 0) {
        serviceContent += `import type {\n    ${importedTypes}\n} from '${importPath}';\n\n`;
    }

    serviceContent += `export const ${serviceName} = {\n`;
    modData.methods.forEach((m, idx) => {
        serviceContent += `    ${m.name}: ${m.signature} => {\n        ${m.body}\n    }${idx < modData.methods.length - 1 ? ',' : ''}\n`;
    });
    serviceContent += `};\n`;

    const servicePath = path.join(__dirname, `src/services/${modName}.ts`);
    fs.mkdirSync(path.dirname(servicePath), { recursive: true });
    
    fs.writeFileSync(servicePath, serviceContent);
    updatedFiles.push(`src/services/${modName}.ts`);
});

console.log("GENERATION COMPLETED.");
console.log("Files updated/created:\n" + updatedFiles.join('\n'));
