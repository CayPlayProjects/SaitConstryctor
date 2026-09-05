(() => {
  'use strict';

  const APP_VERSION = 8;
  const STORAGE_KEY = 'siteforge_v7_projects';
  const ACTIVE_KEY = 'siteforge_v7_active_project';
  const MAX_HISTORY = 80;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const safeUrl = (value = '#') => {
    const raw = String(value || '').trim();
    if (!raw) return '#';
    if (raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) return raw;
    if (/^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,/i.test(raw)) return raw;
    if (/^(https?:|mailto:|tel:)/i.test(raw)) return raw;
    return `https://${raw}`;
  };

  const slugify = (value = '') => String(value)
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => ({
      а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'
    }[char] || char))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `section-${Math.random().toString(36).slice(2, 6)}`;

  const formatDate = (timestamp) => new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date(timestamp));

  const BLOCK_LIBRARY = {
    hero: {
      category: 'Основные', icon: '✦', title: 'Hero', description: 'Первый экран',
      name: 'Главный экран', navLabel: 'Главная', defaults: {
        eyebrow: 'СОЗДАНО В SITEFORGE',
        title: 'Сайт, который хочется запомнить',
        text: 'Соберите современный лендинг из готовых блоков без кода и сложной настройки.',
        primaryText: 'Начать', primaryLink: '#features',
        secondaryText: 'Подробнее', secondaryLink: '#about',
        align: 'left', minHeight: 680,
        backgroundMode: 'gradient', background: '#0b1020', background2: '#5b35c7',
        image: '', overlay: 35, badge: 'NEW',
        showSecondary: true
      }
    },
    text: {
      category: 'Контент', icon: '¶', title: 'Текст', description: 'Заголовок и абзацы',
      name: 'Текстовый блок', navLabel: 'О нас', defaults: {
        eyebrow: 'О ПРОЕКТЕ', title: 'Расскажите самое важное',
        text: 'Добавьте историю проекта, преимущества, миссию или любое другое описание. Переносы строк сохраняются автоматически.',
        align: 'left', textWidth: 760
      }
    },
    features: {
      category: 'Контент', icon: '✣', title: 'Преимущества', description: 'Иконки и описания',
      name: 'Преимущества', navLabel: 'Возможности', defaults: {
        eyebrow: 'ВОЗМОЖНОСТИ', title: 'Всё нужное уже внутри',
        subtitle: 'Покажите ключевые преимущества продукта или услуги.', columns: 3,
        items: [
          { icon: '⚡', title: 'Быстро', text: 'Понятная настройка и моментальный предпросмотр.' },
          { icon: '◈', title: 'Гибко', text: 'Меняйте тексты, цвета, блоки и структуру страницы.' },
          { icon: '✓', title: 'Готово к запуску', text: 'Скачайте чистый адаптивный HTML одним файлом.' }
        ]
      }
    },
    cards: {
      category: 'Контент', icon: '▦', title: 'Карточки', description: 'Услуги или проекты',
      name: 'Карточки', navLabel: 'Услуги', defaults: {
        eyebrow: 'НАПРАВЛЕНИЯ', title: 'Что мы предлагаем', subtitle: 'Карточки подходят для услуг, проектов, товаров и кейсов.', columns: 3,
        items: [
          { tag: '01', image: '', title: 'Дизайн', text: 'Визуальная система, интерфейс и аккуратная подача.', buttonText: 'Подробнее', buttonLink: '#' },
          { tag: '02', image: '', title: 'Разработка', text: 'Быстрый сайт с адаптацией под любые экраны.', buttonText: 'Подробнее', buttonLink: '#' },
          { tag: '03', image: '', title: 'Поддержка', text: 'Помощь с запуском, контентом и дальнейшими улучшениями.', buttonText: 'Подробнее', buttonLink: '#' }
        ]
      }
    },
    stats: {
      category: 'Контент', icon: '↗', title: 'Цифры', description: 'Факты и показатели',
      name: 'Статистика', navLabel: 'Результаты', defaults: {
        title: '', columns: 4,
        items: [
          { value: '24/7', label: 'Доступность' },
          { value: '99%', label: 'Довольных клиентов' },
          { value: '120+', label: 'Проектов' },
          { value: '5 лет', label: 'Опыт команды' }
        ]
      }
    },
    gallery: {
      category: 'Медиа', icon: '▧', title: 'Галерея', description: 'Изображения в сетке',
      name: 'Галерея', navLabel: 'Галерея', defaults: {
        eyebrow: 'ГАЛЕРЕЯ', title: 'Покажите работу', subtitle: 'Добавляйте изображения по URL. Сетка автоматически адаптируется.', columns: 3,
        items: [
          { url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1000&q=80', alt: 'Рабочее пространство' },
          { url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1000&q=80', alt: 'Творческий процесс' },
          { url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=80', alt: 'Интерьер студии' }
        ]
      }
    },
    testimonials: {
      category: 'Доверие', icon: '❞', title: 'Отзывы', description: 'Отзывы клиентов',
      name: 'Отзывы', navLabel: 'Отзывы', defaults: {
        eyebrow: 'ОТЗЫВЫ', title: 'Что говорят о нас', columns: 3,
        items: [
          { quote: 'Всё получилось быстро, понятно и именно так, как мы хотели.', name: 'Алексей', role: 'Основатель проекта', avatar: '' },
          { quote: 'Отличный результат и очень аккуратная работа с деталями.', name: 'Мария', role: 'Маркетолог', avatar: '' },
          { quote: 'Сайт стал заметно понятнее для клиентов и удобнее на телефоне.', name: 'Иван', role: 'Предприниматель', avatar: '' }
        ]
      }
    },
    pricing: {
      category: 'Доверие', icon: '₽', title: 'Тарифы', description: 'Цены и пакеты',
      name: 'Тарифы', navLabel: 'Цены', defaults: {
        eyebrow: 'ТАРИФЫ', title: 'Выберите подходящий вариант', subtitle: 'Прозрачные условия без скрытых пунктов.', columns: 3,
        items: [
          { name: 'Старт', price: '990 ₽', period: '/ проект', description: 'Для небольшого запуска', featured: false, features: ['1 страница', 'Базовый дизайн', 'Адаптивность'], buttonText: 'Выбрать', buttonLink: '#' },
          { name: 'Профи', price: '2 990 ₽', period: '/ проект', description: 'Для основного сайта', featured: true, features: ['Все блоки', 'Расширенный дизайн', 'Приоритетная поддержка'], buttonText: 'Выбрать', buttonLink: '#' },
          { name: 'Команда', price: '6 990 ₽', period: '/ проект', description: 'Для сложных задач', featured: false, features: ['Индивидуальная структура', 'Помощь с контентом', 'Поддержка после запуска'], buttonText: 'Обсудить', buttonLink: '#' }
        ]
      }
    },
    faq: {
      category: 'Доверие', icon: '?', title: 'FAQ', description: 'Вопросы и ответы',
      name: 'FAQ', navLabel: 'FAQ', defaults: {
        eyebrow: 'ВОПРОСЫ', title: 'Часто спрашивают',
        items: [
          { question: 'Нужны ли знания HTML и CSS?', answer: 'Нет. SiteForge рассчитан на визуальную работу: добавляйте блоки, меняйте тексты и оформление через понятные поля.' },
          { question: 'Можно ли открыть готовый сайт без конструктора?', answer: 'Да. Кнопка «Скачать HTML» создаёт отдельный готовый файл сайта.' },
          { question: 'Проект сохраняется?', answer: 'Да. Проекты автоматически сохраняются в браузере. Для переноса на другой компьютер экспортируйте JSON.' }
        ]
      }
    },
    cta: {
      category: 'Основные', icon: '→', title: 'Призыв', description: 'Большой CTA-блок',
      name: 'Призыв к действию', navLabel: 'Старт', defaults: {
        eyebrow: 'ГОТОВЫ НАЧАТЬ?', title: 'Сделаем следующий шаг', text: 'Добавьте понятный призыв и направьте посетителя к нужному действию.',
        buttonText: 'Связаться', buttonLink: '#contact', align: 'center', background2: '#6d42df'
      }
    },
    contact: {
      category: 'Основные', icon: '@', title: 'Контакты', description: 'Связь и реквизиты',
      name: 'Контакты', navLabel: 'Контакты', defaults: {
        eyebrow: 'КОНТАКТЫ', title: 'Давайте обсудим задачу', text: 'Оставьте удобный способ связи, адрес или часы работы.',
        email: 'hello@example.com', phone: '+7 (900) 000-00-00', address: 'Москва, Россия', buttonText: 'Написать на почту'
      }
    },
    logos: {
      category: 'Доверие', icon: '◇', title: 'Логотипы', description: 'Партнёры и клиенты',
      name: 'Логотипы партнёров', navLabel: 'Партнёры', defaults: {
        title: 'Нам доверяют',
        items: [
          { name: 'NORTH' }, { name: 'AURA' }, { name: 'VECTOR' }, { name: 'NOVA' }, { name: 'CORE' }
        ]
      }
    },
    divider: {
      category: 'Служебные', icon: '—', title: 'Разделитель', description: 'Линия между блоками',
      name: 'Разделитель', navLabel: 'Раздел', defaults: { width: 100, opacity: 25 }
    },
    spacer: {
      category: 'Служебные', icon: '↕', title: 'Отступ', description: 'Пустое пространство',
      name: 'Отступ', navLabel: 'Отступ', defaults: { height: 80 }
    }
  };

  const DEFAULT_STYLE = {
    background: '', textColor: '', paddingTop: 96, paddingBottom: 96, maxWidth: 1180
  };

  const DEFAULT_PROJECT = () => ({
    version: APP_VERSION,
    id: uid('project'),
    name: 'Новый сайт',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    site: {
      title: 'Мой сайт', description: 'Современный сайт, созданный в SiteForge', language: 'ru', favicon: '',
      background: '#ffffff', text: '#17181d', muted: '#656b76', accent: '#7c3aed', accentText: '#ffffff',
      surface: '#f5f6f8', border: '#e7e9ee', radius: 18, container: 1180,
      font: 'Inter', headingFont: 'Inter', headingWeight: 800, sectionGap: 0,
      buttonStyle: 'solid', shadow: 'soft', smoothScroll: true,
      header: {
        enabled: true, sticky: true, logoText: 'SiteForge', logoImage: '',
        showNav: true, ctaText: 'Связаться', ctaLink: '#contact', transparent: false
      },
      footer: {
        enabled: true, text: '© 2026 Ваш бренд. Все права защищены.', showCredit: false,
        socials: [
          { label: 'Telegram', url: 'https://t.me/' },
          { label: 'VK', url: 'https://vk.com/' }
        ]
      },
      customCss: ''
    },
    blocks: []
  });

  const makeBlock = (type, overrides = {}) => {
    const meta = BLOCK_LIBRARY[type];
    if (!meta) throw new Error(`Unknown block type: ${type}`);
    const block = {
      id: uid('block'), type, name: meta.name,
      anchor: slugify(meta.navLabel || meta.name), navLabel: meta.navLabel || meta.name,
      showInNav: ['features','cards','pricing','faq','contact'].includes(type), hidden: false,
      style: clone(DEFAULT_STYLE),
      data: clone(meta.defaults)
    };
    if (type === 'hero') { block.style.paddingTop = 0; block.style.paddingBottom = 0; block.style.maxWidth = 1440; }
    if (type === 'stats') { block.style.paddingTop = 52; block.style.paddingBottom = 52; }
    if (type === 'divider') { block.style.paddingTop = 8; block.style.paddingBottom = 8; }
    if (type === 'spacer') { block.style.paddingTop = 0; block.style.paddingBottom = 0; }
    return mergeDeep(block, overrides);
  };

  function mergeDeep(target, source) {
    const out = clone(target);
    Object.entries(source || {}).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
        out[key] = mergeDeep(out[key], value);
      } else out[key] = clone(value);
    });
    return out;
  }

  const TEMPLATES = [
    {
      id: 'business', name: 'Бизнес', tag: 'Универсальный', description: 'Для услуг, студии, команды или компании.',
      bg: 'linear-gradient(135deg,#18223b,#6c4ed9)',
      build: () => {
        const p = DEFAULT_PROJECT();
        p.name = 'Бизнес-сайт';
        p.site.title = 'Nova Studio'; p.site.header.logoText = 'NOVA';
        p.blocks = [makeBlock('hero'), makeBlock('features'), makeBlock('cards'), makeBlock('stats'), makeBlock('testimonials'), makeBlock('pricing'), makeBlock('faq'), makeBlock('contact')];
        return p;
      }
    },
    {
      id: 'portfolio', name: 'Портфолио', tag: 'Креативный', description: 'Работы, навыки, отзывы и контакты.',
      bg: 'linear-gradient(135deg,#111827,#b45309)',
      build: () => {
        const p = DEFAULT_PROJECT();
        p.name = 'Портфолио'; p.site.title = 'Моё портфолио'; p.site.accent = '#ea580c'; p.site.header.logoText = 'PORTFOLIO';
        p.blocks = [
          makeBlock('hero', { data: { eyebrow: 'ПОРТФОЛИО 2026', title: 'Я создаю цифровые продукты и яркие истории', text: 'Дизайн, разработка и проекты, которыми хочется делиться.', primaryText: 'Смотреть работы', primaryLink: '#gallery', secondaryText: 'Обо мне', secondaryLink: '#about', background: '#111827', background2: '#9a3412' } }),
          makeBlock('text', { anchor:'about', navLabel:'Обо мне', showInNav:true }),
          makeBlock('gallery'), makeBlock('testimonials'), makeBlock('contact')
        ];
        return p;
      }
    },
    {
      id: 'product', name: 'Продукт', tag: 'SaaS / App', description: 'Презентация сервиса, приложения или стартапа.',
      bg: 'linear-gradient(135deg,#052e2b,#0f766e)',
      build: () => {
        const p = DEFAULT_PROJECT();
        p.name = 'Продукт'; p.site.title = 'Flow — продукт'; p.site.accent = '#0f766e'; p.site.header.logoText = 'FLOW';
        p.blocks = [
          makeBlock('hero', { data:{ eyebrow:'НОВЫЙ ПРОДУКТ', title:'Меньше рутины. Больше результата.', text:'Простой сервис, который помогает команде держать задачи, идеи и прогресс в одном месте.', primaryText:'Попробовать бесплатно', primaryLink:'#pricing', background:'#071a18', background2:'#0f766e'} }),
          makeBlock('logos'), makeBlock('features'), makeBlock('stats'), makeBlock('pricing'), makeBlock('faq'), makeBlock('cta')
        ];
        return p;
      }
    },
    {
      id: 'event', name: 'Событие', tag: 'Event', description: 'Для мероприятия, встречи, стрима или конференции.',
      bg: 'linear-gradient(135deg,#2e1065,#c026d3)',
      build: () => {
        const p = DEFAULT_PROJECT();
        p.name = 'Событие'; p.site.title = 'Digital Night'; p.site.accent = '#c026d3'; p.site.header.logoText = 'DIGITAL NIGHT';
        p.blocks = [
          makeBlock('hero', { data:{ eyebrow:'12 СЕНТЯБРЯ · 19:00', title:'Digital Night 2026', text:'Вечер про дизайн, технологии и людей, которые создают новое.', primaryText:'Зарегистрироваться', primaryLink:'#contact', background:'#1d0a36', background2:'#c026d3'} }),
          makeBlock('text', { data:{eyebrow:'О СОБЫТИИ',title:'Один вечер — много идей',text:'Доклады, живые разговоры, знакомства и разбор реальных проектов.'} }),
          makeBlock('features', { data:{eyebrow:'ПРОГРАММА',title:'Что вас ждёт',subtitle:'Коротко и по делу.'} }),
          makeBlock('pricing', { data:{eyebrow:'БИЛЕТЫ',title:'Выберите формат участия'} }), makeBlock('faq'), makeBlock('contact')
        ];
        return p;
      }
    },
    {
      id: 'blank', name: 'Чистый проект', tag: 'С нуля', description: 'Только базовый Hero — всё остальное добавите сами.',
      bg: 'linear-gradient(135deg,#20242d,#3f4654)',
      build: () => {
        const p = DEFAULT_PROJECT(); p.blocks = [makeBlock('hero')]; return p;
      }
    }
  ];

  const itemFactories = {
    features: () => ({ icon:'★', title:'Новое преимущество', text:'Коротко опишите пользу для посетителя.' }),
    cards: () => ({ tag:'NEW', image:'', title:'Новая карточка', text:'Описание карточки.', buttonText:'Подробнее', buttonLink:'#' }),
    stats: () => ({ value:'100+', label:'Новый показатель' }),
    gallery: () => ({ url:'', alt:'Изображение' }),
    testimonials: () => ({ quote:'Отличный результат!', name:'Имя клиента', role:'Клиент', avatar:'' }),
    pricing: () => ({ name:'Новый тариф', price:'1 990 ₽', period:'/ проект', description:'Краткое описание', featured:false, features:['Преимущество 1','Преимущество 2'], buttonText:'Выбрать', buttonLink:'#' }),
    faq: () => ({ question:'Новый вопрос?', answer:'Добавьте понятный и полезный ответ.' }),
    logos: () => ({ name:'BRAND' })
  };

  let project = null;
  let selectedBlockId = null;
  let inspectorTab = 'content';
  let device = 'desktop';
  let zoom = 1;
  let renderTimer = null;
  let saveTimer = null;
  let history = [];
  let historyIndex = -1;
  let isRestoringHistory = false;
  let confirmCallback = null;

  function loadProjectsMap() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; }
    catch { return {}; }
  }

  function saveProjectsMap(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  function normalizeProject(raw) {
    const base = DEFAULT_PROJECT();
    if (!raw || typeof raw !== 'object') return base;
    const normalized = mergeDeep(base, raw);
    normalized.version = APP_VERSION;
    normalized.id = raw.id || uid('project');
    normalized.name = raw.name || 'Импортированный сайт';
    normalized.createdAt = raw.createdAt || Date.now();
    normalized.updatedAt = Date.now();
    normalized.blocks = Array.isArray(raw.blocks) ? raw.blocks.filter(b => b && BLOCK_LIBRARY[b.type]).map(b => mergeDeep(makeBlock(b.type), b)) : [];
    return normalized;
  }

  function bootstrapProject() {
    const map = loadProjectsMap();
    const activeId = localStorage.getItem(ACTIVE_KEY);
    if (activeId && map[activeId]) return normalizeProject(map[activeId]);
    const p = TEMPLATES[0].build();
    map[p.id] = p;
    saveProjectsMap(map);
    localStorage.setItem(ACTIVE_KEY, p.id);
    return p;
  }

  function persistNow() {
    project.updatedAt = Date.now();
    const map = loadProjectsMap();
    map[project.id] = clone(project);
    saveProjectsMap(map);
    localStorage.setItem(ACTIVE_KEY, project.id);
    setSaveState('Сохранено');
  }

  function schedulePersist() {
    setSaveState('Сохранение…', 'saving');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistNow, 450);
  }

  function setSaveState(text, mode = '') {
    const el = $('#saveState');
    el.textContent = text;
    el.className = `save-state ${mode}`.trim();
  }

  function snapshotProject() {
    const snap = clone(project);
    snap.updatedAt = 0;
    return snap;
  }

  function resetHistory() {
    history = [snapshotProject()];
    historyIndex = 0;
    updateUndoRedo();
  }

  function commitSnapshot() {
    if (isRestoringHistory) return;
    const snap = snapshotProject();
    const current = history[historyIndex];
    if (current && JSON.stringify(current) === JSON.stringify(snap)) return;
    history = history.slice(0, historyIndex + 1);
    history.push(snap);
    if (history.length > MAX_HISTORY) history.shift();
    historyIndex = history.length - 1;
    updateUndoRedo();
    schedulePersist();
  }

  function undo() {
    if (historyIndex <= 0) return;
    historyIndex -= 1;
    restoreSnapshot(history[historyIndex]);
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyIndex += 1;
    restoreSnapshot(history[historyIndex]);
  }

  function restoreSnapshot(snapshot) {
    isRestoringHistory = true;
    project = normalizeProject(snapshot);
    project.id = snapshot.id;
    if (selectedBlockId && !project.blocks.some(b => b.id === selectedBlockId)) selectedBlockId = null;
    refreshAll();
    schedulePersist();
    isRestoringHistory = false;
    updateUndoRedo();
  }

  function updateUndoRedo() {
    $('#undoBtn').disabled = historyIndex <= 0;
    $('#redoBtn').disabled = historyIndex >= history.length - 1;
  }

  function selectBlock(id) {
    selectedBlockId = id && project.blocks.some(b => b.id === id) ? id : null;
    inspectorTab = 'content';
    $$('.inspector-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.inspectorTab === inspectorTab));
    renderStructure();
    renderInspector();
    if (window.innerWidth <= 980) $('#rightSidebar').classList.add('open');
    else document.body.classList.remove('v8-right-collapsed');
    postSelectionToPreview();
  }

  function selectedBlock() {
    return project.blocks.find(b => b.id === selectedBlockId) || null;
  }

  function addBlock(type) {
    const block = makeBlock(type);
    const selectedIndex = project.blocks.findIndex(b => b.id === selectedBlockId);
    if (selectedIndex >= 0) project.blocks.splice(selectedIndex + 1, 0, block);
    else project.blocks.push(block);
    ensureUniqueAnchor(block);
    selectedBlockId = block.id;
    commitSnapshot();
    refreshAll();
    toast('Блок добавлен', `${BLOCK_LIBRARY[type].title} появился на странице.`, 'success');
  }

  function duplicateBlock(id) {
    const index = project.blocks.findIndex(b => b.id === id);
    if (index < 0) return;
    const copy = clone(project.blocks[index]);
    copy.id = uid('block');
    copy.name = `${copy.name} — копия`;
    copy.anchor = `${copy.anchor}-copy`;
    ensureUniqueAnchor(copy);
    project.blocks.splice(index + 1, 0, copy);
    selectedBlockId = copy.id;
    commitSnapshot();
    refreshAll();
    toast('Блок скопирован', 'Копия добавлена сразу после оригинала.', 'success');
  }

  function deleteBlock(id) {
    const index = project.blocks.findIndex(b => b.id === id);
    if (index < 0) return;
    const block = project.blocks[index];
    confirmAction('Удалить блок?', `Блок «${block.name}» будет удалён. Действие можно отменить через Ctrl+Z.`, () => {
      project.blocks.splice(index, 1);
      if (selectedBlockId === id) selectedBlockId = null;
      commitSnapshot();
      refreshAll();
      toast('Блок удалён', block.name, 'warning');
    });
  }

  function moveBlock(id, direction) {
    const index = project.blocks.findIndex(b => b.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= project.blocks.length) return;
    [project.blocks[index], project.blocks[next]] = [project.blocks[next], project.blocks[index]];
    commitSnapshot();
    refreshAll();
  }

  function ensureUniqueAnchor(block) {
    const used = new Set(project.blocks.filter(b => b.id !== block.id).map(b => b.anchor));
    let base = slugify(block.anchor || block.navLabel || block.name);
    let anchor = base;
    let i = 2;
    while (used.has(anchor)) anchor = `${base}-${i++}`;
    block.anchor = anchor;
  }

  function applyTemplate(templateId) {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (!template) return;
    const apply = () => {
      const next = template.build();
      next.id = project.id;
      next.createdAt = project.createdAt;
      next.name = project.name === 'Новый сайт' ? next.name : project.name;
      project = next;
      selectedBlockId = null;
      resetHistory();
      commitSnapshot();
      refreshAll();
      toast('Шаблон применён', `Основа «${template.name}» готова к редактированию.`, 'success');
    };
    if (project.blocks.length > 1) confirmAction('Заменить текущую структуру?', 'Шаблон заменит все блоки текущего проекта. Настройки можно вернуть через Ctrl+Z только до перезагрузки страницы.', apply);
    else apply();
  }

  function switchProject(id) {
    persistNow();
    const map = loadProjectsMap();
    if (!map[id]) return;
    project = normalizeProject(map[id]);
    project.id = id;
    localStorage.setItem(ACTIVE_KEY, id);
    selectedBlockId = null;
    resetHistory();
    refreshAll();
    closeModals();
    toast('Проект открыт', project.name, 'success');
  }

  function createNewProject() {
    persistNow();
    const next = TEMPLATES[4].build();
    next.name = `Новый сайт ${new Date().toLocaleDateString('ru-RU')}`;
    project = next;
    selectedBlockId = null;
    resetHistory();
    persistNow();
    refreshAll();
    renderSavedProjects();
    closeModals();
    toast('Новый проект', 'Чистая страница готова.', 'success');
  }

  function deleteProject(id) {
    if (id === project.id) {
      toast('Нельзя удалить открытый проект', 'Сначала откройте другой проект.', 'warning');
      return;
    }
    const map = loadProjectsMap();
    const target = map[id];
    if (!target) return;
    confirmAction('Удалить проект?', `Проект «${target.name}» будет удалён из этого браузера без возможности восстановления.`, () => {
      delete map[id];
      saveProjectsMap(map);
      renderSavedProjects();
      toast('Проект удалён', target.name, 'warning');
    });
  }

  function renderBlockLibrary(filter = '') {
    const query = filter.trim().toLowerCase();
    const categories = {};
    Object.entries(BLOCK_LIBRARY).forEach(([type, meta]) => {
      const haystack = `${meta.title} ${meta.description} ${meta.category}`.toLowerCase();
      if (query && !haystack.includes(query)) return;
      (categories[meta.category] ||= []).push([type, meta]);
    });
    $('#blockCategories').innerHTML = Object.entries(categories).map(([category, items]) => `
      <section class="block-category">
        <div class="block-category-title"><span>${escapeHtml(category)}</span><span>${items.length}</span></div>
        <div class="block-grid">
          ${items.map(([type, meta]) => `
            <button class="block-tile" type="button" data-add-block="${type}">
              <span class="block-tile-icon">${meta.icon}</span>
              <span><strong>${escapeHtml(meta.title)}</strong><small>${escapeHtml(meta.description)}</small></span>
            </button>
          `).join('')}
        </div>
      </section>
    `).join('') || `<div class="inspector-empty"><h3>Ничего не найдено</h3><p>Попробуйте другой запрос.</p></div>`;
  }

  function renderTemplates() {
    $('#templateGrid').innerHTML = TEMPLATES.map(t => `
      <article class="template-card">
        <div class="template-cover" style="--template-bg:${t.bg}"><span>${escapeHtml(t.tag)}</span></div>
        <div class="template-info">
          <h3>${escapeHtml(t.name)}</h3>
          <p>${escapeHtml(t.description)}</p>
          <button class="btn btn-ghost" type="button" data-apply-template="${t.id}">Использовать шаблон</button>
        </div>
      </article>
    `).join('');
  }

  function renderStructure() {
    const list = $('#structureList');
    if (!project.blocks.length) {
      list.innerHTML = `<div class="inspector-empty"><div class="inspector-empty-icon">＋</div><h3>Страница пустая</h3><p>Откройте вкладку «Блоки» и добавьте первый элемент.</p></div>`;
      return;
    }
    list.innerHTML = project.blocks.map((block, index) => {
      const meta = BLOCK_LIBRARY[block.type];
      return `
        <div class="structure-item ${selectedBlockId === block.id ? 'active' : ''} ${block.hidden ? 'is-hidden' : ''}" draggable="true" data-structure-id="${block.id}" data-index="${index}">
          <button class="structure-handle" type="button" title="Перетащить">⋮⋮</button>
          <button class="structure-copy" type="button" data-select-block="${block.id}">
            <strong>${meta.icon} ${escapeHtml(block.name)}</strong>
            <small>${escapeHtml(meta.title)} · #${escapeHtml(block.anchor)}</small>
          </button>
          <div class="structure-actions">
            <button class="structure-action" type="button" data-toggle-block="${block.id}" title="${block.hidden ? 'Показать' : 'Скрыть'}">${block.hidden ? '○' : '◉'}</button>
            <button class="structure-action" type="button" data-duplicate-block="${block.id}" title="Дублировать">⧉</button>
            <button class="structure-action danger" type="button" data-delete-block="${block.id}" title="Удалить">×</button>
          </div>
        </div>
      `;
    }).join('');
    setupStructureDnD();
  }

  function renderSavedProjects() {
    const map = loadProjectsMap();
    const items = Object.values(map).sort((a,b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    $('#savedProjects').innerHTML = items.map(p => `
      <article class="saved-project ${p.id === project.id ? 'active' : ''}">
        <div>
          <h3>${escapeHtml(p.name || 'Без названия')}</h3>
          <p>${(p.blocks || []).length} блоков · ${escapeHtml(formatDate(p.updatedAt || p.createdAt || Date.now()))}${p.id === project.id ? ' · открыт' : ''}</p>
        </div>
        <div class="saved-project-actions">
          ${p.id !== project.id ? `<button class="btn btn-ghost" type="button" data-open-project="${p.id}">Открыть</button>` : ''}
          <button class="btn btn-ghost" type="button" data-delete-project="${p.id}">Удалить</button>
        </div>
      </article>
    `).join('');
  }

  function renderInspector() {
    const block = selectedBlock();
    $('#inspectorTitle').textContent = block ? block.name : 'Настройки сайта';
    const content = $('#inspectorContent');
    content.innerHTML = block ? renderBlockInspector(block) : renderSiteInspector();
  }

  function fieldText(label, path, value, placeholder = '', options = {}) {
    return `<div class="field"><label>${escapeHtml(label)}</label><input class="text-input" type="${options.type || 'text'}" data-path="${path}" value="${escapeHtml(value ?? '')}" placeholder="${escapeHtml(placeholder)}" ${options.maxlength ? `maxlength="${options.maxlength}"` : ''}/>${options.help ? `<div class="field-help">${escapeHtml(options.help)}</div>` : ''}</div>`;
  }

  function fieldTextarea(label, path, value, help = '', transform = '') {
    return `<div class="field"><label>${escapeHtml(label)}</label><textarea class="text-area" data-path="${path}" ${transform ? `data-transform="${transform}"` : ''}>${escapeHtml(value ?? '')}</textarea>${help ? `<div class="field-help">${escapeHtml(help)}</div>` : ''}</div>`;
  }

  function fieldColor(label, path, value) {
    const color = /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ffffff';
    return `<div class="field"><label>${escapeHtml(label)}</label><div class="color-input-wrap"><input class="color-input" type="color" data-path="${path}" value="${color}"/><input class="color-text" type="text" data-color-text="${path}" value="${escapeHtml(value || color)}" maxlength="7"/></div></div>`;
  }

  function fieldImage(label, path, value, help = '') {
    return `<div class="field"><label>${escapeHtml(label)}</label><input class="text-input" type="text" data-path="${path}" value="${escapeHtml(value || '')}" placeholder="https://… или загрузите файл"/><button class="add-item-btn" type="button" data-upload-path="${path}">↑ Загрузить изображение</button>${help ? `<div class="field-help">${escapeHtml(help)}</div>` : ''}</div>`;
  }

  function fieldSelect(label, path, value, options) {
    return `<div class="field"><label>${escapeHtml(label)}</label><select class="select-input" data-path="${path}">${options.map(([v,t]) => `<option value="${escapeHtml(v)}" ${String(value) === String(v) ? 'selected' : ''}>${escapeHtml(t)}</option>`).join('')}</select></div>`;
  }

  function fieldNumber(label, path, value, min = 0, max = 9999, step = 1) {
    return `<div class="field"><label>${escapeHtml(label)}</label><input class="number-input" type="number" data-path="${path}" value="${Number(value) || 0}" min="${min}" max="${max}" step="${step}"/></div>`;
  }

  function fieldToggle(label, path, checked, help = '') {
    return `<div class="toggle-row"><div class="toggle-copy"><strong>${escapeHtml(label)}</strong>${help ? `<small>${escapeHtml(help)}</small>` : ''}</div><label class="toggle"><input type="checkbox" data-path="${path}" ${checked ? 'checked' : ''}/><span class="toggle-track"></span></label></div>`;
  }

  function section(title, body, extra = '') {
    return `<section class="inspector-section"><div class="inspector-section-title"><h3>${escapeHtml(title)}</h3>${extra}</div>${body}</section>`;
  }

  function renderSiteInspector() {
    const s = project.site;
    if (inspectorTab === 'content') {
      return [
        section('Шапка сайта',
          fieldToggle('Показывать шапку', 'site.header.enabled', s.header.enabled) +
          fieldText('Название / логотип', 'site.header.logoText', s.header.logoText) +
          fieldImage('Логотип', 'site.header.logoImage', s.header.logoImage, 'Можно вставить URL или выбрать файл с компьютера.') +
          fieldToggle('Автоматическое меню', 'site.header.showNav', s.header.showNav, 'Пункты берутся из блоков с включённой опцией «Показывать в меню».') +
          fieldToggle('Закрепить сверху', 'site.header.sticky', s.header.sticky) +
          fieldText('Кнопка справа', 'site.header.ctaText', s.header.ctaText) +
          fieldText('Ссылка кнопки', 'site.header.ctaLink', s.header.ctaLink, '#contact')
        ),
        section('Подвал',
          fieldToggle('Показывать подвал', 'site.footer.enabled', s.footer.enabled) +
          fieldText('Текст', 'site.footer.text', s.footer.text) +
          fieldToggle('Показывать SiteForge', 'site.footer.showCredit', s.footer.showCredit, 'Добавляет небольшую подпись «Сделано в SiteForge».') +
          renderSimpleList('Соцсети', 'site.footer.socials', s.footer.socials, [
            ['label','Название','text'], ['url','Ссылка','text']
          ], 'social')
        )
      ].join('');
    }

    if (inspectorTab === 'style') {
      return [
        section('Цвета', `<div class="field-row">${fieldColor('Фон', 'site.background', s.background)}${fieldColor('Текст', 'site.text', s.text)}</div><div class="field-row">${fieldColor('Акцент', 'site.accent', s.accent)}${fieldColor('Поверхности', 'site.surface', s.surface)}</div><div class="field-row">${fieldColor('Вторичный текст', 'site.muted', s.muted)}${fieldColor('Границы', 'site.border', s.border)}</div>`),
        section('Типографика',
          fieldSelect('Основной шрифт', 'site.font', s.font, [['Inter','Inter'],['Manrope','Manrope'],['Poppins','Poppins'],['Montserrat','Montserrat'],['Playfair Display','Playfair Display'],['system-ui','Системный']]) +
          fieldSelect('Шрифт заголовков', 'site.headingFont', s.headingFont, [['Inter','Inter'],['Manrope','Manrope'],['Poppins','Poppins'],['Montserrat','Montserrat'],['Playfair Display','Playfair Display'],['system-ui','Системный']]) +
          fieldSelect('Насыщенность заголовков', 'site.headingWeight', s.headingWeight, [['600','Semi Bold'],['700','Bold'],['800','Extra Bold'],['900','Black']])
        ),
        section('Геометрия', `<div class="field-row">${fieldNumber('Контейнер, px', 'site.container', s.container, 760, 1600, 20)}${fieldNumber('Скругление, px', 'site.radius', s.radius, 0, 48, 1)}</div>` + fieldSelect('Тени карточек', 'site.shadow', s.shadow, [['none','Без теней'],['soft','Мягкие'],['medium','Средние'],['strong','Выраженные']]))
      ].join('');
    }

    return [
      section('SEO и браузер',
        fieldText('Заголовок вкладки', 'site.title', s.title, 'Название сайта') +
        fieldTextarea('Описание страницы', 'site.description', s.description, 'Используется в meta description.') +
        fieldText('Favicon URL', 'site.favicon', s.favicon, 'https://…') +
        fieldSelect('Язык страницы', 'site.language', s.language, [['ru','Русский'],['en','English'],['uk','Українська'],['de','Deutsch']])
      ),
      section('Поведение', fieldToggle('Плавная прокрутка', 'site.smoothScroll', s.smoothScroll)),
      section('Свой CSS', fieldTextarea('Дополнительные стили', 'site.customCss', s.customCss, 'Продвинутый режим: CSS попадёт в готовый HTML.')),
      section('Проект', `<div class="inspector-actions"><button class="btn btn-ghost" type="button" data-action="export-project">Скачать JSON</button><button class="btn btn-ghost" type="button" data-action="open-projects">Мои проекты</button></div><div class="field-help">SiteForge автоматически сохраняет проект в браузере. JSON нужен для резервной копии и переноса.</div>`)
    ].join('');
  }

  function renderBlockInspector(block) {
    const d = block.data;
    if (inspectorTab === 'content') {
      let html = '';
      switch (block.type) {
        case 'hero':
          html = section('Текст', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldTextarea('Описание', 'data.text', d.text)) +
            section('Основная кнопка', fieldText('Текст кнопки', 'data.primaryText', d.primaryText) + fieldText('Ссылка', 'data.primaryLink', d.primaryLink)) +
            section('Вторая кнопка', fieldToggle('Показывать', 'data.showSecondary', d.showSecondary) + fieldText('Текст кнопки', 'data.secondaryText', d.secondaryText) + fieldText('Ссылка', 'data.secondaryLink', d.secondaryLink));
          break;
        case 'text':
          html = section('Содержание', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldTextarea('Текст', 'data.text', d.text, 'Можно использовать переносы строк.'));
          break;
        case 'features':
          html = section('Заголовок', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldText('Подзаголовок', 'data.subtitle', d.subtitle)) + renderItemsEditor(block, [
            ['icon','Иконка','text'], ['title','Название','text'], ['text','Описание','textarea']
          ]);
          break;
        case 'cards':
          html = section('Заголовок', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldText('Подзаголовок', 'data.subtitle', d.subtitle)) + renderItemsEditor(block, [
            ['tag','Метка','text'], ['image','Изображение','image'], ['title','Название','text'], ['text','Описание','textarea'], ['buttonText','Кнопка','text'], ['buttonLink','Ссылка','text']
          ]);
          break;
        case 'stats':
          html = section('Заголовок', fieldText('Заголовок (необязательно)', 'data.title', d.title)) + renderItemsEditor(block, [['value','Значение','text'],['label','Подпись','text']]);
          break;
        case 'gallery':
          html = section('Заголовок', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldText('Подзаголовок', 'data.subtitle', d.subtitle)) + renderItemsEditor(block, [['url','Изображение','image'],['alt','Описание изображения','text']]);
          break;
        case 'testimonials':
          html = section('Заголовок', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title)) + renderItemsEditor(block, [['quote','Отзыв','textarea'],['name','Имя','text'],['role','Роль / компания','text'],['avatar','Аватар','image']]);
          break;
        case 'pricing':
          html = section('Заголовок', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldText('Подзаголовок', 'data.subtitle', d.subtitle)) + renderItemsEditor(block, [['name','Тариф','text'],['price','Цена','text'],['period','Период','text'],['description','Описание','text'],['features','Преимущества — по строке','lines'],['buttonText','Кнопка','text'],['buttonLink','Ссылка','text'],['featured','Выделить тариф','toggle']]);
          break;
        case 'faq':
          html = section('Заголовок', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title)) + renderItemsEditor(block, [['question','Вопрос','text'],['answer','Ответ','textarea']]);
          break;
        case 'cta':
          html = section('Содержание', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldTextarea('Описание', 'data.text', d.text) + fieldText('Текст кнопки', 'data.buttonText', d.buttonText) + fieldText('Ссылка', 'data.buttonLink', d.buttonLink));
          break;
        case 'contact':
          html = section('Содержание', fieldText('Надзаголовок', 'data.eyebrow', d.eyebrow) + fieldText('Заголовок', 'data.title', d.title) + fieldTextarea('Описание', 'data.text', d.text)) +
            section('Контакты', fieldText('E-mail', 'data.email', d.email, 'hello@example.com', {type:'email'}) + fieldText('Телефон', 'data.phone', d.phone) + fieldText('Адрес', 'data.address', d.address) + fieldText('Текст кнопки', 'data.buttonText', d.buttonText));
          break;
        case 'logos':
          html = section('Заголовок', fieldText('Заголовок', 'data.title', d.title)) + renderItemsEditor(block, [['name','Название','text']]);
          break;
        case 'divider':
          html = section('Разделитель', fieldNumber('Ширина, %', 'data.width', d.width, 10, 100, 5) + fieldNumber('Прозрачность, %', 'data.opacity', d.opacity, 5, 100, 5));
          break;
        case 'spacer':
          html = section('Размер', fieldNumber('Высота, px', 'data.height', d.height, 10, 400, 10));
          break;
      }
      return html;
    }

    if (inspectorTab === 'style') {
      const common = section('Отступы и фон',
        `<div class="field-row">${fieldNumber('Сверху, px', 'style.paddingTop', block.style.paddingTop, 0, 260, 4)}${fieldNumber('Снизу, px', 'style.paddingBottom', block.style.paddingBottom, 0, 260, 4)}</div>` +
        fieldNumber('Ширина контента, px', 'style.maxWidth', block.style.maxWidth, 600, 1600, 20) +
        `<div class="field-row">${fieldColor('Фон блока', 'style.background', block.style.background || project.site.background)}${fieldColor('Цвет текста', 'style.textColor', block.style.textColor || project.site.text)}</div>` +
        `<div class="field-help">Если цвет совпадает с глобальным, блок визуально остаётся частью общего фона.</div>`
      );
      let specific = '';
      if (block.type === 'hero') specific = section('Hero', fieldSelect('Выравнивание', 'data.align', d.align, [['left','Слева'],['center','По центру'],['right','Справа']]) + fieldNumber('Минимальная высота, px', 'data.minHeight', d.minHeight, 420, 960, 20) + fieldSelect('Фон Hero', 'data.backgroundMode', d.backgroundMode, [['gradient','Градиент'],['color','Цвет'],['image','Изображение']]) + `<div class="field-row">${fieldColor('Цвет 1', 'data.background', d.background)}${fieldColor('Цвет 2', 'data.background2', d.background2)}</div>` + fieldImage('Изображение', 'data.image', d.image, 'Файл сохранится внутри проекта как Data URL.') + fieldNumber('Затемнение, %', 'data.overlay', d.overlay, 0, 90, 5));
      if (block.type === 'text') specific = section('Текст', fieldSelect('Выравнивание', 'data.align', d.align, [['left','Слева'],['center','По центру'],['right','Справа']]) + fieldNumber('Ширина текста, px', 'data.textWidth', d.textWidth, 420, 1180, 20));
      if (['features','cards','gallery','testimonials','pricing','stats'].includes(block.type)) specific = section('Сетка', fieldSelect('Колонки', 'data.columns', d.columns, [['1','1 колонка'],['2','2 колонки'],['3','3 колонки'],['4','4 колонки']]));
      if (block.type === 'cta') specific = section('CTA', fieldSelect('Выравнивание', 'data.align', d.align, [['left','Слева'],['center','По центру']]) + fieldColor('Акцент фона', 'data.background2', d.background2));
      return common + specific;
    }

    return [
      section('Блок',
        fieldText('Название в конструкторе', 'name', block.name) +
        fieldText('Якорь', 'anchor', block.anchor, 'section-id', {help:'Используется для ссылок вида #section-id.'}) +
        fieldText('Название в меню', 'navLabel', block.navLabel) +
        fieldToggle('Показывать в меню', 'showInNav', block.showInNav) +
        fieldToggle('Скрыть блок', 'hidden', block.hidden, 'Блок останется в проекте, но не попадёт в готовый сайт.')
      ),
      section('Действия', `<div class="inspector-actions"><button class="btn btn-ghost" type="button" data-action="duplicate-selected">Дублировать</button><button class="btn btn-ghost" type="button" data-action="move-up">Поднять выше</button><button class="btn btn-ghost" type="button" data-action="move-down">Опустить ниже</button><button class="btn btn-danger" type="button" data-action="delete-selected">Удалить</button></div>`)
    ].join('');
  }

  function renderSimpleList(title, basePath, items, fields, itemType) {
    return `<div class="field"><span class="field-label">${escapeHtml(title)}</span><div class="repeat-list">${items.map((item,i) => `
      <div class="repeat-card">
        <div class="repeat-card-head"><strong>${escapeHtml(item.label || item.name || `${title} ${i+1}`)}</strong><button class="mini-action danger" type="button" data-remove-simple="${basePath}" data-index="${i}">×</button></div>
        <div class="repeat-card-body">${fields.map(([key,label]) => fieldText(label, `${basePath}.${i}.${key}`, item[key] || '')).join('')}</div>
      </div>`).join('')}</div><button class="add-item-btn" type="button" data-add-simple="${itemType}">+ Добавить</button></div>`;
  }

  function renderItemsEditor(block, fields) {
    const items = block.data.items || [];
    return section('Элементы', `<div class="repeat-list">${items.map((item,i) => `
      <div class="repeat-card">
        <div class="repeat-card-head">
          <strong>${escapeHtml(item.title || item.name || item.question || item.label || item.value || `Элемент ${i+1}`)}</strong>
          <button class="mini-action" type="button" data-move-item="-1" data-index="${i}" ${i===0?'disabled':''}>↑</button>
          <button class="mini-action" type="button" data-move-item="1" data-index="${i}" ${i===items.length-1?'disabled':''}>↓</button>
          <button class="mini-action danger" type="button" data-remove-item data-index="${i}">×</button>
        </div>
        <div class="repeat-card-body">
          ${fields.map(([key,label,type]) => {
            const path = `data.items.${i}.${key}`;
            if (type === 'textarea') return fieldTextarea(label, path, item[key] || '');
            if (type === 'lines') return fieldTextarea(label, path, Array.isArray(item[key]) ? item[key].join('\n') : (item[key] || ''), '', 'lines');
            if (type === 'toggle') return fieldToggle(label, path, !!item[key]);
            if (type === 'image') return fieldImage(label, path, item[key] || '');
            return fieldText(label, path, item[key] || '');
          }).join('')}
        </div>
      </div>
    `).join('')}</div><button class="add-item-btn" type="button" data-add-item>+ Добавить элемент</button>`);
  }

  function getPath(root, path) {
    return path.split('.').reduce((acc, key) => acc?.[key], root);
  }

  function setPath(root, path, value) {
    const keys = path.split('.');
    let cur = root;
    keys.slice(0,-1).forEach(key => {
      if (cur[key] == null) cur[key] = /^\d+$/.test(keys[keys.indexOf(key)+1] || '') ? [] : {};
      cur = cur[key];
    });
    cur[keys.at(-1)] = value;
  }

  function parseInputValue(input) {
    if (input.type === 'checkbox') return input.checked;
    if (input.type === 'number' || input.type === 'range') return Number(input.value);
    if (input.dataset.transform === 'lines') return input.value.split('\n').map(s => s.trim()).filter(Boolean);
    return input.value;
  }

  function handleColorTextInput(event, commit = false) {
    const input = event.target.closest('[data-color-text]');
    if (!input) return false;
    if (!/^#[0-9a-f]{6}$/i.test(input.value)) return true;
    const path = input.dataset.colorText;
    const block = selectedBlock();
    if (block && !path.startsWith('site.')) setPath(block, path, input.value); else setPath(project, path, input.value);
    const colorInput = $(`input[type="color"][data-path="${CSS.escape(path)}"]`, $('#inspectorContent'));
    if (colorInput) colorInput.value = input.value;
    scheduleRender();
    if (commit) commitSnapshot(); else schedulePersist();
    return true;
  }

  function handleInspectorInput(event, commit = false) {
    const input = event.target.closest('[data-path]');
    if (!input) return;
    const block = selectedBlock();
    const path = input.dataset.path;
    const value = parseInputValue(input);
    if (block && !path.startsWith('site.')) setPath(block, path, value);
    else setPath(project, path, value);

    if (block && path === 'anchor') ensureUniqueAnchor(block);
    if (path === 'name' && block) $('#inspectorTitle').textContent = value || BLOCK_LIBRARY[block.type].title;
    if (path === 'site.header.logoText' || path.startsWith('site.') || block) scheduleRender();
    if (path.includes('.items.') || path === 'name' || path === 'anchor' || path === 'navLabel' || path === 'hidden' || path === 'showInNav') renderStructure();
    if (commit) commitSnapshot(); else schedulePersist();
  }

  function setupStructureDnD() {
    let draggedId = null;
    $$('.structure-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        draggedId = item.dataset.structureId;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
      });
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        const rect = item.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        item.classList.toggle('structure-drop-before', !after);
        item.classList.toggle('structure-drop-after', after);
      });
      item.addEventListener('dragleave', () => item.classList.remove('structure-drop-before','structure-drop-after'));
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const sourceId = draggedId || e.dataTransfer.getData('text/plain');
        const targetId = item.dataset.structureId;
        item.classList.remove('structure-drop-before','structure-drop-after');
        if (!sourceId || sourceId === targetId) return;
        const sourceIndex = project.blocks.findIndex(b => b.id === sourceId);
        let targetIndex = project.blocks.findIndex(b => b.id === targetId);
        const rect = item.getBoundingClientRect();
        const after = e.clientY > rect.top + rect.height / 2;
        const [moved] = project.blocks.splice(sourceIndex, 1);
        targetIndex = project.blocks.findIndex(b => b.id === targetId);
        project.blocks.splice(targetIndex + (after ? 1 : 0), 0, moved);
        commitSnapshot();
        refreshAll();
      });
      item.addEventListener('dragend', () => $$('.structure-item').forEach(i => i.classList.remove('structure-drop-before','structure-drop-after')));
    });
  }

  function scheduleRender() {
    setSaveState('Есть изменения', 'dirty');
    clearTimeout(renderTimer);
    renderTimer = setTimeout(() => {
      updatePreview();
      $('#projectName').value = project.name;
      $('#blockCount').textContent = `${project.blocks.length} ${plural(project.blocks.length, 'блок', 'блока', 'блоков')}`;
    }, 120);
  }

  function refreshAll() {
    $('#projectName').value = project.name;
    $('#blockCount').textContent = `${project.blocks.length} ${plural(project.blocks.length, 'блок', 'блока', 'блоков')}`;
    renderStructure();
    renderInspector();
    updatePreview();
    updateUndoRedo();
  }

  function plural(n, one, few, many) {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
    return many;
  }

  function updatePreview() {
    const html = generateSiteHtml(project, true);
    $('#previewFrame').srcdoc = html;
    if (!$('#previewModal').hidden) $('#fullPreviewFrame').srcdoc = generateSiteHtml(project, false);
  }

  function postSelectionToPreview() {
    const frame = $('#previewFrame');
    try { frame.contentWindow?.postMessage({ type:'siteforge-select', id:selectedBlockId }, '*'); } catch {}
  }

  function renderEyebrow(text) {
    return text ? `<div class="sf-eyebrow">${escapeHtml(text)}</div>` : '';
  }

  function paragraphs(text) {
    return escapeHtml(text || '').split(/\n{2,}/).map(p => `<p>${p.replaceAll('\n','<br>')}</p>`).join('');
  }

  function blockStyle(block, projectSite) {
    const bg = block.style.background || projectSite.background;
    const text = block.style.textColor || projectSite.text;
    return `--sf-block-bg:${bg};--sf-block-text:${text};--sf-pt:${Number(block.style.paddingTop)||0}px;--sf-pb:${Number(block.style.paddingBottom)||0}px;--sf-block-max:${Number(block.style.maxWidth)||projectSite.container}px;`;
  }

  function renderBlock(block, site, builderMode) {
    if (block.hidden) return '';
    const d = block.data;
    const attr = builderMode ? ` data-sf-block-id="${block.id}"` : '';
    const common = `id="${escapeHtml(block.anchor)}" class="sf-section sf-type-${block.type}" style="${blockStyle(block, site)}"${attr}`;
    switch (block.type) {
      case 'hero': {
        let heroBg = `linear-gradient(135deg, ${d.background}, ${d.background2})`;
        if (d.backgroundMode === 'color') heroBg = d.background;
        if (d.backgroundMode === 'image' && d.image) heroBg = `linear-gradient(rgba(0,0,0,${(d.overlay||0)/100}),rgba(0,0,0,${(d.overlay||0)/100})),url('${String(d.image).replaceAll("'","%27")}') center/cover no-repeat`;
        return `<section id="${escapeHtml(block.anchor)}" class="sf-section sf-type-${block.type}" style="${blockStyle(block,site)}--hero-bg:${heroBg};--hero-min:${Number(d.minHeight)||680}px;"${attr}>
          <div class="sf-container sf-hero sf-align-${d.align || 'left'}">
            <div class="sf-hero-copy">${renderEyebrow(d.eyebrow)}<h1>${escapeHtml(d.title)}</h1><div class="sf-lead">${paragraphs(d.text)}</div>
              <div class="sf-actions"><a class="sf-btn sf-btn-primary" href="${escapeHtml(safeUrl(d.primaryLink))}">${escapeHtml(d.primaryText)}</a>${d.showSecondary ? `<a class="sf-btn sf-btn-secondary" href="${escapeHtml(safeUrl(d.secondaryLink))}">${escapeHtml(d.secondaryText)}</a>` : ''}</div>
            </div>
          </div>
        </section>`;
      }
      case 'text':
        return `<section ${common}><div class="sf-container"><div class="sf-text-block sf-align-${d.align || 'left'}" style="max-width:${Number(d.textWidth)||760}px">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2><div class="sf-rich">${paragraphs(d.text)}</div></div></div></section>`;
      case 'features':
        return `<section ${common}><div class="sf-container"><div class="sf-section-head">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2>${d.subtitle?`<p>${escapeHtml(d.subtitle)}</p>`:''}</div><div class="sf-grid sf-cols-${d.columns || 3}">${(d.items||[]).map(item=>`<article class="sf-card sf-feature"><div class="sf-feature-icon">${escapeHtml(item.icon)}</div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join('')}</div></div></section>`;
      case 'cards':
        return `<section ${common}><div class="sf-container"><div class="sf-section-head">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2>${d.subtitle?`<p>${escapeHtml(d.subtitle)}</p>`:''}</div><div class="sf-grid sf-cols-${d.columns||3}">${(d.items||[]).map(item=>`<article class="sf-card sf-project-card">${item.image?`<img class="sf-card-image" src="${escapeHtml(safeUrl(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy">`:''}<div class="sf-card-body">${item.tag?`<span class="sf-tag">${escapeHtml(item.tag)}</span>`:''}<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>${item.buttonText?`<a class="sf-text-link" href="${escapeHtml(safeUrl(item.buttonLink))}">${escapeHtml(item.buttonText)} <span>→</span></a>`:''}</div></article>`).join('')}</div></div></section>`;
      case 'stats':
        return `<section ${common}><div class="sf-container">${d.title?`<h2 class="sf-stats-title">${escapeHtml(d.title)}</h2>`:''}<div class="sf-grid sf-cols-${d.columns||4} sf-stats">${(d.items||[]).map(item=>`<div class="sf-stat"><strong>${escapeHtml(item.value)}</strong><span>${escapeHtml(item.label)}</span></div>`).join('')}</div></div></section>`;
      case 'gallery':
        return `<section ${common}><div class="sf-container"><div class="sf-section-head">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2>${d.subtitle?`<p>${escapeHtml(d.subtitle)}</p>`:''}</div><div class="sf-gallery sf-cols-${d.columns||3}">${(d.items||[]).map(item=> item.url ? `<figure><img src="${escapeHtml(safeUrl(item.url))}" alt="${escapeHtml(item.alt||'')}" loading="lazy"></figure>` : `<figure class="sf-image-placeholder">Добавьте URL изображения</figure>`).join('')}</div></div></section>`;
      case 'testimonials':
        return `<section ${common}><div class="sf-container"><div class="sf-section-head">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2></div><div class="sf-grid sf-cols-${d.columns||3}">${(d.items||[]).map(item=>`<article class="sf-card sf-testimonial"><div class="sf-quote">“</div><p>${escapeHtml(item.quote)}</p><div class="sf-person">${item.avatar?`<img src="${escapeHtml(safeUrl(item.avatar))}" alt="${escapeHtml(item.name)}">`:`<span class="sf-avatar-fallback">${escapeHtml((item.name||'?').slice(0,1))}</span>`}<div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.role)}</small></div></div></article>`).join('')}</div></div></section>`;
      case 'pricing':
        return `<section ${common}><div class="sf-container"><div class="sf-section-head">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2>${d.subtitle?`<p>${escapeHtml(d.subtitle)}</p>`:''}</div><div class="sf-grid sf-cols-${d.columns||3} sf-pricing">${(d.items||[]).map(item=>`<article class="sf-card sf-price ${item.featured?'featured':''}">${item.featured?'<span class="sf-popular">Популярный</span>':''}<h3>${escapeHtml(item.name)}</h3><p class="sf-price-desc">${escapeHtml(item.description||'')}</p><div class="sf-price-value"><strong>${escapeHtml(item.price)}</strong><span>${escapeHtml(item.period||'')}</span></div><ul>${(item.features||[]).map(f=>`<li>✓ ${escapeHtml(f)}</li>`).join('')}</ul><a class="sf-btn ${item.featured?'sf-btn-primary':'sf-btn-secondary'}" href="${escapeHtml(safeUrl(item.buttonLink))}">${escapeHtml(item.buttonText)}</a></article>`).join('')}</div></div></section>`;
      case 'faq':
        return `<section ${common}><div class="sf-container sf-narrow"><div class="sf-section-head">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2></div><div class="sf-faq">${(d.items||[]).map((item,i)=>`<details ${i===0?'open':''}><summary>${escapeHtml(item.question)}<span>+</span></summary><div>${paragraphs(item.answer)}</div></details>`).join('')}</div></div></section>`;
      case 'cta':
        return `<section ${common}><div class="sf-container"><div class="sf-cta sf-align-${d.align||'center'}" style="--cta-accent:${d.background2||site.accent}">${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2><p>${escapeHtml(d.text)}</p><a class="sf-btn sf-btn-light" href="${escapeHtml(safeUrl(d.buttonLink))}">${escapeHtml(d.buttonText)}</a></div></div></section>`;
      case 'contact':
        return `<section ${common}><div class="sf-container"><div class="sf-contact"><div>${renderEyebrow(d.eyebrow)}<h2>${escapeHtml(d.title)}</h2><div class="sf-rich">${paragraphs(d.text)}</div></div><div class="sf-contact-card"><a href="mailto:${escapeHtml(d.email)}"><small>E-mail</small><strong>${escapeHtml(d.email)}</strong></a><a href="tel:${escapeHtml(d.phone.replace(/[^+\d]/g,''))}"><small>Телефон</small><strong>${escapeHtml(d.phone)}</strong></a><div><small>Адрес</small><strong>${escapeHtml(d.address)}</strong></div><a class="sf-btn sf-btn-primary" href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.buttonText)}</a></div></div></div></section>`;
      case 'logos':
        return `<section ${common}><div class="sf-container"><div class="sf-logo-strip"><span>${escapeHtml(d.title)}</span><div>${(d.items||[]).map(item=>`<strong>${escapeHtml(item.name)}</strong>`).join('')}</div></div></div></section>`;
      case 'divider':
        return `<section ${common}><div class="sf-container"><hr class="sf-divider" style="width:${Number(d.width)||100}%;opacity:${(Number(d.opacity)||25)/100}"></div></section>`;
      case 'spacer':
        return `<section ${common}><div style="height:${Number(d.height)||80}px"></div></section>`;
      default: return '';
    }
  }

  function generateSiteHtml(p, builderMode = false) {
    const s = p.site;
    const visibleBlocks = p.blocks.filter(b => !b.hidden);
    const navBlocks = visibleBlocks.filter(b => b.showInNav && b.anchor);
    const fontFamilies = [...new Set([s.font, s.headingFont].filter(f => f && f !== 'system-ui'))];
    const fontImport = fontFamilies.length ? `@import url('https://fonts.googleapis.com/css2?${fontFamilies.map(f=>`family=${encodeURIComponent(f).replaceAll('%20','+')}:wght@400;500;600;700;800;900`).join('&')}&display=swap');` : '';
    const shadowMap = {
      none: 'none', soft: '0 12px 34px rgba(17,24,39,.08)', medium:'0 18px 45px rgba(17,24,39,.13)', strong:'0 24px 60px rgba(17,24,39,.20)'
    };
    const favicon = s.favicon ? `<link rel="icon" href="${escapeHtml(safeUrl(s.favicon))}">` : '';
    const header = s.header.enabled ? `<header class="sf-site-header ${s.header.sticky?'is-sticky':''}"><div class="sf-header-inner">${s.header.logoImage?`<a class="sf-logo" href="#"><img src="${escapeHtml(safeUrl(s.header.logoImage))}" alt="${escapeHtml(s.header.logoText)}"></a>`:`<a class="sf-logo" href="#">${escapeHtml(s.header.logoText)}</a>`}<button class="sf-menu-toggle" type="button" aria-label="Открыть меню">☰</button>${s.header.showNav?`<nav class="sf-nav">${navBlocks.map(b=>`<a href="#${escapeHtml(b.anchor)}">${escapeHtml(b.navLabel)}</a>`).join('')}</nav>`:''}${s.header.ctaText?`<a class="sf-btn sf-btn-primary sf-header-cta" href="${escapeHtml(safeUrl(s.header.ctaLink))}">${escapeHtml(s.header.ctaText)}</a>`:''}</div></header>`:'';
    const footer = s.footer.enabled ? `<footer class="sf-footer"><div class="sf-container sf-footer-inner"><div><strong>${escapeHtml(s.header.logoText || s.title)}</strong><p>${escapeHtml(s.footer.text)}</p>${s.footer.showCredit?'<small>Сделано в SiteForge</small>':''}</div><div class="sf-socials">${(s.footer.socials||[]).map(x=>`<a href="${escapeHtml(safeUrl(x.url))}" target="_blank" rel="noopener">${escapeHtml(x.label)}</a>`).join('')}</div></div></footer>`:'';
    const builderCss = builderMode ? `
      [data-sf-block-id]{position:relative;outline:1px solid transparent;outline-offset:-1px;transition:outline-color .12s,box-shadow .12s}
      [data-sf-block-id]:hover{outline-color:rgba(124,58,237,.55);box-shadow:inset 3px 0 0 rgba(124,58,237,.8)}
      [data-sf-block-id].sf-builder-selected{outline:2px solid #7c3aed!important;outline-offset:-2px;box-shadow:inset 4px 0 0 #7c3aed}
      a,button,summary{cursor:pointer}
    ` : '';
    const builderScript = builderMode ? `
      document.addEventListener('click',function(e){
        var block=e.target.closest('[data-sf-block-id]');
        if(!block)return;
        if(e.target.closest('a,button')) e.preventDefault();
        parent.postMessage({type:'siteforge-block-click',id:block.dataset.sfBlockId},'*');
      },true);
      window.addEventListener('message',function(e){
        if(!e.data||e.data.type!=='siteforge-select')return;
        document.querySelectorAll('.sf-builder-selected').forEach(function(x){x.classList.remove('sf-builder-selected')});
        if(e.data.id){var el=document.querySelector('[data-sf-block-id="'+e.data.id+'"]');if(el){el.classList.add('sf-builder-selected');el.scrollIntoView({block:'nearest',behavior:'smooth'});}}
      });
    ` : '';

    return `<!DOCTYPE html>
<html lang="${escapeHtml(s.language || 'ru')}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="description" content="${escapeHtml(s.description || '')}">
<meta name="generator" content="SiteForge v${APP_VERSION}">
<title>${escapeHtml(s.title || p.name)}</title>${favicon}
<style>
${fontImport}
:root{--sf-bg:${s.background};--sf-text:${s.text};--sf-muted:${s.muted};--sf-accent:${s.accent};--sf-accent-text:${s.accentText};--sf-surface:${s.surface};--sf-border:${s.border};--sf-radius:${Number(s.radius)||18}px;--sf-container:${Number(s.container)||1180}px;--sf-font:'${s.font}',system-ui,sans-serif;--sf-heading:'${s.headingFont}',var(--sf-font);--sf-heading-weight:${Number(s.headingWeight)||800};--sf-shadow:${shadowMap[s.shadow] || shadowMap.soft}}
*{box-sizing:border-box}html{${s.smoothScroll?'scroll-behavior:smooth;':''}scroll-padding-top:90px}body{margin:0;background:var(--sf-bg);color:var(--sf-text);font-family:var(--sf-font);font-size:16px;line-height:1.65;-webkit-font-smoothing:antialiased}a{color:inherit}img{max-width:100%}.sf-container{width:min(calc(100% - 40px),var(--sf-container));max-width:var(--sf-block-max,var(--sf-container));margin:0 auto}.sf-narrow{max-width:880px}.sf-section{padding:var(--sf-pt) 0 var(--sf-pb);background:var(--sf-block-bg);color:var(--sf-block-text);scroll-margin-top:78px}.sf-section h1,.sf-section h2,.sf-section h3{font-family:var(--sf-heading);font-weight:var(--sf-heading-weight);line-height:1.08;letter-spacing:-.035em;margin:0}.sf-section h1{font-size:clamp(3rem,7vw,6.8rem)}.sf-section h2{font-size:clamp(2rem,4.2vw,4.2rem)}.sf-section h3{font-size:1.25rem;letter-spacing:-.02em}.sf-eyebrow{margin-bottom:18px;color:var(--sf-accent);font-size:.77rem;font-weight:800;letter-spacing:.14em}.sf-lead,.sf-rich{color:color-mix(in srgb,currentColor 72%,transparent);font-size:clamp(1.05rem,1.6vw,1.28rem)}.sf-rich p,.sf-lead p{margin:0 0 1em}.sf-rich p:last-child,.sf-lead p:last-child{margin-bottom:0}.sf-site-header{position:relative;z-index:30;background:color-mix(in srgb,var(--sf-bg) 88%,transparent);border-bottom:1px solid var(--sf-border);backdrop-filter:blur(16px)}.sf-site-header.is-sticky{position:sticky;top:0}.sf-header-inner{width:min(calc(100% - 40px),var(--sf-container));height:74px;margin:0 auto;display:flex;align-items:center;gap:26px}.sf-logo{font-family:var(--sf-heading);font-weight:900;text-decoration:none;font-size:1.14rem;letter-spacing:-.03em;white-space:nowrap}.sf-logo img{display:block;max-height:38px;max-width:160px}.sf-nav{margin-left:auto;display:flex;align-items:center;gap:24px}.sf-nav a{color:var(--sf-muted);text-decoration:none;font-size:.88rem;font-weight:650}.sf-nav a:hover{color:var(--sf-text)}.sf-menu-toggle{display:none;border:0;background:transparent;color:var(--sf-text);font-size:1.25rem}.sf-btn{min-height:48px;padding:0 20px;border-radius:max(10px,calc(var(--sf-radius)*.65));display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;font-weight:800;font-size:.9rem;transition:.2s ease;border:1px solid transparent}.sf-btn:hover{transform:translateY(-2px)}.sf-btn-primary{background:var(--sf-accent);color:var(--sf-accent-text);box-shadow:0 10px 28px color-mix(in srgb,var(--sf-accent) 28%,transparent)}.sf-btn-secondary{border-color:var(--sf-border);background:color-mix(in srgb,var(--sf-surface) 82%,transparent);color:var(--sf-text)}.sf-btn-light{background:#fff;color:#17181d}.sf-header-cta{min-height:40px;padding-inline:16px;margin-left:8px}.sf-hero{min-height:var(--hero-min);display:flex;align-items:center}.sf-type-hero{background:var(--hero-bg)!important;color:#fff;overflow:hidden}.sf-hero-copy{max-width:850px}.sf-hero .sf-eyebrow{color:rgba(255,255,255,.68)}.sf-hero .sf-lead{max-width:720px;margin-top:26px;color:rgba(255,255,255,.76)}.sf-actions{display:flex;gap:11px;flex-wrap:wrap;margin-top:34px}.sf-align-center{text-align:center;margin-inline:auto}.sf-align-center .sf-lead,.sf-align-center .sf-rich{margin-inline:auto}.sf-align-center .sf-actions{justify-content:center}.sf-align-right{text-align:right;margin-left:auto}.sf-align-right .sf-actions{justify-content:flex-end}.sf-text-block{margin-inline:auto}.sf-section-head{max-width:760px;margin-bottom:42px}.sf-section-head>p{margin:16px 0 0;color:var(--sf-muted);font-size:1.08rem}.sf-grid{display:grid;gap:20px}.sf-cols-1{grid-template-columns:1fr}.sf-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sf-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.sf-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.sf-card{position:relative;border:1px solid var(--sf-border);border-radius:var(--sf-radius);background:var(--sf-surface);box-shadow:var(--sf-shadow);overflow:hidden}.sf-feature{padding:30px}.sf-feature-icon{width:48px;height:48px;display:grid;place-items:center;margin-bottom:26px;border-radius:14px;background:color-mix(in srgb,var(--sf-accent) 12%,var(--sf-surface));color:var(--sf-accent);font-size:1.3rem}.sf-feature p,.sf-project-card p,.sf-testimonial>p,.sf-price-desc{margin:12px 0 0;color:var(--sf-muted)}.sf-card-image{width:100%;height:220px;object-fit:cover;display:block}.sf-card-body{padding:25px}.sf-tag{display:inline-flex;margin-bottom:13px;padding:5px 9px;border-radius:999px;background:color-mix(in srgb,var(--sf-accent) 10%,var(--sf-surface));color:var(--sf-accent);font-size:.68rem;font-weight:800}.sf-text-link{display:inline-flex;gap:8px;margin-top:20px;color:var(--sf-accent);font-weight:800;text-decoration:none}.sf-stats-title{margin-bottom:28px!important}.sf-stats{gap:0;border:1px solid var(--sf-border);border-radius:var(--sf-radius);overflow:hidden;background:var(--sf-surface)}.sf-stat{padding:25px;border-right:1px solid var(--sf-border)}.sf-stat:last-child{border-right:0}.sf-stat strong{display:block;font-family:var(--sf-heading);font-size:clamp(1.8rem,3vw,3rem);line-height:1;font-weight:900}.sf-stat span{display:block;margin-top:9px;color:var(--sf-muted);font-size:.88rem}.sf-gallery{display:grid;gap:16px}.sf-gallery.sf-cols-2{grid-template-columns:repeat(2,1fr)}.sf-gallery.sf-cols-3{grid-template-columns:repeat(3,1fr)}.sf-gallery.sf-cols-4{grid-template-columns:repeat(4,1fr)}.sf-gallery figure{margin:0;aspect-ratio:4/3;border-radius:var(--sf-radius);overflow:hidden;background:var(--sf-surface)}.sf-gallery img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .35s}.sf-gallery figure:hover img{transform:scale(1.035)}.sf-image-placeholder{display:grid;place-items:center;color:var(--sf-muted);border:1px dashed var(--sf-border)}.sf-testimonial{padding:28px}.sf-quote{font-family:Georgia,serif;color:var(--sf-accent);font-size:3.5rem;line-height:.7}.sf-person{display:flex;align-items:center;gap:12px;margin-top:24px}.sf-person img,.sf-avatar-fallback{width:42px;height:42px;border-radius:50%;object-fit:cover}.sf-avatar-fallback{display:grid;place-items:center;background:var(--sf-accent);color:var(--sf-accent-text);font-weight:900}.sf-person strong,.sf-person small{display:block}.sf-person small{margin-top:2px;color:var(--sf-muted);font-size:.78rem}.sf-pricing{align-items:stretch}.sf-price{padding:30px;display:flex;flex-direction:column}.sf-price.featured{border-color:var(--sf-accent);box-shadow:0 18px 48px color-mix(in srgb,var(--sf-accent) 18%,transparent);transform:translateY(-8px)}.sf-popular{position:absolute;right:18px;top:18px;padding:5px 9px;border-radius:999px;background:var(--sf-accent);color:var(--sf-accent-text);font-size:.66rem;font-weight:900}.sf-price-value{display:flex;align-items:flex-end;gap:7px;margin:24px 0}.sf-price-value strong{font-family:var(--sf-heading);font-size:2.4rem;line-height:1;font-weight:900}.sf-price-value span{color:var(--sf-muted);font-size:.8rem}.sf-price ul{list-style:none;padding:0;margin:0 0 26px;display:grid;gap:9px;color:var(--sf-muted);font-size:.9rem}.sf-price .sf-btn{margin-top:auto}.sf-faq{border-top:1px solid var(--sf-border)}.sf-faq details{border-bottom:1px solid var(--sf-border)}.sf-faq summary{list-style:none;padding:22px 0;display:flex;align-items:center;justify-content:space-between;gap:18px;font-family:var(--sf-heading);font-size:1.08rem;font-weight:800;cursor:pointer}.sf-faq summary::-webkit-details-marker{display:none}.sf-faq summary span{color:var(--sf-accent);font-size:1.5rem;font-weight:400;transition:transform .2s}.sf-faq details[open] summary span{transform:rotate(45deg)}.sf-faq details>div{padding:0 0 24px;color:var(--sf-muted)}.sf-faq details p{margin:0}.sf-cta{padding:clamp(36px,6vw,76px);border-radius:calc(var(--sf-radius)*1.4);background:linear-gradient(135deg,var(--cta-accent),color-mix(in srgb,var(--cta-accent) 55%,#111827));color:#fff;overflow:hidden}.sf-cta .sf-eyebrow{color:rgba(255,255,255,.68)}.sf-cta p{max-width:700px;margin:18px auto 28px;color:rgba(255,255,255,.76);font-size:1.08rem}.sf-cta.sf-align-left p{margin-left:0}.sf-contact{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:60px;align-items:start}.sf-contact-card{padding:28px;border:1px solid var(--sf-border);border-radius:var(--sf-radius);background:var(--sf-surface);box-shadow:var(--sf-shadow);display:grid;gap:6px}.sf-contact-card>a:not(.sf-btn),.sf-contact-card>div{padding:13px 0;border-bottom:1px solid var(--sf-border);text-decoration:none}.sf-contact-card small,.sf-contact-card strong{display:block}.sf-contact-card small{color:var(--sf-muted);font-size:.72rem}.sf-contact-card strong{margin-top:4px}.sf-contact-card .sf-btn{margin-top:14px}.sf-logo-strip{display:flex;align-items:center;gap:30px}.sf-logo-strip>span{color:var(--sf-muted);font-size:.78rem;font-weight:800;white-space:nowrap}.sf-logo-strip>div{flex:1;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-around;gap:26px;color:color-mix(in srgb,var(--sf-text) 55%,transparent)}.sf-logo-strip strong{font-family:var(--sf-heading);letter-spacing:.08em}.sf-divider{margin:0 auto;border:0;border-top:1px solid var(--sf-border)}.sf-footer{padding:46px 0;background:color-mix(in srgb,var(--sf-bg) 94%,#000);border-top:1px solid var(--sf-border)}.sf-footer-inner{display:flex;align-items:flex-start;justify-content:space-between;gap:30px}.sf-footer strong{font-family:var(--sf-heading);font-size:1rem}.sf-footer p{margin:8px 0 0;color:var(--sf-muted);font-size:.84rem}.sf-footer small{display:block;margin-top:8px;color:var(--sf-muted);font-size:.7rem}.sf-socials{display:flex;gap:16px;flex-wrap:wrap}.sf-socials a{color:var(--sf-muted);text-decoration:none;font-size:.82rem;font-weight:700}.sf-socials a:hover{color:var(--sf-text)}
${builderCss}
${s.customCss || ''}
@media(max-width:900px){.sf-cols-4,.sf-cols-3{grid-template-columns:repeat(2,minmax(0,1fr))}.sf-contact{grid-template-columns:1fr;gap:34px}.sf-nav{display:none;position:absolute;top:74px;left:20px;right:20px;padding:18px;border:1px solid var(--sf-border);border-radius:var(--sf-radius);background:var(--sf-bg);box-shadow:var(--sf-shadow);flex-direction:column;align-items:flex-start}.sf-nav.open{display:flex}.sf-menu-toggle{display:block;margin-left:auto}.sf-header-cta{display:none}.sf-price.featured{transform:none}.sf-logo-strip{align-items:flex-start;flex-direction:column}}
@media(max-width:620px){.sf-container{width:min(calc(100% - 28px),var(--sf-container))}.sf-section{--sf-pt:min(var(--sf-pt),72px);--sf-pb:min(var(--sf-pb),72px)}.sf-section h1{font-size:clamp(2.6rem,15vw,4.2rem)}.sf-section h2{font-size:clamp(1.9rem,10vw,3rem)}.sf-cols-4,.sf-cols-3,.sf-cols-2{grid-template-columns:1fr}.sf-header-inner{width:calc(100% - 28px);height:66px}.sf-nav{top:66px;left:14px;right:14px}.sf-hero{min-height:min(var(--hero-min),760px)}.sf-actions{flex-direction:column;align-items:stretch}.sf-btn{width:100%}.sf-stat{border-right:0;border-bottom:1px solid var(--sf-border)}.sf-stat:last-child{border-bottom:0}.sf-gallery.sf-cols-2,.sf-gallery.sf-cols-3,.sf-gallery.sf-cols-4{grid-template-columns:1fr}.sf-contact{grid-template-columns:1fr}.sf-footer-inner{flex-direction:column}.sf-cta{padding:34px 24px}.sf-logo-strip>div{justify-content:flex-start}}
</style>
</head>
<body>
${header}
<main>${visibleBlocks.map(b => renderBlock(b,s,builderMode)).join('\n')}</main>
${footer}
<script>
(function(){var toggle=document.querySelector('.sf-menu-toggle'),nav=document.querySelector('.sf-nav');if(toggle&&nav){toggle.addEventListener('click',function(){nav.classList.toggle('open')});nav.addEventListener('click',function(e){if(e.target.closest('a'))nav.classList.remove('open')})}${builderScript}})();
<\/script>
</body></html>`;
  }

  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportHtml() {
    persistNow();
    const filename = `${slugify(project.name || 'site')}.html`;
    downloadFile(filename, generateSiteHtml(project, false), 'text/html;charset=utf-8');
    toast('HTML готов', `Скачан файл ${filename}`, 'success');
  }

  function exportProject() {
    persistNow();
    const filename = `${slugify(project.name || 'site')}.siteforge.json`;
    downloadFile(filename, JSON.stringify(project, null, 2), 'application/json;charset=utf-8');
    toast('Резервная копия готова', filename, 'success');
  }

  async function importProject(file) {
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      if (!raw || !Array.isArray(raw.blocks) || !raw.site) throw new Error('Неверный формат проекта');
      persistNow();
      const imported = normalizeProject(raw);
      imported.id = uid('project');
      imported.name = `${raw.name || 'Импортированный сайт'} — импорт`;
      imported.createdAt = Date.now(); imported.updatedAt = Date.now();
      project = imported; selectedBlockId = null;
      resetHistory(); persistNow(); refreshAll();
      toast('Проект импортирован', 'Создана отдельная локальная копия.', 'success');
    } catch (error) {
      toast('Не удалось импортировать', error.message || 'Проверьте JSON-файл.', 'error');
    } finally {
      $('#projectFileInput').value = '';
    }
  }

  function toast(title, text = '', type = 'success') {
    const icon = type === 'success' ? '✓' : type === 'warning' ? '!' : type === 'error' ? '×' : 'i';
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<div class="toast-row"><span class="toast-icon">${icon}</span><div class="toast-copy"><strong>${escapeHtml(title)}</strong>${text ? `<span>${escapeHtml(text)}</span>` : ''}</div></div>`;
    $('#toastRegion').appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; setTimeout(()=>el.remove(),180); }, 3600);
  }

  function openModal(id) {
    $('#modalBackdrop').hidden = false;
    $(id).hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModals() {
    $('#modalBackdrop').hidden = true;
    $$('.modal').forEach(m => m.hidden = true);
    document.body.style.overflow = '';
    confirmCallback = null;
  }

  function confirmAction(title, text, callback) {
    $('#confirmTitle').textContent = title;
    $('#confirmText').textContent = text;
    confirmCallback = callback;
    openModal('#confirmModal');
  }

  function setDevice(next) {
    device = next;
    $$('.device-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.device === device));
    $('#canvasFrame').className = `canvas-frame ${device}`;
    if (device !== 'desktop' && zoom > 1) setZoom(1);
  }

  function setZoom(next) {
    zoom = Math.max(.5, Math.min(1.25, Math.round(next * 20) / 20));
    $('#canvasFrame').style.transform = `scale(${zoom})`;
    $('#zoomResetBtn').textContent = `${Math.round(zoom * 100)}%`;
  }

  function renderPageSettings() {
    selectedBlockId = null;
    inspectorTab = 'content';
    $$('.inspector-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.inspectorTab === inspectorTab));
    renderStructure(); renderInspector(); postSelectionToPreview();
    if (window.innerWidth <= 980) $('#rightSidebar').classList.add('open');
    else document.body.classList.remove('v8-right-collapsed');
  }

  function setupEvents() {
    document.addEventListener('click', (e) => {
      const add = e.target.closest('[data-add-block]'); if (add) return addBlock(add.dataset.addBlock);
      const apply = e.target.closest('[data-apply-template]'); if (apply) return applyTemplate(apply.dataset.applyTemplate);
      const select = e.target.closest('[data-select-block]'); if (select) return selectBlock(select.dataset.selectBlock);
      const dup = e.target.closest('[data-duplicate-block]'); if (dup) return duplicateBlock(dup.dataset.duplicateBlock);
      const del = e.target.closest('[data-delete-block]'); if (del) return deleteBlock(del.dataset.deleteBlock);
      const toggle = e.target.closest('[data-toggle-block]'); if (toggle) {
        const block = project.blocks.find(b => b.id === toggle.dataset.toggleBlock); if (!block) return;
        block.hidden = !block.hidden; commitSnapshot(); refreshAll(); return;
      }
      const openProject = e.target.closest('[data-open-project]'); if (openProject) return switchProject(openProject.dataset.openProject);
      const deleteProjectBtn = e.target.closest('[data-delete-project]'); if (deleteProjectBtn) return deleteProject(deleteProjectBtn.dataset.deleteProject);
      const close = e.target.closest('[data-close-modal]'); if (close) return closeModals();
      const uploadButton = e.target.closest('[data-upload-path]'); if (uploadButton) {
        const path = uploadButton.dataset.uploadPath;
        const picker = document.createElement('input');
        picker.type = 'file'; picker.accept = 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml';
        picker.addEventListener('change', () => {
          const file = picker.files?.[0]; if (!file) return;
          if (file.size > 4 * 1024 * 1024) return toast('Файл слишком большой', 'Для проекта лучше использовать изображение до 4 МБ.', 'warning');
          const reader = new FileReader();
          reader.onload = () => {
            const block = selectedBlock();
            if (block && !path.startsWith('site.')) setPath(block, path, reader.result); else setPath(project, path, reader.result);
            commitSnapshot(); renderInspector(); scheduleRender();
            toast('Изображение добавлено', file.name, 'success');
          };
          reader.readAsDataURL(file);
        }, { once:true });
        picker.click();
        return;
      }

      const moveItemBtn = e.target.closest('[data-move-item]'); if (moveItemBtn) {
        const block = selectedBlock(); if (!block?.data?.items) return;
        const i = Number(moveItemBtn.dataset.index), dir = Number(moveItemBtn.dataset.moveItem), n = i + dir;
        if (n < 0 || n >= block.data.items.length) return;
        [block.data.items[i], block.data.items[n]] = [block.data.items[n], block.data.items[i]];
        commitSnapshot(); renderInspector(); scheduleRender(); return;
      }
      const removeItemBtn = e.target.closest('[data-remove-item]'); if (removeItemBtn) {
        const block = selectedBlock(); if (!block?.data?.items) return;
        const i = Number(removeItemBtn.dataset.index); block.data.items.splice(i,1); commitSnapshot(); renderInspector(); scheduleRender(); return;
      }
      const addItemBtn = e.target.closest('[data-add-item]'); if (addItemBtn) {
        const block = selectedBlock(); const factory = block && itemFactories[block.type]; if (!factory) return;
        block.data.items ||= []; block.data.items.push(factory()); commitSnapshot(); renderInspector(); scheduleRender(); return;
      }
      const removeSimple = e.target.closest('[data-remove-simple]'); if (removeSimple) {
        const arr = getPath(project, removeSimple.dataset.removeSimple); if (!Array.isArray(arr)) return;
        arr.splice(Number(removeSimple.dataset.index),1); commitSnapshot(); renderInspector(); scheduleRender(); return;
      }
      const addSimple = e.target.closest('[data-add-simple]'); if (addSimple) {
        if (addSimple.dataset.addSimple === 'social') project.site.footer.socials.push({label:'Новая ссылка',url:'#'});
        commitSnapshot(); renderInspector(); scheduleRender(); return;
      }
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (action) {
        const block = selectedBlock();
        if (action === 'duplicate-selected' && block) return duplicateBlock(block.id);
        if (action === 'delete-selected' && block) return deleteBlock(block.id);
        if (action === 'move-up' && block) return moveBlock(block.id,-1);
        if (action === 'move-down' && block) return moveBlock(block.id,1);
        if (action === 'export-project') return exportProject();
        if (action === 'open-projects') { renderSavedProjects(); return openModal('#projectsModal'); }
      }
    });

    $('#inspectorContent').addEventListener('input', (e) => {
      if (handleColorTextInput(e, false)) return;
      handleInspectorInput(e, false);
    });
    $('#inspectorContent').addEventListener('change', (e) => {
      if (handleColorTextInput(e, true)) return;
      handleInspectorInput(e, true);
    });

    $('#blockSearch').addEventListener('input', (e) => renderBlockLibrary(e.target.value));
    $$('.sidebar-tab').forEach(btn => btn.addEventListener('click', () => {
      $$('.sidebar-tab').forEach(x => x.classList.remove('active')); btn.classList.add('active');
      $$('.sidebar-content').forEach(x => x.classList.toggle('active', x.dataset.leftPanel === btn.dataset.leftTab));
    }));
    $$('.inspector-tab').forEach(btn => btn.addEventListener('click', () => {
      inspectorTab = btn.dataset.inspectorTab;
      $$('.inspector-tab').forEach(x => x.classList.toggle('active', x === btn));
      renderInspector();
    }));

    $('#projectName').addEventListener('input', (e) => {
      project.name = e.target.value || 'Без названия'; setSaveState('Есть изменения', 'dirty'); schedulePersist();
    });
    $('#projectName').addEventListener('change', () => commitSnapshot());

    $('#undoBtn').addEventListener('click', undo);
    $('#redoBtn').addEventListener('click', redo);
    $('#exportHtmlBtn').addEventListener('click', exportHtml);
    $('#previewDownloadBtn').addEventListener('click', exportHtml);
    $('#exportProjectBtn').addEventListener('click', exportProject);
    $('#importProjectBtn').addEventListener('click', () => $('#projectFileInput').click());
    $('#projectFileInput').addEventListener('change', (e) => e.target.files?.[0] && importProject(e.target.files[0]));
    $('#projectsBtn').addEventListener('click', () => { renderSavedProjects(); openModal('#projectsModal'); });
    $('#newProjectBtn').addEventListener('click', createNewProject);
    $('#openPageSettingsBtn').addEventListener('click', renderPageSettings);
    $('#previewBtn').addEventListener('click', () => { $('#fullPreviewFrame').srcdoc = generateSiteHtml(project,false); openModal('#previewModal'); });
    $('#modalBackdrop').addEventListener('click', closeModals);
    $('#confirmAcceptBtn').addEventListener('click', () => { const cb = confirmCallback; closeModals(); if (cb) cb(); });

    $$('.device-btn').forEach(btn => btn.addEventListener('click', () => setDevice(btn.dataset.device)));
    $('#zoomOutBtn').addEventListener('click', () => setZoom(zoom - .1));
    $('#zoomInBtn').addEventListener('click', () => setZoom(zoom + .1));
    $('#zoomResetBtn').addEventListener('click', () => setZoom(1));

    $('#mobileMenuBtn').addEventListener('click', () => $('#leftSidebar').classList.toggle('open'));
    $('#rightCloseBtn').addEventListener('click', () => {
      const right = $('#rightSidebar');
      if (window.innerWidth <= 980) right.classList.remove('open');
      else document.body.classList.add('v8-right-collapsed');
    });

    window.addEventListener('message', (e) => {
      if (e.data?.type === 'siteforge-block-click' && e.data.id) selectBlock(e.data.id);
    });

    document.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); redo(); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); persistNow(); toast('Проект сохранён', 'Локальная копия обновлена.', 'success'); }
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') { e.preventDefault(); exportHtml(); }
      else if (e.key === 'Escape') { closeModals(); $('#leftSidebar').classList.remove('open'); $('#rightSidebar').classList.remove('open'); if (window.innerWidth > 980) document.body.classList.add('v8-right-collapsed'); }
      else if (!typing && (e.key === 'Delete' || e.key === 'Backspace') && selectedBlock()) {
        e.preventDefault();
        deleteBlock(selectedBlockId);
      }
    });

    window.addEventListener('beforeunload', persistNow);
  }

  function init() {
    project = bootstrapProject();
    renderBlockLibrary();
    renderTemplates();
    resetHistory();
    setupEvents();
    refreshAll();
    setDevice('desktop');
    setZoom(1);
    setSaveState('Сохранено');
  }

  init();
})();
