const fs = require('fs');
const path = require('path');

// The name of the JSON file to validate.
const atlasFile = 'unified-spiral-glyphode_final.json';
const atlasPath = path.join(__dirname, atlasFile);

console.log(`\n🔍 Running validation for: ${atlasFile}`);

try {
    // 1. Read and parse the JSON file
    const fileContent = fs.readFileSync(atlasPath, 'utf8');
    const jsonData = JSON.parse(fileContent);

    const { rawData, unifiedEdgeList } = jsonData;

    if (!rawData || !unifiedEdgeList) {
        throw new Error('JSON file is missing `rawData` or `unifiedEdgeList` keys.');
    }

    // 2. Create a set of all unique nodes defined in rawData for efficient lookup
    const definedNodes = new Set();
    for (const group in rawData) {
        if (Array.isArray(rawData[group])) {
            rawData[group].forEach(node => definedNodes.add(node));
        }
    }
    console.log(`📊 Found ${definedNodes.size} unique nodes defined in rawData.`);

    // 3. Check for duplicate nodes within the same group
    const duplicateNodes = [];
    for (const [group, nodesInGroup] of Object.entries(rawData)) {
        if (Array.isArray(nodesInGroup)) {
            const seen = new Set();
            nodesInGroup.forEach(node => {
                if (seen.has(node)) {
                    duplicateNodes.push({ node, group });
                }
                seen.add(node);
            });
        }
    }

    // 4. Validate every edge for dangling nodes
    const invalidEdges = [];
    unifiedEdgeList.forEach((edge, index) => {
        if (!Array.isArray(edge) || edge.length < 2 || edge[0] === null || edge[1] === null) {
            invalidEdges.push({ edge: edge || ['null', 'null'], index, reason: 'Malformed edge (null or not an array of length 2).' });
            return; // Skip to next edge
        }
        
        const [from, to] = edge;

        if (!definedNodes.has(from)) {
            invalidEdges.push({ edge, index, reason: `Source node "${from}" is not defined in rawData.` });
        }
        if (!definedNodes.has(to)) {
            invalidEdges.push({ edge, index, reason: `Target node "${to}" is not defined in rawData.` });
        }
    });

    // 5. Report hard errors (duplicates and dangling edges)
    let hasErrors = false;
    if (duplicateNodes.length > 0) {
        hasErrors = true;
        console.error(`\n❌ Found ${duplicateNodes.length} duplicate node definitions within groups:`);
        duplicateNodes.forEach(({ node, group }) => {
            console.error(`  - Node "${node}" is duplicated in group "${group}".`);
        });
    }

    if (invalidEdges.length > 0) {
        hasErrors = true;
        console.error(`\n❌ Found ${invalidEdges.length} edge integrity issues:`);
        invalidEdges.forEach(({ edge, index, reason }) => {
            console.error(`  - Edge #${index} ["${edge[0]}", "${edge[1]}"]: ${reason}`);
        });
    }

    if (!hasErrors) {
        console.log('\n✅ Success! No duplicates or dangling edges found.');
    } else {
        console.log('\nValidation failed due to the errors above.');
        process.exit(1);
    }

    // 6. Check for orphan (0 connections) and stub (1 connection) nodes
    const connectionCounts = new Map();
    unifiedEdgeList.forEach(edge => {
        if (Array.isArray(edge) && edge.length >= 2) {
            const [from, to] = edge;
            if(from) connectionCounts.set(from, (connectionCounts.get(from) || 0) + 1);
            if(to) connectionCounts.set(to, (connectionCounts.get(to) || 0) + 1);
        }
    });

    const orphanNodes = [];
    const stubNodes = [];
    definedNodes.forEach(node => {
        const count = connectionCounts.get(node) || 0;
        if (count === 0) orphanNodes.push(node);
        else if (count === 1) stubNodes.push(node);
    });

    // 7. Report warnings for orphans and stubs
    if (orphanNodes.length > 0) {
        console.log(`\n⚠️ Found ${orphanNodes.length} orphan nodes (0 connections):`);
        console.log(`  - ${orphanNodes.join(', ')}`);
    }
    if (stubNodes.length > 0) {
        console.log(`\n⚠️ Found ${stubNodes.length} stub nodes (1 connection):`);
        console.log(`  - ${stubNodes.join(', ')}`);
    }
    console.log('\nValidation complete.');

} catch (error) {
    console.error(`\n🚨 An error occurred during validation: ${error.message}`);
    process.exit(1);
}