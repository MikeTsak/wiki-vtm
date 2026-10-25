// wiki/src/utils/wikiMarkdown.js
// Dedicated markdown preprocessing for Erebus Wiki:
// - Clan emoji tokens (:Ventrue:, :Τύραννοι:)
// - Clan badges ([[clan:Ventrue]])
// - MediaWiki links ([[Article]], [[Article|Display Label]])
// - Spoilers & Galleries

export const CLAN_MAP = {
  // Ventrue
  ventrue: { name: 'Ventrue', greek: 'Τύραννοι', file: 'Ventrue', slug: 'Ventrue' },
  τυραννοι: { name: 'Ventrue', greek: 'Τύραννοι', file: 'Ventrue', slug: 'Ventrue' },
  τύραννοι: { name: 'Ventrue', greek: 'Τύραννοι', file: 'Ventrue', slug: 'Ventrue' },

  // Toreador
  toreador: { name: 'Toreador', greek: 'Ταυροκαθρέπτες', file: 'Toreador', slug: 'Toreador' },
  ταυροκαθραπτες: { name: 'Toreador', greek: 'Ταυροκαθρέπτες', file: 'Toreador', slug: 'Toreador' },
  ταυροκαθρεπτες: { name: 'Toreador', greek: 'Ταυροκαθρέπτες', file: 'Toreador', slug: 'Toreador' },
  ταυροκαθρέπτες: { name: 'Toreador', greek: 'Ταυροκαθρέπτες', file: 'Toreador', slug: 'Toreador' },

  // Nosferatu
  nosferatu: { name: 'Nosferatu', greek: 'Νοσοφόροι', file: 'Nosferatu', slug: 'Nosferatu' },
  νοσοφοροι: { name: 'Nosferatu', greek: 'Νοσοφόροι', file: 'Nosferatu', slug: 'Nosferatu' },
  νοσοφόροι: { name: 'Nosferatu', greek: 'Νοσοφόροι', file: 'Nosferatu', slug: 'Nosferatu' },

  // Lasombra
  lasombra: { name: 'Lasombra', greek: 'Επίσκιοι', file: 'Lasombra', slug: 'Lasombra' },
  επισκιοι: { name: 'Lasombra', greek: 'Επίσκιοι', file: 'Lasombra', slug: 'Lasombra' },
  επίσκιοι: { name: 'Lasombra', greek: 'Επίσκιοι', file: 'Lasombra', slug: 'Lasombra' },

  // Tremere
  tremere: { name: 'Tremere', greek: 'Τριμερείς', file: 'Tremere', slug: 'Tremere' },
  τριμερης: { name: 'Tremere', greek: 'Τριμερείς', file: 'Tremere', slug: 'Tremere' },
  τριμερείς: { name: 'Tremere', greek: 'Τριμερείς', file: 'Tremere', slug: 'Tremere' },
  τριμερεις: { name: 'Tremere', greek: 'Τριμερείς', file: 'Tremere', slug: 'Tremere' },

  // Brujah / Bruja
  brujah: { name: 'Brujah', greek: 'Βρούχοι', file: 'Brujah', slug: 'Brujah' },
  bruja: { name: 'Brujah', greek: 'Βρούχοι', file: 'Brujah', slug: 'Brujah' },
  βρουχοι: { name: 'Brujah', greek: 'Βρούχοι', file: 'Brujah', slug: 'Brujah' },
  βρούχοι: { name: 'Brujah', greek: 'Βρούχοι', file: 'Brujah', slug: 'Brujah' },

  // Ravnos
  ravnos: { name: 'Ravnos', greek: 'Ράβνος', file: 'Ravnos', slug: 'Ravnos' },
  ραβνος: { name: 'Ravnos', greek: 'Ράβνος', file: 'Ravnos', slug: 'Ravnos' },
  ράβνος: { name: 'Ravnos', greek: 'Ράβνος', file: 'Ravnos', slug: 'Ravnos' },

  // Banu Haqim
  banu_haqim: { name: 'Banu Haqim', greek: 'Τέκνα του Χακίμ', file: 'Banu_Haqim', slug: 'Banu_Haqim' },
  banuhaqim: { name: 'Banu Haqim', greek: 'Τέκνα του Χακίμ', file: 'Banu_Haqim', slug: 'Banu_Haqim' },
  χακιμιτες: { name: 'Banu Haqim', greek: 'Χακιμίτες', file: 'Banu_Haqim', slug: 'Banu_Haqim' },
  χακιμίτες: { name: 'Banu Haqim', greek: 'Χακιμίτες', file: 'Banu_Haqim', slug: 'Banu_Haqim' },
  ασσαμιτες: { name: 'Banu Haqim', greek: 'Ασσαμίτες', file: 'Banu_Haqim', slug: 'Banu_Haqim' },
  ασσαμίτες: { name: 'Banu Haqim', greek: 'Ασσαμίτες', file: 'Banu_Haqim', slug: 'Banu_Haqim' },
  τεκνα_του_χακιμ: { name: 'Banu Haqim', greek: 'Τέκνα του Χακίμ', file: 'Banu_Haqim', slug: 'Banu_Haqim' },

  // Hecata
  hecata: { name: 'Hecata', greek: 'Αικαταίοι', file: 'Hecata', slug: 'Hecata' },
  αικαταιοι: { name: 'Hecata', greek: 'Αικαταίοι', file: 'Hecata', slug: 'Hecata' },
  αικαταίοι: { name: 'Hecata', greek: 'Αικαταίοι', file: 'Hecata', slug: 'Hecata' },
  εκαταιοι: { name: 'Hecata', greek: 'Αικαταίοι', file: 'Hecata', slug: 'Hecata' },

  // Malkavian
  malkavian: { name: 'Malkavian', greek: 'Μαινάδες', file: 'Malkavian', slug: 'Malkavian' },
  μαιναδες: { name: 'Malkavian', greek: 'Μαινάδες', file: 'Malkavian', slug: 'Malkavian' },
  μαινάδες: { name: 'Malkavian', greek: 'Μαινάδες', file: 'Malkavian', slug: 'Malkavian' },

  // Tzimisce
  tzimisce: { name: 'Tzimisce', greek: 'Τσιμισκήδες', file: 'Tzimisce', slug: 'Tzimisce' },
  τσιμησκηδες: { name: 'Tzimisce', greek: 'Τσιμισκήδες', file: 'Tzimisce', slug: 'Tzimisce' },
  τσιμισκηδες: { name: 'Tzimisce', greek: 'Τσιμισκήδες', file: 'Tzimisce', slug: 'Tzimisce' },
  τσιμισκήδες: { name: 'Tzimisce', greek: 'Τσιμισκήδες', file: 'Tzimisce', slug: 'Tzimisce' },

  // Gangrel
  gangrel: { name: 'Gangrel', greek: 'Λυκάονες', file: 'Gangrel', slug: 'Gangrel' },
  λυκαονες: { name: 'Gangrel', greek: 'Λυκάονες', file: 'Gangrel', slug: 'Gangrel' },
  λυκάονες: { name: 'Gangrel', greek: 'Λυκάονες', file: 'Gangrel', slug: 'Gangrel' },

  // Ministry
  ministry: { name: 'The Ministry', greek: 'Ιερατείο', file: 'Ministry', slug: 'The_Ministry' },
  the_ministry: { name: 'The Ministry', greek: 'Ιερατείο', file: 'Ministry', slug: 'The_Ministry' },
  ιερατειο: { name: 'The Ministry', greek: 'Ιερατείο', file: 'Ministry', slug: 'The_Ministry' },
  ιερατείο: { name: 'The Ministry', greek: 'Ιερατείο', file: 'Ministry', slug: 'The_Ministry' },
  σετιτες: { name: 'The Ministry', greek: 'Σετίτες', file: 'Ministry', slug: 'The_Ministry' },
  σετίτες: { name: 'The Ministry', greek: 'Σετίτες', file: 'Ministry', slug: 'The_Ministry' },

  // Extra clans
  salubri: { name: 'Salubri', greek: 'Σαλούμπρι', file: 'Salubri', slug: 'Salubri' },
  caitiff: { name: 'Caitiff', greek: 'Κέιτιφ', file: 'Caitiff', slug: 'Caitiff' },
  thinblood: { name: 'Thin-blood', greek: 'Λεπτόαιμοι', file: 'Thinblood', slug: 'Thin-blood' },
  thin_blood: { name: 'Thin-blood', greek: 'Λεπτόαιμοι', file: 'Thinblood', slug: 'Thin-blood' },
};

