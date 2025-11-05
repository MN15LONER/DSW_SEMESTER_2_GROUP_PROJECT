import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
const LEAFLETS_DIR = FileSystem.documentDirectory + 'leaflets';
const META_KEY = 'leaflets_metadata_v1';
async function ensureDirExists() {
  const info = await FileSystem.getInfoAsync(LEAFLETS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(LEAFLETS_DIR, { intermediates: true });
  }
}
async function readAllMetadata() {
  try {
    const json = await AsyncStorage.getItem(META_KEY);
    if (!json) return [];
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
async function writeAllMetadata(items) {
  await AsyncStorage.setItem(META_KEY, JSON.stringify(items));
}
export async function saveLeaflet({ uri, title, notes, docType }) {
  await ensureDirExists();
  const id = String(Date.now());
  const fileName = `${id}.jpg`;
  const dest = `${LEAFLETS_DIR}/${fileName}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  const item = {
    id,
    fileUri: dest,
    title: title || null,
    notes: notes || null,
    docType: docType || 'photo',
    createdAt: Date.now(),
  };
  const all = await readAllMetadata();
  all.unshift(item);
  await writeAllMetadata(all);
  return item;
}
export async function listLeaflets() {
  const all = await readAllMetadata();
  const validated = [];
  for (const it of all) {
    try {
      const info = await FileSystem.getInfoAsync(it.fileUri);
      if (info.exists) validated.push(it);
    } catch {}
  }
  if (validated.length !== all.length) {
    await writeAllMetadata(validated);
  }
  return validated;
}
export async function deleteLeaflet(id) {
  const all = await readAllMetadata();
  const target = all.find(i => i.id === id);
  if (target) {
    try { await FileSystem.deleteAsync(target.fileUri, { idempotent: true }); } catch {}
  }
  const remaining = all.filter(i => i.id !== id);
  await writeAllMetadata(remaining);
  return true;
}
export async function clearAllLeaflets() {
  const all = await readAllMetadata();
  for (const it of all) {
    try { await FileSystem.deleteAsync(it.fileUri, { idempotent: true }); } catch {}
  }
  await writeAllMetadata([]);
}