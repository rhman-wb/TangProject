import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const scratch =
  process.env.SCRATCH ||
  'C:/Users/39722/AppData/Local/Temp/grok-goal-d632ebb73046/implementer';

const poets = JSON.parse(readFileSync('data/poets.json', 'utf8')).poets;
const places = JSON.parse(readFileSync('data/places.json', 'utf8')).places;
const poems = JSON.parse(readFileSync('data/poems.json', 'utf8')).poems;

writeFileSync(
  join(scratch, 'data-counts.txt'),
  `poets=${poets.length}\nplaces=${places.length}\npoems=${poems.length}\n`
);

const lines = [];
lines.push(`libai=${poets.find((p) => p.id === 'libai').period}`);
lines.push(`dufu=${poets.find((p) => p.id === 'dufu').period}`);
lines.push(`mawei=${places.find((p) => p.id === 'mawei').scope}`);
const c = poems.find((p) => p.id === 'changhenge');
lines.push(`changhenge_highlights=${c.highlight.length}`);
lines.push(
  `xianjie=${places.some((p) => /仙界|梦境/.test(p.name) || /仙界|梦境/.test(p.id))}`
);
const song = poems.find((p) => p.id === 'songyuanershi-anxi');
lines.push(`song_places=${JSON.stringify(song.places)}`);
lines.push(
  `weicheng_scope=${places.find((p) => p.id === 'weicheng').scope}`
);
lines.push(
  `yangguan_scope=${places.find((p) => p.id === 'yangguan').scope}`
);
writeFileSync(join(scratch, 'data-spotcheck.log'), lines.join('\n') + '\n');

const deployFiles = [
  '_headers',
  '_redirects',
  '404.html',
  'sitemap.xml',
  'robots.txt',
];
const deploy = deployFiles.map((f) => `${f} exists=${existsSync(f)}`);
writeFileSync(
  join(scratch, 'deploy-check.log'),
  deploy.join('\n') +
    '\nlocal_serve=http://localhost:5173\npublic_url=pending_github_pages\n'
);

console.log('evidence written to', scratch);
console.log(readFileSync(join(scratch, 'data-counts.txt'), 'utf8'));
console.log(readFileSync(join(scratch, 'data-spotcheck.log'), 'utf8'));
