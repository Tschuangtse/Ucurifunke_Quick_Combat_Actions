// Dependency-free ZIP (stored entries). Works on Node 20+ on all platforms.
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, "module.json"), "utf8"));
const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
if (pkg.version !== manifest.version) throw new Error("package.json und module.json müssen dieselbe Version haben.");
const archive = `${manifest.id}-v14-${manifest.version}.zip`;
const repository = "https://github.com/Tschuangtse/Ucurifunke_Quick_Combat_Actions";
if (manifest.manifest !== `${repository}/releases/latest/download/module.json`
  || manifest.download !== `${repository}/releases/download/v${manifest.version}/${archive}`) {
  throw new Error("Manifest- und Download-URLs müssen zur Release-Version passen.");
}
const files = ["module.json", "README.md", "CHANGELOG.md"];
async function collect(directory) {
  for (const item of await readdir(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${item.name}`;
    if (item.isDirectory()) await collect(relative);
    else files.push(relative);
  }
}
await collect("src");
await collect("styles");

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const local = [], central = [];
let offset = 0;
for (const file of files.sort()) {
  const data = await readFile(path.join(root, file));
  const name = Buffer.from(file);
  const crc = crc32(data);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x800, 6); // UTF-8 names
  header.writeUInt16LE(33, 12); // 1980-01-01; deterministic build
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(data.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(name.length, 26);
  local.push(header, name, data);
  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt16LE(20, 4);
  header.copy(entry, 6, 4, 30);
  entry.writeUInt32LE(offset, 42);
  central.push(entry, name);
  offset += header.length + name.length + data.length;
}
const directory = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
const dist = path.join(root, "dist");
await mkdir(dist, { recursive: true });
await writeFile(path.join(dist, archive), Buffer.concat([...local, directory, end]));
await writeFile(path.join(dist, "module.json"), await readFile(path.join(root, "module.json")));
console.log(`Erstellt: dist/${archive} (${files.length} Dateien)`);
