from pathlib import Path

p = Path('v8-premium-templates.js')
s = p.read_text(encoding='utf-8')

old = """    const legacy = state.current;
    const untouchedLegacy = legacy && legacy.name === 'Бизнес-сайт' && legacy.site?.header?.logoText === 'NOVA' && !legacy.site?.customCss && legacy.blocks?.[0]?.data?.title === 'Сайт, который хочется запомнить';
    if (untouchedLegacy && !sessionStorage.getItem('siteforge_v83_migrated')) {
      const next = templates.find(t => t.id === 'business').build();
      next.id = state.activeId; next.createdAt = legacy.createdAt || Date.now();
      state.map[state.activeId] = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.map));
      sessionStorage.setItem('siteforge_v83_migrated','1');
      location.reload(); return;
    }
"""

new = """    const legacy = state.current;
    const legacySignatures = [
      ['business','Бизнес-сайт','NOVA','Сайт, который хочется запомнить'],
      ['portfolio','Портфолио','PORTFOLIO','Я создаю цифровые продукты и яркие истории'],
      ['product','Продукт','FLOW','Меньше рутины. Больше результата.'],
      ['event','Событие','DIGITAL NIGHT','Digital Night 2026']
    ];
    const legacyMatch = legacy && !legacy.site?.customCss && legacySignatures.find(([,projectName,logo,title]) =>
      legacy.name === projectName && legacy.site?.header?.logoText === logo && legacy.blocks?.[0]?.data?.title === title
    );
    if (legacyMatch && !sessionStorage.getItem('siteforge_v83_migrated')) {
      const next = templates.find(t => t.id === legacyMatch[0]).build();
      next.id = state.activeId; next.createdAt = legacy.createdAt || Date.now();
      state.map[state.activeId] = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.map));
      sessionStorage.setItem('siteforge_v83_migrated','1');
      location.reload(); return;
    }
"""

if old not in s:
    raise SystemExit('legacy migration marker not found')

p.write_text(s.replace(old, new, 1), encoding='utf-8')