export const getClanSymbolUrl = (file) =>
  `https://portal.attlarp.gr/img/clans/white/330px-${file}_symbol_white.webp`;

export const processWikiMarkdown = (text) => {
  if (!text) return '';

  let processed = text;

  // 1. Spoilers: [spoiler]content[/spoiler]
  processed = processed.replace(
    /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
    '<details class="custom-spoiler"><summary>Spoiler</summary><div class="spoiler-content">$1</div></details>'
  );

  // 2. Galleries: [GALLERY]content[/GALLERY]
  processed = processed.replace(
    /\[GALLERY\]([\s\S]*?)\[\/GALLERY\]/gi,
    '<div class="wiki-gallery">\n\n$1\n\n</div>'
  );

  // 3. Clan badges: [[clan:Ventrue]] or [[clan:Τύραννοι|Display Label]]
  processed = processed.replace(/(?:\\?\[){2}clan:([^\]]+)(?:\\?\]){2}/gi, (match, raw) => {
    const parts = raw.split('|');
    const clanKey = parts[0].trim().toLowerCase().replace(/\s+/g, '_');
    const customLabel = parts[1]?.trim();
    const info = CLAN_MAP[clanKey];
    if (info) {
      const label = customLabel || info.name;
      const url = getClanSymbolUrl(info.file);
      return `<a href="/article/${info.slug}" class="wiki-clan-badge" title="Clan ${info.name} (${info.greek})"><img src="${url}" alt="${info.name}" class="wiki-clan-emoji" /><span>${label}</span></a>`;
    }
    return match;
  });

  // 4. Standard wiki links: [[Article]] or [[Article|Label]]
  processed = processed.replace(/(?:\\?\[){2}(.*?)(?:\\?\]){2}/g, (match, p1) => {
    if (p1.toLowerCase().startsWith('clan:')) return match;
    const parts = p1.split('|');
    const target = parts[0].trim();
    const label = (parts[1] || target).trim();
    const linkSlug = target.replace(/\s+/g, '-');
    return `<a href="/article/${linkSlug}" class="wiki-link">${label}</a>`;
  });

  // 5. Clan emojis: :Clan_Name: or :Greek_Name: (e.g. :Ventrue:, :Τύραννοι:)
  processed = processed.replace(/:([\p{L}0-9_]+):/gu, (match, rawKey) => {
    const key = rawKey.toLowerCase();
    const info = CLAN_MAP[key];
    if (info) {
      const url = getClanSymbolUrl(info.file);
      return `<a href="/article/${info.slug}" class="wiki-clan-link" title="Clan ${info.name} (${info.greek})"><img src="${url}" alt="${info.name}" class="wiki-clan-emoji" /></a>`;
    }
    return match;
  });

  return processed;
};
