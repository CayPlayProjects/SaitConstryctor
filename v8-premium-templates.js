(() => {
  'use strict';

  const STORAGE_KEY = 'siteforge_v7_projects';
  const ACTIVE_KEY = 'siteforge_v7_active_project';
  const $ = (s, r = document) => r.querySelector(s);
  const uid = (p = 'id') => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const THEMES = {
    business: `.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"";position:absolute;width:540px;height:540px;right:-120px;top:-150px;border-radius:50%;background:radial-gradient(circle,rgba(60,198,255,.38),rgba(103,87,255,.12) 50%,transparent 70%)}.sf-type-hero:after{content:"NOVA / 26";position:absolute;right:4vw;bottom:4vw;color:rgba(255,255,255,.08);font:900 clamp(4rem,10vw,10rem)/.8 var(--sf-heading);letter-spacing:-.07em}.sf-hero-copy{position:relative;z-index:1;max-width:820px}.sf-card{transition:.22s ease}.sf-card:hover{transform:translateY(-6px);border-color:color-mix(in srgb,var(--sf-accent) 28%,var(--sf-border));box-shadow:0 24px 56px rgba(17,24,39,.13)}`,
    portfolio: `.sf-site-header{background:rgba(14,16,20,.88)}.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 0 55%,rgba(255,112,56,.09)),repeating-linear-gradient(90deg,transparent 0 79px,rgba(255,255,255,.035) 80px)}.sf-type-hero:after{content:"SELECTED WORK";position:absolute;right:-36px;top:50%;transform:rotate(90deg);color:rgba(255,255,255,.16);font:800 .72rem var(--sf-heading);letter-spacing:.28em}.sf-hero-copy{position:relative;z-index:1}.sf-gallery figure:nth-child(2){transform:translateY(24px)}.sf-card{background:#171a20;border-color:#292d35}`,
    product: `.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"";position:absolute;right:3%;top:8%;width:min(46vw,590px);aspect-ratio:1;border-radius:34px;background:linear-gradient(145deg,rgba(66,227,178,.20),rgba(47,126,255,.07));border:1px solid rgba(255,255,255,.12);box-shadow:0 34px 90px rgba(0,0,0,.25);transform:rotate(-6deg)}.sf-type-hero:after{content:"01 • 02 • 03";position:absolute;right:9%;bottom:12%;padding:12px 17px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:rgba(5,24,26,.48);color:rgba(255,255,255,.7);font:700 .72rem var(--sf-font);letter-spacing:.14em}.sf-hero-copy{position:relative;z-index:1;max-width:760px}.sf-card{background:#10272b;border-color:#1e3b40}`,
    event: `.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 25%,rgba(255,53,199,.33),transparent 24%),radial-gradient(circle at 65% 72%,rgba(103,83,255,.28),transparent 27%)}.sf-type-hero:after{content:"12 / 09";position:absolute;right:4vw;bottom:2vw;color:rgba(255,255,255,.10);font:900 clamp(5rem,15vw,15rem)/.75 var(--sf-heading);letter-spacing:-.08em}.sf-hero-copy{position:relative;z-index:1;max-width:850px}.sf-card{background:#17132a;border-color:#30274a}.sf-feature-icon{background:#251c43}.sf-price.featured{background:#251440}`,
    starter: `.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"";position:absolute;width:460px;height:460px;right:-80px;top:-130px;border-radius:50%;background:radial-gradient(circle,rgba(59,196,255,.42),rgba(83,109,254,.12) 52%,transparent 70%)}.sf-type-hero:after{content:"";position:absolute;right:7%;bottom:12%;width:260px;height:170px;border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.17),rgba(255,255,255,.05));border:1px solid rgba(255,255,255,.18);box-shadow:0 30px 70px rgba(0,0,0,.18);transform:rotate(5deg)}.sf-hero-copy{position:relative;z-index:1;max-width:760px}`,
    store: `.sf-site-header{background:rgba(255,250,244,.92)}.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"NEW DROP";position:absolute;right:5%;top:16%;color:rgba(255,255,255,.14);font:900 clamp(4rem,9vw,9rem)/.8 var(--sf-heading);letter-spacing:-.06em}.sf-type-hero:after{content:"✦";position:absolute;right:12%;bottom:10%;width:116px;height:116px;display:grid;place-items:center;border-radius:50%;background:#fff;color:#17120f;font-size:2rem;box-shadow:0 24px 60px rgba(71,45,26,.24)}.sf-hero-copy{position:relative;z-index:1;max-width:760px}.sf-card{background:#fffdf9}`,
    creator: `.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 82% 28%,rgba(38,200,255,.22),transparent 24%),radial-gradient(circle at 70% 72%,rgba(139,92,246,.32),transparent 29%)}.sf-type-hero:after{content:"LIVE • CREATE • PLAY";position:absolute;right:5%;bottom:7%;color:rgba(255,255,255,.14);font:900 clamp(1.5rem,4.4vw,4.4rem) var(--sf-heading)}.sf-hero-copy{position:relative;z-index:1}.sf-card{background:#151229;border-color:#30294f}`,
    restaurant: `.sf-site-header{background:rgba(247,242,231,.92)}.sf-type-hero{position:relative;isolation:isolate}.sf-type-hero:before{content:"";position:absolute;right:5%;top:12%;width:min(38vw,470px);aspect-ratio:1;border-radius:50%;border:1px solid rgba(255,255,255,.18);box-shadow:inset 0 0 0 26px rgba(255,255,255,.035),0 30px 80px rgba(18,22,13,.25)}.sf-type-hero:after{content:"SORA";position:absolute;right:8%;bottom:8%;color:rgba(255,255,255,.10);font:900 clamp(5rem,12vw,12rem)/.8 var(--sf-heading);letter-spacing:-.08em}.sf-hero-copy{position:relative;z-index:1;max-width:740px}.sf-card{background:#fbf8ef}`
  };

  const baseSite = (o = {}) => ({
    title: 'Новый сайт', description: 'Современный сайт', language: 'ru',
    background: '#f8faff', text: '#11162a', muted: '#69738e', accent: '#536dfe', accentText: '#ffffff',
    surface: '#ffffff', border: '#e4e8f3', radius: 20, container: 1180,
    font: 'Manrope', headingFont: 'Manrope', headingWeight: 800, sectionGap: 0, buttonStyle: 'solid', shadow: 'soft', smoothScroll: true,
    header: { enabled: true, sticky: true, logoText: 'YOUR BRAND', logoImage: '', showNav: true, ctaText: 'Связаться', ctaLink: '#contact', transparent: false },
    footer: { enabled: true, text: '© 2026 Ваш бренд.', showCredit: false, socials: [{label:'Telegram',url:'https://t.me/'},{label:'VK',url:'https://vk.com/'}] },
    customCss: '', ...o
  });

  const blk = (type, data = {}, extra = {}) => ({ id: uid('block'), type, ...extra, data });
  const project = (name, site, blocks) => ({ version: 8, id: uid('project'), name, createdAt: Date.now(), updatedAt: Date.now(), site, blocks });

  const templates = [
    {
      id:'business', name:'Бизнес Pro', tag:'Популярный', note:'Agency / Business', title:'NOVA', bg:'linear-gradient(135deg,#0f1d3a,#635bff 55%,#27b9ff)', desc:'Услуги, кейсы, цифры, отзывы и цены — готовый сайт компании.',
      build:()=>project('Nova Studio',baseSite({title:'Nova Studio — цифровые продукты',description:'Дизайн и разработка цифровых продуктов для бизнеса.',background:'#f7f8fc',text:'#121526',muted:'#69718a',accent:'#6757ff',surface:'#fff',border:'#e6e8f1',radius:22,customCss:THEMES.business,header:{enabled:true,sticky:true,logoText:'NOVA',showNav:true,ctaText:'Обсудить проект',ctaLink:'#contact'}}),[
        blk('hero',{eyebrow:'DIGITAL STUDIO · 2026',title:'Превращаем идеи в продукты, которыми хочется пользоваться',text:'Стратегия, дизайн и разработка в одной команде. Запускаем сайты и цифровые сервисы без хаоса и бесконечных согласований.',primaryText:'Обсудить проект',primaryLink:'#contact',secondaryText:'Смотреть услуги',secondaryLink:'#services',showSecondary:true,align:'left',minHeight:720,backgroundMode:'gradient',background:'#101a35',background2:'#5c4fe7'}),
        blk('logos',{title:'Работали с командами',items:[{name:'NORTH'},{name:'KITE'},{name:'AURA'},{name:'RATIO'},{name:'MOTION'}]}),
        blk('features',{eyebrow:'ПОЧЕМУ NOVA',title:'Одна команда — весь путь от идеи до запуска',subtitle:'Фокусируемся на результате, а не на количестве экранов.',columns:3,items:[{icon:'01',title:'Стратегия',text:'Разбираемся в задаче и целях до первого макета.'},{icon:'02',title:'Дизайн',text:'Создаём понятный интерфейс и сильную визуальную систему.'},{icon:'03',title:'Разработка',text:'Собираем быстрый адаптивный продукт и запускаем.'}]},{anchor:'services',navLabel:'Услуги',showInNav:true}),
        blk('cards',{eyebrow:'ИЗБРАННЫЕ ПРОЕКТЫ',title:'Работы, которыми мы гордимся',subtitle:'Несколько направлений — от корпоративных сайтов до сервисов.',columns:3,items:[{tag:'FINTECH',title:'Orbit Finance',text:'Продуктовый сайт и новый личный кабинет.',buttonText:'Смотреть кейс',buttonLink:'#contact'},{tag:'RETAIL',title:'Mellow Store',text:'E-commerce с новым позиционированием.',buttonText:'Смотреть кейс',buttonLink:'#contact'},{tag:'MEDIA',title:'Pulse',text:'Платформа для контента и мобильного UX.',buttonText:'Смотреть кейс',buttonLink:'#contact'}]},{anchor:'cases',navLabel:'Кейсы',showInNav:true}),
        blk('stats',{columns:4,items:[{value:'42',label:'проекта запущено'},{value:'4.9/5',label:'средняя оценка'},{value:'18 дней',label:'до первого релиза'},{value:'87%',label:'клиентов возвращаются'}]}),
        blk('testimonials',{eyebrow:'ОТЗЫВЫ',title:'С нами спокойно даже в сложных проектах',columns:3,items:[{quote:'Команда быстро поняла задачу и сделала сильнее нашего первоначального видения.',name:'Анна Волкова',role:'CMO, North'},{quote:'Дизайн красивый, а разработка не превращает его в компромисс.',name:'Максим Орлов',role:'Founder, Orbit'},{quote:'Запустились раньше срока и без бесконечного списка правок.',name:'Ирина Соколова',role:'Product Lead, Aura'}]}),
        blk('contact',{eyebrow:'НАЧНЁМ?',title:'Расскажите, что хотите запустить',text:'Опишите задачу в двух-трёх предложениях — предложим формат и следующий шаг.',email:'hello@nova.studio',phone:'+7 (900) 555-21-21',address:'Работаем удалённо',buttonText:'Написать нам'},{anchor:'contact',navLabel:'Контакты',showInNav:true})
      ])
    },
    {
      id:'portfolio',name:'Портфолио',tag:'Креативный',note:'Selected work',title:'ALEX',bg:'linear-gradient(135deg,#111318,#ff6c2d)',desc:'Для дизайнера, разработчика, фотографа или автора.',
      build:()=>project('Alex — Portfolio',baseSite({title:'Alex — Designer & Developer',background:'#0e1014',text:'#f6f3ee',muted:'#9ca0aa',accent:'#ff7038',accentText:'#111318',surface:'#171a20',border:'#292d35',radius:14,shadow:'none',customCss:THEMES.portfolio,header:{enabled:true,sticky:true,logoText:'ALEX /',showNav:true,ctaText:'Написать',ctaLink:'#contact'}}),[
        blk('hero',{eyebrow:'DESIGNER + DEVELOPER',title:'Создаю цифровые вещи с характером',text:'Интерфейсы, сайты и визуальные системы. Люблю ясные идеи, сильную типографику и детали.',primaryText:'Смотреть работы',primaryLink:'#work',secondaryText:'Обо мне',secondaryLink:'#about',showSecondary:true,align:'left',minHeight:760,backgroundMode:'gradient',background:'#111318',background2:'#9b371a'}),
        blk('text',{eyebrow:'КОРОТКО ОБО МНЕ',title:'Дизайн, который работает, и код, который не мешает',text:'Помогаю продуктовым командам превращать сложные идеи в понятные интерфейсы.\n\nРаботаю на стыке UX, визуального дизайна и фронтенда.',align:'left',textWidth:880},{anchor:'about',navLabel:'Обо мне',showInNav:true}),
        blk('gallery',{eyebrow:'SELECTED WORK',title:'Последние проекты',subtitle:'Продукты, айдентика и эксперименты.',columns:3},{anchor:'work',navLabel:'Работы',showInNav:true}),
        blk('stats',{columns:4,items:[{value:'6+',label:'лет в дизайне'},{value:'70+',label:'запусков'},{value:'12',label:'наград'},{value:'4.9',label:'оценка клиентов'}]}),
        blk('contact',{eyebrow:'LET’S TALK',title:'Есть идея? Давайте сделаем её сильнее',text:'Открыт для интересных продуктовых задач и коллабораций.',email:'hello@alex.design',phone:'+7 (900) 321-44-55',address:'Remote / Europe',buttonText:'Написать'},{anchor:'contact',showInNav:true,navLabel:'Контакты'})
      ])
    },
    {
      id:'product',name:'SaaS / App',tag:'Продукт',note:'Product / SaaS',title:'ORBIT',bg:'linear-gradient(135deg,#071d20,#17a48e 55%,#3ae7bb)',desc:'Для сервиса, приложения или технологического стартапа.',
      build:()=>project('Orbit — SaaS',baseSite({title:'Orbit — рабочее пространство команды',background:'#0a1b1e',text:'#eefaf7',muted:'#93b5af',accent:'#42e3b2',accentText:'#08201b',surface:'#10272b',border:'#1e3b40',shadow:'none',customCss:THEMES.product,header:{enabled:true,sticky:true,logoText:'ORBIT',showNav:true,ctaText:'Попробовать',ctaLink:'#pricing'}}),[
        blk('hero',{eyebrow:'ORBIT 3.0',title:'Вся работа команды — в одном спокойном пространстве',text:'Задачи, документы, решения и прогресс без десяти вкладок и бесконечных сообщений.',primaryText:'Попробовать бесплатно',primaryLink:'#pricing',secondaryText:'Возможности',secondaryLink:'#features',showSecondary:true,align:'left',minHeight:740,backgroundMode:'gradient',background:'#071a1d',background2:'#126b65'}),
        blk('features',{eyebrow:'ОДНО МЕСТО',title:'Меньше переключений — больше фокуса',subtitle:'Основные рабочие процессы в одном понятном интерфейсе.',columns:3,items:[{icon:'✓',title:'Задачи',text:'Сроки, ответственные и приоритеты с первого взгляда.'},{icon:'⌘',title:'Документы',text:'Заметки и решения всегда связаны с реальной работой.'},{icon:'↗',title:'Прогресс',text:'Понятные отчёты без ручных таблиц.'}]},{anchor:'features',showInNav:true,navLabel:'Возможности'}),
        blk('stats',{columns:4,items:[{value:'34%',label:'меньше встреч'},{value:'2.4×',label:'быстрее поиск'},{value:'18k+',label:'команд'},{value:'99.98%',label:'uptime'}]}),
        blk('pricing',{eyebrow:'ТАРИФЫ',title:'Начните бесплатно, растите без ограничений',subtitle:'Без карты на старте.',columns:3},{anchor:'pricing',showInNav:true,navLabel:'Цены'}),
        blk('faq',{eyebrow:'FAQ',title:'Частые вопросы'},{anchor:'faq',showInNav:true,navLabel:'FAQ'}),
        blk('cta',{eyebrow:'ГОТОВЫ?',title:'Соберите работу команды в одном месте',text:'Создайте пространство Orbit за минуту.',buttonText:'Начать бесплатно',buttonLink:'#pricing',align:'center',background2:'#21b899'})
      ])
    },
    {
      id:'event',name:'Событие',tag:'Event',note:'12 SEP / 19:00',title:'DIGITAL NIGHT',bg:'linear-gradient(135deg,#16071f,#7a1a8f 52%,#ff35c7)',desc:'Конференция, фестиваль, стрим или закрытый ивент.',
      build:()=>project('Digital Night 2026',baseSite({title:'Digital Night 2026',background:'#0b0914',text:'#f7f2ff',muted:'#aaa0bd',accent:'#ef3bd3',accentText:'#120914',surface:'#17132a',border:'#30274a',shadow:'none',customCss:THEMES.event,header:{enabled:true,sticky:true,logoText:'DIGITAL NIGHT',showNav:true,ctaText:'Регистрация',ctaLink:'#tickets'}}),[
        blk('hero',{eyebrow:'12 СЕНТЯБРЯ · 19:00',title:'Digital Night — один вечер, после которого хочется делать',text:'Дизайн, технологии, честные истории запусков и люди, которые создают новое.',primaryText:'Забронировать место',primaryLink:'#tickets',secondaryText:'Смотреть программу',secondaryLink:'#program',showSecondary:true,align:'left',minHeight:760,backgroundMode:'gradient',background:'#14071f',background2:'#6f177d'}),
        blk('stats',{columns:4,items:[{value:'6',label:'спикеров'},{value:'4.5 ч',label:'программы'},{value:'350',label:'гостей'},{value:'1',label:'сильный вечер'}]}),
        blk('features',{eyebrow:'PROGRAM',title:'Не лекции ради лекций',subtitle:'Короткие выступления, реальные кейсы и время поговорить.',columns:3,items:[{icon:'19:00',title:'Как запускать',text:'Что делать, когда идеального момента не будет.'},{icon:'20:10',title:'Как расти',text:'Путь продукта от первой версии до большой аудитории.'},{icon:'21:20',title:'Как не выгореть',text:'Разговор о темпе, команде и любопытстве.'}]},{anchor:'program',showInNav:true,navLabel:'Программа'}),
        blk('cards',{eyebrow:'SPEAKERS',title:'Люди, которые покажут процесс изнутри',subtitle:'Опыт, ошибки и выводы без рекламных презентаций.',columns:3,items:[{tag:'PRODUCT',title:'Лена Миронова',text:'Product Director · запуск сложных продуктов.',buttonText:'19:00',buttonLink:'#tickets'},{tag:'DESIGN',title:'Илья Морозов',text:'Creative Lead · визуальный язык брендов.',buttonText:'20:10',buttonLink:'#tickets'},{tag:'FOUNDERS',title:'Артём Левин',text:'Founder · рост команды и сложные решения.',buttonText:'21:20',buttonLink:'#tickets'}]}),
        blk('pricing',{eyebrow:'TICKETS',title:'Выберите формат вечера',subtitle:'Количество офлайн-мест ограничено.',columns:3},{anchor:'tickets',showInNav:true,navLabel:'Билеты'}),
        blk('faq',{eyebrow:'FAQ',title:'Перед тем как прийти'}),
        blk('contact',{eyebrow:'ВОПРОСЫ',title:'Нужно уточнить детали?',text:'Ответим по билетам, партнёрству и участию.',email:'hello@digitalnight.events',phone:'+7 (900) 202-09-12',address:'Москва',buttonText:'Написать организаторам'},{anchor:'contact',showInNav:true,navLabel:'Контакты'})
      ])
    },
    {
      id:'starter',name:'Быстрый старт',tag:'Рекомендуем',note:'Start in minutes',title:'YOUR BRAND',bg:'linear-gradient(135deg,#152447,#536dfe 55%,#27c2ff)',desc:'Универсальная основа, которую легко переделать под себя.',
      build:()=>project('Новый сайт',baseSite({customCss:THEMES.starter}),[
        blk('hero',{eyebrow:'ВАШ ПРОЕКТ · 2026',title:'Сильная идея заслуживает понятной подачи',text:'Расскажите, чем вы занимаетесь, для кого и почему посетителю стоит остаться.',primaryText:'Главное действие',primaryLink:'#features',secondaryText:'Узнать больше',secondaryLink:'#about',showSecondary:true,align:'left',minHeight:680,backgroundMode:'gradient',background:'#18264d',background2:'#536dfe'}),
        blk('features',{eyebrow:'ПОЧЕМУ ВЫ',title:'Три причины выбрать ваш проект',subtitle:'Замените пункты на реальные преимущества.',columns:3,items:[{icon:'01',title:'Понятно',text:'Объясните ценность простыми словами.'},{icon:'02',title:'Удобно',text:'Покажите, как легко начать.'},{icon:'03',title:'Надёжно',text:'Добавьте факт, гарантию или показатель.'}]},{anchor:'features',showInNav:true,navLabel:'Возможности'}),
        blk('text',{eyebrow:'О ПРОЕКТЕ',title:'Расскажите историю чуть подробнее',text:'Здесь можно объяснить подход, миссию или ключевую идею.',align:'left',textWidth:860},{anchor:'about',showInNav:true,navLabel:'О проекте'}),
        blk('cta',{eyebrow:'СЛЕДУЮЩИЙ ШАГ',title:'Подскажите посетителю, что сделать дальше',text:'Хороший сайт ведёт человека к понятному действию.',buttonText:'Связаться',buttonLink:'#contact',align:'center',background2:'#536dfe'}),
        blk('contact',{eyebrow:'КОНТАКТЫ',title:'Давайте быть на связи',text:'Замените контакты на свои.',email:'hello@example.com',phone:'+7 (900) 000-00-00',address:'Ваш город / онлайн',buttonText:'Написать'},{anchor:'contact',showInNav:true,navLabel:'Контакты'})
      ])
    },
    {
      id:'store',name:'Магазин',tag:'E-commerce',note:'New collection',title:'MELLOW',bg:'linear-gradient(135deg,#40251c,#cf7449 55%,#f2c29c)',desc:'Бренд одежды, товара или небольшой коллекции.',
      build:()=>project('Mellow Store',baseSite({title:'Mellow — objects for everyday',background:'#fffaf4',text:'#241813',muted:'#7e6c64',accent:'#d85d33',surface:'#fffdf9',border:'#eadfd6',radius:14,customCss:THEMES.store,header:{enabled:true,sticky:true,logoText:'MELLOW',showNav:true,ctaText:'Коллекция',ctaLink:'#collection'}}),[
        blk('hero',{eyebrow:'NEW COLLECTION · 26',title:'Вещи, которые остаются с вами надолго',text:'Небольшая коллекция функциональных предметов с честными материалами и спокойным дизайном.',primaryText:'Смотреть коллекцию',primaryLink:'#collection',secondaryText:'О бренде',secondaryLink:'#about',showSecondary:true,align:'left',minHeight:720,backgroundMode:'gradient',background:'#5b3024',background2:'#d26943'}),
        blk('cards',{eyebrow:'SHOP',title:'Новая коллекция',subtitle:'Добавьте реальные фотографии товаров.',columns:3,items:[{tag:'NEW',title:'Soft Bag',text:'Лёгкая городская сумка.',buttonText:'4 900 ₽',buttonLink:'#contact'},{tag:'CORE',title:'Daily Bottle',text:'Термобутылка из стали.',buttonText:'2 400 ₽',buttonLink:'#contact'},{tag:'LIMITED',title:'Desk Tray',text:'Органайзер для рабочего стола.',buttonText:'3 200 ₽',buttonLink:'#contact'}]},{anchor:'collection',showInNav:true,navLabel:'Коллекция'}),
        blk('text',{eyebrow:'MELLOW OBJECTS',title:'Меньше вещей. Больше смысла.',text:'Проектируем предметы, которые не хочется менять через сезон.',align:'center',textWidth:780},{anchor:'about',showInNav:true,navLabel:'О бренде'}),
        blk('features',{eyebrow:'DETAILS',title:'Сделано с вниманием',columns:3,items:[{icon:'✦',title:'Материалы',text:'То, что приятно стареет и долго служит.'},{icon:'↺',title:'Малые тиражи',text:'Производим небольшими партиями.'},{icon:'♡',title:'Забота',text:'Поможем с уходом и деталями.'}]}),
        blk('cta',{eyebrow:'NEW DROP',title:'Узнавайте о новых небольших тиражах',text:'Только новые коллекции и важные обновления.',buttonText:'Подписаться',buttonLink:'#contact',align:'center',background2:'#c45b37'})
      ])
    },
    {
      id:'creator',name:'Creator / Media',tag:'Яркий',note:'Create / Stream / Play',title:'CAY MEDIA',bg:'linear-gradient(135deg,#17102f,#7c3aed 50%,#26c8ff)',desc:'Для стримера, YouTube-канала или личного бренда.',
      build:()=>project('Creator Media',baseSite({title:'Creator Hub',background:'#0c0a18',text:'#f6f3ff',muted:'#aaa4bf',accent:'#8b5cf6',surface:'#151229',border:'#30294f',shadow:'none',customCss:THEMES.creator,header:{enabled:true,sticky:true,logoText:'CAY MEDIA',showNav:true,ctaText:'Подписаться',ctaLink:'#contact'}}),[
        blk('hero',{eyebrow:'CREATOR HUB',title:'Видео, игры, проекты — всё, что я создаю',text:'Главная точка для новых выпусков, эфиров и проектов.',primaryText:'Смотреть новое',primaryLink:'#content',secondaryText:'Мои проекты',secondaryLink:'#projects',showSecondary:true,align:'left',minHeight:730,backgroundMode:'gradient',background:'#17102f',background2:'#6138b5'}),
        blk('cards',{eyebrow:'LATEST',title:'Свежее',subtitle:'Главные материалы прямо сейчас.',columns:3,items:[{tag:'VIDEO',title:'Новый выпуск',text:'Описание последнего ролика.',buttonText:'Смотреть',buttonLink:'#'},{tag:'LIVE',title:'Ближайший стрим',text:'Когда встречаемся в эфире.',buttonText:'Открыть канал',buttonLink:'#'},{tag:'POST',title:'За кадром',text:'Обновление для аудитории.',buttonText:'Читать',buttonLink:'#'}]},{anchor:'content',showInNav:true,navLabel:'Контент'}),
        blk('gallery',{eyebrow:'PROJECTS',title:'То, что я создаю кроме контента',subtitle:'Игры, сайты, эксперименты и большие идеи.',columns:3},{anchor:'projects',showInNav:true,navLabel:'Проекты'}),
        blk('stats',{columns:4,items:[{value:'250k+',label:'просмотров'},{value:'180+',label:'выпусков'},{value:'12',label:'проектов'},{value:'24/7',label:'идей'}]}),
        blk('contact',{eyebrow:'COLLAB',title:'Есть идея для совместного проекта?',text:'Открыт к интеграциям и коллаборациям.',email:'hello@creator.media',phone:'+7 (900) 777-77-77',address:'Online',buttonText:'Предложить идею'},{anchor:'contact',showInNav:true,navLabel:'Контакты'})
      ])
    },
    {
      id:'restaurant',name:'Ресторан / Кафе',tag:'Lifestyle',note:'Kitchen / Bar',title:'SORA',bg:'linear-gradient(135deg,#24301e,#6e7d4a 55%,#d9c69b)',desc:'Для кафе, ресторана, бара или локального бренда.',
      build:()=>project('Sora Restaurant',baseSite({title:'Sora — seasonal kitchen',background:'#f7f2e7',text:'#20251b',muted:'#6f715f',accent:'#697842',surface:'#fbf8ef',border:'#e3ddcd',radius:10,headingFont:'Playfair Display',headingWeight:700,customCss:THEMES.restaurant,header:{enabled:true,sticky:true,logoText:'SORA',showNav:true,ctaText:'Забронировать',ctaLink:'#contact'}}),[
        blk('hero',{eyebrow:'SEASONAL KITCHEN · 2026',title:'Простая еда, хороший вечер и внимание к сезону',text:'Небольшое меню из локальных продуктов, открытая кухня и пространство, куда хочется возвращаться.',primaryText:'Забронировать стол',primaryLink:'#contact',secondaryText:'Смотреть меню',secondaryLink:'#menu',showSecondary:true,align:'left',minHeight:720,backgroundMode:'gradient',background:'#26321f',background2:'#667842'}),
        blk('cards',{eyebrow:'TODAY',title:'Что в меню сегодня',subtitle:'Меню меняется вместе с сезоном.',columns:3,items:[{tag:'STARTER',title:'Томаты / страчателла',text:'Базилик и масло зелёного чеснока.',buttonText:'690 ₽',buttonLink:'#contact'},{tag:'MAIN',title:'Утиная грудка',text:'Свёкла, вишня и насыщенный соус.',buttonText:'1 390 ₽',buttonLink:'#contact'},{tag:'DESSERT',title:'Мёд / сметана',text:'Медовый бисквит и цветочная соль.',buttonText:'590 ₽',buttonLink:'#contact'}]},{anchor:'menu',showInNav:true,navLabel:'Меню'}),
        blk('text',{eyebrow:'OUR IDEA',title:'Сезон диктует меню, а не наоборот',text:'Работаем с небольшими хозяйствами и каждый день смотрим на продукт заново.',align:'center',textWidth:780}),
        blk('gallery',{eyebrow:'ATMOSPHERE',title:'Вечер в Sora',subtitle:'Добавьте фотографии кухни, зала и команды.',columns:3}),
        blk('contact',{eyebrow:'BOOK A TABLE',title:'Забронировать стол',text:'Напишите или позвоните — подтвердим бронь.',email:'hello@sora.restaurant',phone:'+7 (900) 444-20-20',address:'Москва, ул. Примерная, 12',buttonText:'Написать'},{anchor:'contact',showInNav:true,navLabel:'Бронь'})
      ])
    }
  ];

  function getState() {
    let map = {};
    try { map = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch {}
    const activeId = localStorage.getItem(ACTIVE_KEY);
    return { map, activeId, current: activeId ? map[activeId] : null };
  }

  function applyTemplate(id, isNew = false) {
    const t = templates.find(x => x.id === id);
    if (!t) return;
    const { map, activeId, current } = getState();
    if (!isNew && current?.blocks?.length > 1 && !confirm(`Шаблон «${t.name}» заменит текущие блоки. Продолжить?`)) return;
    const next = t.build();
    if (!isNew && activeId) {
      next.id = activeId;
      next.createdAt = current?.createdAt || Date.now();
      if (current?.name && current.name !== 'Новый сайт') next.name = current.name;
    }
    map[next.id] = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    localStorage.setItem(ACTIVE_KEY, next.id);
    location.reload();
  }

  function renderGallery() {
    const grid = $('#templateGrid');
    if (!grid) return;
    grid.innerHTML = templates.map((t, i) => `
      <article class="template-card template-card-v83">
        <div class="template-cover template-cover-v83" style="--template-bg:${t.bg}">
          <div class="template-cover-top"><span class="template-live-dot"></span><span>${esc(t.note)}</span></div>
          <div class="template-cover-copy"><strong>${esc(t.title)}</strong><small>${esc(t.tag)}</small></div>
          <div class="template-cover-ui"><i></i><i></i><i></i></div>
        </div>
        <div class="template-info">
          <div class="template-title-row"><h3>${esc(t.name)}</h3><span>#${String(i + 1).padStart(2,'0')}</span></div>
          <p>${esc(t.desc)}</p>
          <button class="btn btn-ghost full" type="button" data-v83-template="${t.id}">Использовать шаблон</button>
        </div>
      </article>`).join('');
  }

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-v83-template]');
    if (btn) {
      e.preventDefault(); e.stopImmediatePropagation();
      applyTemplate(btn.dataset.v83Template);
      return;
    }
    if (e.target.closest('#newProjectBtn')) {
      e.preventDefault(); e.stopImmediatePropagation();
      applyTemplate('starter', true);
    }
  }, true);

  const boot = () => {
    renderGallery();
    const grid = $('#templateGrid');
    if (grid) new MutationObserver(() => {
      if (!grid.querySelector('[data-v83-template]')) renderGallery();
    }).observe(grid, { childList: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
  else boot();
})();