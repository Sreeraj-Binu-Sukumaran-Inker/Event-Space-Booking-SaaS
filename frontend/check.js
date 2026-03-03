import fs from 'fs';
const data = fs.readFileSync('src/pages/tenants/EventSpaceManagement.tsx', 'utf-8');
console.log(data.match(/facilities/g)?.length);
