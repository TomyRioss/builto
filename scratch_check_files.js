const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.projectFile.findMany({ where: { projectId: 'cmt5ozfw6003krwulc6lyyvas' }, select: { path: true, content: true } }).then(rows => {
  for (const r of rows) {
    console.log('=== ' + r.path + ' (' + r.content.length + ' chars) ===');
    console.log(r.content.slice(0, 300));
    console.log('...TAIL...');
    console.log(r.content.slice(-300));
    console.log();
  }
  return p.$disconnect();
}).catch(e => { console.error(e); process.exit(1); });
