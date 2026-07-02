import { defaultSecondaryPages } from "@/data/secondary-pages";

const siteLinks = {
  site: "https://seredoexpo.sa/",
  exhibitorsPage: "/exhibitors",
  visitorsPage: "/visitors",
  sponsorsPage: "/sponsors",
  mediaPage: "/media",
  visitorRegistration:
    "https://script.google.com/macros/s/AKfycbxKVYPvF26btP_zFUjQnoKpNjyE-3TTQPbjJxwZ7S90BloZzu_Q6Fy8GPIFvUmksNA/exec",
  exhibitorRegistration:
    "https://script.google.com/macros/s/AKfycbxKVYPvF26btP_zFUjQnoKpNjyE-3TTQPbjJxwZ7S90BloZzu_Q6Fy8GPIFvUmksNA/exec?form=exhibitor&ver=12",
  profile:
    "https://drive.google.com/file/d/1pWL7HfCaRwe0EQrz8MiYtIn64HVdNSvY/view?usp=sharing",
  map: "https://maps.app.goo.gl/BDAdGUmSBW4FYHHZ8?g_st=aw",
  footerMap: "https://maps.app.goo.gl/6Bb85dSh73G5daeE8",
  whatsapp: "https://wa.me/966580080464",
  privacy: "/privacy",
  email: "mailto:info@eventify-organizer.com",
  phone: "tel:+966580080464",
};

const siteAssets = {
  logo: "/assets/seredo/seredo-logo.webp",
  heroVideo: "/assets/seredo/hero-video.mp4",
  heroPoster: "/assets/seredo/hero-poster.webp",
  aboutImage: "/assets/seredo/about-expo.webp",
  networkImage: "/assets/seredo/network-city.webp",
  venueLogo: "/assets/seredo/jeddah-superdome.webp",
  organizerLogo: "/assets/seredo/organizer-logo.webp",
};

export const defaultSiteContent = {
  metadata: {
    title: "معرض سيريدو للتطوير والتمليك العقاري",
    description:
      "معرض عقاري واستثماري متخصص يجمع المطورين، المستثمرين، جهات التمويل، والخبراء في منصة واحدة بمدينة جدة.",
    openGraphTitle: "معرض سيريدو للتطوير والتمليك العقاري",
    openGraphDescription:
      "الدورة الخامسة من سيريدو: منصة عقارية متخصصة لعرض المشاريع وبناء الشراكات واستكشاف الفرص الاستثمارية.",
  },
  links: siteLinks,
  assets: siteAssets,
  header: {
    logoAlt: "سيريدو SEREDO Expo",
    fallbackLogoText: "SEREDO EXPO",
    menuOpenLabel: "فتح القائمة",
    menuCloseLabel: "إغلاق القائمة",
    visitorButton: "سجّل كزائر",
    exhibitorButton: "سجّل كعارض",
    navItems: [
      { label: "الصفحة الرئيسية", href: "/#seredo-top" },
      { label: "العارضين", href: siteLinks.exhibitorsPage },
      { label: "الزوار", href: siteLinks.visitorsPage },
      { label: "الرعايات", href: siteLinks.sponsorsPage },
      { label: "المركز الإعلامي", href: siteLinks.mediaPage },
      { label: "تواصل معنا", href: "/#seredo-contact" },
    ],
  },
  hero: {
    title: "معرض سيريدو للتطوير والتمليك العقاري - بدورته الخامسة",
    subtitle:
      "معرض عقاري واستثماري متخصص يجمع المطورين، المستثمرين، جهات التمويل، والخبراء في منصة واحدة.",
    highlights: [
      "من 6 - 8 سبتمبر 2026",
      "مدة الفعالية 3 أيام",
      "جدة",
    ],
    primaryButton: {
      label: "سجّل كزائر",
      href: siteLinks.visitorsPage,
    },
    secondaryButton: {
      label: "سجّل كعارض",
      href: siteLinks.exhibitorsPage,
    },
    imageAlt: "لقطة علوية من معرض سيريدو تظهر أجنحة العارضين وزوار المعرض",
    figureTitle: "حيث تلتقي العمارة بالاستثمار",
    figureDescription:
      "منصة عقارية واستثمارية مصممة لخلق فرص أعمال حقيقية وروابط استراتيجية بين قادة القطاع.",
    countdown: {
      targetDate: "2026-09-06T14:00:00+03:00",
      title: "العد التنازلي لانطلاق سيريدو",
      location: "جدة · المملكة العربية السعودية",
      daysLabel: "أيام",
      hoursLabel: "ساعات",
      minutesLabel: "دقائق",
      secondsLabel: "ثواني",
    },
  },
  eventInfo: {
    items: [
      { label: "التاريخ", value: "6 - 8 سبتمبر 2026" },
      { label: "الوقت", value: "من 2:00 مساء إلى 10:00 مساء" },
      { label: "المكان", value: "قاعة سوبر دوم جدة", href: siteLinks.map },
      { label: "المدينة", value: "جدة" },
    ],
  },
  about: {
    eyebrow: "عن سيريدو",
    title: "منصة عقارية متخصصة بتجربة مهنية متكاملة",
    paragraphs: [
      "ينطلق سيريدو للتطوير والتمليك العقاري | الدورة الخامسة كمنصة عقارية متخصصة تجمع أبرز الجهات الفاعلة في القطاع العقاري، من مطورين ومستثمرين وجهات تمويل وخبراء، ضمن تجربة مهنية مصممة لتعزيز فرص الأعمال، بناء الشراكات، واستكشاف الفرص الاستثمارية في السوق العقاري السعودي.",
      "وعلى مدار ثلاثة أيام، يقدّم سيريدو بيئة تفاعلية تجمع بين عرض المشاريع العقارية، الفرص الاستثمارية، الحلول التمويلية، والمحتوى المعرفي المتخصص، بما يتيح للزوار والجهات المشاركة التواصل المباشر مع صناع القرار والجهات المؤثرة في القطاع.",
      "ويمثل الحدث مساحة تجمع بين المعرفة والفرص التجارية، عبر جلسات حوارية ولقاءات مهنية وتجارب تفاعلية تدعم نمو الأعمال وتواكب التحولات المتسارعة في المشهد العقاري بالمملكة.",
    ],
    buttonLabel: "بروفايل معرض سيريدو",
    buttonHref: siteLinks.profile,
    imageAlt: "لقاء مهني داخل بيئة معرض عقاري يعرض فرص المشاريع والاستثمار",
    figureTitle: "سيريدو",
    figureCaption: "منصة تجمع القطاع العقاري",
  },
  pillarsSection: {
    title: "ستة محاور تصنع تجربة عقارية متكاملة",
    items: [
      "عرض المشاريع العقارية والفرص الاستثمارية في السوق السعودي",
      "تعزيز التواصل بين المطورين العقاريين والمستثمرين وجهات التمويل",
      "دعم فرص الشراكات والتوسع التجاري بين الجهات المشاركة",
      "استعراض الحلول والخدمات المرتبطة بالقطاع العقاري",
      "تقديم محتوى معرفي يناقش توجهات السوق ومستقبل الاستثمار العقاري",
      "تمكين الزوار من استكشاف فرص التملك والاستثمار ضمن منصة متخصصة",
    ],
  },
  tracksSection: {
    title: "حيث تلتقي الفرص العقارية بصنّاع القرار",
    description:
      "منصة عقارية متخصصة تجمع المطورين العقاريين، المستثمرين، جهات التمويل، والخبراء في بيئة مهنية تُمكّن من بناء الشراكات واستكشاف الفرص الاستثمارية.",
    items: [
      {
        title: "سجل كعارض",
        description:
          "اعرض مشاريعك أمام جمهور متخصص يضم المستثمرين، الجهات التمويلية، وصناع القرار في القطاع العقاري.",
        href: siteLinks.exhibitorsPage,
        action: "تعرّف على المزيد",
      },
      {
        title: "سجل كزائر",
        description:
          "اكتشف المشاريع الجديدة، الفرص الاستثمارية، والحلول التمويلية من جهات القطاع تحت سقف واحد.",
        href: siteLinks.visitorsPage,
        action: "تعرّف على المزيد",
      },
      {
        title: "كن شريكاً استراتيجياً",
        description:
          "عزّز حضور علامتك التجارية ضمن بيئة عقارية عالية القيمة، واربط مؤسستك بأحد أبرز ملتقيات القطاع.",
        href: siteLinks.sponsorsPage,
        action: "تعرّف على المزيد",
      },
    ],
  },
  deepAboutSection: {
    title: "وجهة تجمع بين المستثمرين والمطورين والمهتمين بالقطاع العقاري",
    intro:
      "يمثل سيريدو للتطوير والتمليك العقاري منصة متخصصة تجمع أبرز الجهات الفاعلة في القطاع العقاري ضمن تجربة مهنية متكاملة، تجمع بين عرض المشاريع، استعراض الفرص الاستثمارية، التواصل المباشر بين أصحاب القرار، وتبادل المعرفة والخبرات.",
    subheading: "عن سيريدو",
    paragraphs: [
      "وعلى امتداد أربع دورات سابقة، رسّخ سيريدو حضوره كمنصة تجمع مختلف أطراف المنظومة العقارية، بدءاً من المطورين العقاريين والمستثمرين، وصولاً إلى جهات التمويل، الوسطاء، ومزودي الخدمات المرتبطة بالقطاع.",
      "وفي دورته الخامسة، يواصل سيريدو توسيع نطاق حضوره ليقدّم تجربة أكثر تأثيراً، ترتكز على خلق فرص أعمال نوعية، وتعزيز العلاقات المهنية، وفتح مسارات جديدة للنمو والاستثمار.",
    ],
    sideStats: [
      { value: "5", label: "دورات متتالية من الحضور المتنامي والتوسع المستمر", dark: false },
      { value: "3 أيام", label: "برنامج متكامل من العرض، اللقاءات، والمحتوى المعرفي", dark: false },
      { value: "جدة", label: "قلب القطاع العقاري في المملكة العربية السعودية", dark: true },
    ],
  },
  ecosystemSection: {
    title: "منظومة أعمال عقارية متكاملة",
    description:
      "لا يقتصر سيريدو على كونه مساحة لعرض المشاريع العقارية، بل يمثل بيئة متخصصة تجمع بين الاستثمار، المعرفة، العلاقات المهنية، وفرص النمو التجاري، ضمن تجربة مصممة لتخدم مختلف الفئات العاملة في القطاع العقاري.",
    imageAlt: "لقاء مهني يعبر عن منظومة الأعمال والشراكات في سيريدو",
    cards: [
      {
        title: "الوصول إلى جمهور مؤهل",
        description:
          "التواصل مع شريحة مستهدفة تضم المستثمرين، المطورين، الباحثين عن فرص التملك، والمهتمين بالقطاع العقاري.",
        featured: true,
      },
      {
        title: "بناء علاقات استراتيجية",
        description:
          "فتح المجال أمام اللقاءات المباشرة مع صناع القرار، الجهات التمويلية، والشركاء المحتملين.",
        featured: false,
      },
      {
        title: "استكشاف الفرص الاستثمارية",
        description:
          "الوصول إلى مشاريع وفرص عقارية متنوعة ضمن منصة تجمع أبرز الجهات ذات العلاقة.",
        featured: false,
      },
      {
        title: "محتوى معرفي متخصص",
        description:
          "جلسات حوارية وورش عمل تناقش التوجهات، التحولات، والمستقبل الاستثماري للقطاع العقاري.",
        featured: false,
      },
      {
        title: "تجربة عقارية كاملة",
        description:
          "منصة واحدة تجمع المعرفة، الفرص، والعلاقات المهنية تحت سقف واحد لثلاثة أيام مكثفة.",
        featured: true,
      },
    ],
  },
  statsSection: {
    eyebrow: "",
    title: "الدورة الخامسة، امتداد لمسيرة متصاعدة",
    items: [
      { value: 5, label: "دورات من الحضور المتنامي والتوسع المستمر", suffix: "", decimals: 0 },
      {
        value: 4.2,
        decimals: 1,
        suffix: "+",
        label: "مليار ريال - قيمة الفرص والصفقات المستهدفة",
      },
      { value: 20, suffix: "+", label: "متحدث وخبير متخصص", decimals: 0 },
      { value: 60, suffix: "+", label: "عارض من الجهات العقارية ذات العلاقة", decimals: 0 },
      { value: 30000, suffix: "+", label: "زائر ومهتم بالقطاع العقاري", decimals: 0 },
    ],
  },
  audienceSection: {
    title: "التقِ بصناع القرار في القطاع العقاري",
    items: [
      { title: "المطورون العقاريون", description: "شركات التطوير المحلية والإقليمية" },
      { title: "المستثمرون", description: "أفراد وصناديق ومستثمرون مؤسسيون" },
      { title: "جهات التمويل", description: "بنوك، شركات تمويل، حلول رهن وتمويل عقاري" },
      { title: "الوسطاء العقاريون", description: "وسطاء، مسوقون، مستشارون" },
      { title: "مزودو الخدمات", description: "تقنية عقارية، إدارة أملاك، حلول تصميم، استشارات" },
      { title: "الجهات التنظيمية", description: "جهات داعمة ومؤثرة في القطاع" },
    ],
  },
  sectorsSection: {
    title: "منظومة عقارية متكاملة",
    description:
      "من التطوير والتمويل إلى التقنية العقارية وخدمات البناء يجمع سيريدو أبرز القطاعات والشراكات التي تقود نمو القطاع العقاري في المملكة.",
    items: [
      "التطوير العقاري السكني",
      "التطوير التجاري",
      "المشاريع متعددة الاستخدام",
      "التمويل العقاري",
      "حلول التقنية العقارية",
      "إدارة وتشغيل الأصول",
      "الاستشارات والتخطيط العقاري",
      "الوساطة والتسويق العقاري",
      "خدمات البناء والتطوير",
    ],
  },
  constructionServicesSection: {
    title: "شركاء الدورة الخامسة",
    description:
      "جهات متخصصة في خدمات البناء والتطوير العقاري ضمن منظومة سيريدو، تقدم حلولاً داعمة للمشاريع والفرص العقارية.",
    items: [
      { name: "Ambatt Real Estate", logo: "/assets/seredo/5/construction-01.webp" },
      { name: "ARACO", logo: "/assets/seredo/5/construction-02.webp" },
      { name: "Pan Kingdom", logo: "/assets/seredo/5/construction-03.webp" },
      { name: "HOV Global", logo: "/assets/seredo/5/construction-04.webp" },
      { name: "EG", logo: "/assets/seredo/5/construction-05.webp" },
      { name: "أملاك", logo: "/assets/seredo/5/construction-06.webp" },
      { name: "NHC", logo: "/assets/seredo/5/construction-07.webp" },
      { name: "جهة تطوير", logo: "/assets/seredo/5/construction-08.webp" },
      { name: "راسيات", logo: "/assets/seredo/5/construction-09.webp" },
      { name: "مكيون", logo: "/assets/seredo/5/construction-10.webp" },
    ],
  },
  partnersSection: {
    eyebrow: "",
    title: "شركاء الدورات السابقة",
    description:
      "جهات ساهمت في تعزيز حضور سيريدو عبر دوراته السابقة، ضمن منظومة تجمع الجهات الحكومية، التمويلية، العارضين، والشركاء الإعلاميين.",
    groups: {
      government: {
        title: "جهات حكومية",
        countLabel: "8 جهات",
        items: [
          {
            name: "وزارة البلديات والإسكان",
            logo: "/assets/seredo/partners/partner-001-ministry-of-housing-6-scaled-e1781591519236.webp",
          },
          {
            name: "NHC",
            logo: "/assets/seredo/partners/partner-002-nhc-logo-ntlgreen-h-rgb.webp",
          },
          {
            name: "جهة حكومية",
            logo: "/assets/seredo/partners/partner-003-untitled-22-2026-12-10-44.webp",
          },
          {
            name: "غرفة جدة",
            logo: "/assets/seredo/partners/partner-004-page-0001-scaled-e1781591478427.webp",
          },
          {
            name: "أمانة جدة",
            logo: "/assets/seredo/partners/partner-005-jeddah-municipality-logo-page-0001-scaled-e1781591459845.webp",
          },
          {
            name: "الهيئة العامة للعقار",
            logo: "/assets/seredo/partners/partner-006-rega-logo-page-0001-scaled.webp",
          },
          {
            name: "جهة حكومية",
            logo: "/assets/seredo/partners/partner-007-60409-e1781591431483.webp",
          },
          {
            name: "غرفة مكة",
            logo: "/assets/seredo/partners/partner-008-makkah-chamber-of-commerce-logo.webp",
          },
        ],
      },
      finance: {
        title: "البنوك وشركات التمويل",
        countLabel: "5 جهات",
        items: [
          {
            name: "بنك البلاد",
            logo: "/assets/seredo/partners/partner-013-bank-albilad-logo.webp",
          },
          {
            name: "البنك السعودي للاستثمار",
            logo: "/assets/seredo/partners/partner-012-logo.webp",
          },
          {
            name: "البنك الأهلي السعودي",
            logo: "/assets/seredo/partners/partner-011-snb-brandmark-artwork-cmyk-primary.webp",
          },
          {
            name: "البنك العربي الوطني",
            logo: "/assets/seredo/partners/partner-010-anb-logo-4m-bank-e1781594579153.webp",
          },
          {
            name: "مصرف الإنماء",
            logo: "/assets/seredo/partners/partner-009-alinma-bank-logo-cmyk-2-scaled.webp",
          },
        ],
      },
      exhibitors: {
        title: "العارضون",
        countLabel: "شريط متحرك",
        items: [
          {
            name: "عارض 01",
            logo: "/assets/seredo/exp/exp1.webp",
          },
          {
            name: "عارض 02",
            logo: "/assets/seredo/exp/exp2.webp",
          },
          {
            name: "عارض 03",
            logo: "/assets/seredo/exp/exp3.webp",
          },
          {
            name: "عارض 04",
            logo: "/assets/seredo/exp/exp4.webp",
          },
          {
            name: "عارض 05",
            logo: "/assets/seredo/exp/exp5.webp",
          },
          {
            name: "عارض 06",
            logo: "/assets/seredo/exp/exp6.webp",
          },
          {
            name: "عارض 07",
            logo: "/assets/seredo/exp/exp7.webp",
          },
          {
            name: "عارض 08",
            logo: "/assets/seredo/exp/exp8.webp",
          },
          {
            name: "عارض 09",
            logo: "/assets/seredo/exp/exp9.webp",
          },
          {
            name: "عارض 10",
            logo: "/assets/seredo/exp/exp10.webp",
          },
          {
            name: "عارض 11",
            logo: "/assets/seredo/exp/exp11.webp",
          },
          {
            name: "عارض 12",
            logo: "/assets/seredo/exp/exp12.webp",
          },
          {
            name: "عارض 13",
            logo: "/assets/seredo/exp/exp13.webp",
          },
          {
            name: "عارض 14",
            logo: "/assets/seredo/exp/exp14.webp",
          },
          {
            name: "عارض 15",
            logo: "/assets/seredo/exp/exp15.webp",
          },
          {
            name: "عارض 16",
            logo: "/assets/seredo/exp/exp16.webp",
          },
          {
            name: "عارض 17",
            logo: "/assets/seredo/exp/exp17.webp",
          },
          {
            name: "عارض 18",
            logo: "/assets/seredo/exp/exp18.webp",
          },
          {
            name: "عارض 19",
            logo: "/assets/seredo/exp/exp19.webp",
          },
          {
            name: "عارض 20",
            logo: "/assets/seredo/exp/exp20.webp",
          },
          {
            name: "عارض 21",
            logo: "/assets/seredo/exp/exp21.webp",
          },
          {
            name: "عارض 22",
            logo: "/assets/seredo/exp/exp22.webp",
          },
          {
            name: "عارض 23",
            logo: "/assets/seredo/exp/exp23.webp",
          },
          {
            name: "عارض 24",
            logo: "/assets/seredo/exp/exp24.webp",
          },
          {
            name: "عارض 25",
            logo: "/assets/seredo/exp/exp25.webp",
          },
          {
            name: "عارض 26",
            logo: "/assets/seredo/exp/exp26.webp",
          },
          {
            name: "عارض 27",
            logo: "/assets/seredo/exp/exp27.webp",
          },
          {
            name: "عارض 28",
            logo: "/assets/seredo/exp/exp28.webp",
          },
          {
            name: "عارض 29",
            logo: "/assets/seredo/exp/exp29.webp",
          },
          {
            name: "عارض 30",
            logo: "/assets/seredo/exp/exp30.webp",
          },
          {
            name: "عارض 31",
            logo: "/assets/seredo/exp/exp31.webp",
          },
          {
            name: "عارض 32",
            logo: "/assets/seredo/exp/exp32.webp",
          },
          {
            name: "عارض 33",
            logo: "/assets/seredo/exp/exp33.webp",
          },
          {
            name: "عارض 34",
            logo: "/assets/seredo/exp/exp34.webp",
          },
          {
            name: "عارض 35",
            logo: "/assets/seredo/exp/exp35.webp",
          },
          {
            name: "عارض 36",
            logo: "/assets/seredo/exp/exp36.webp",
          },
          {
            name: "عارض 37",
            logo: "/assets/seredo/exp/exp37.webp",
          },
          {
            name: "عارض 38",
            logo: "/assets/seredo/exp/exp38.webp",
          },
          {
            name: "عارض 39",
            logo: "/assets/seredo/exp/exp39.webp",
          },
          {
            name: "عارض 40",
            logo: "/assets/seredo/exp/exp40.webp",
          },
          {
            name: "عارض 41",
            logo: "/assets/seredo/exp/exp41.webp",
          },
          {
            name: "عارض 42",
            logo: "/assets/seredo/exp/exp42.webp",
          },
          {
            name: "عارض 43",
            logo: "/assets/seredo/exp/exp43.webp",
          },
          {
            name: "عارض 44",
            logo: "/assets/seredo/exp/exp44.webp",
          },
          {
            name: "عارض 45",
            logo: "/assets/seredo/exp/exp45.webp",
          },
          {
            name: "عارض 46",
            logo: "/assets/seredo/exp/exp46.webp",
          },
          {
            name: "عارض 47",
            logo: "/assets/seredo/exp/exp47.webp",
          },
          {
            name: "عارض 48",
            logo: "/assets/seredo/exp/exp48.webp",
          },
          {
            name: "عارض 49",
            logo: "/assets/seredo/exp/exp49.webp",
          },
          {
            name: "عارض 50",
            logo: "/assets/seredo/exp/exp50.webp",
          },
          {
            name: "عارض 51",
            logo: "/assets/seredo/exp/exp51.webp",
          },
          {
            name: "عارض 52",
            logo: "/assets/seredo/exp/exp52.webp",
          },
          {
            name: "عارض 53",
            logo: "/assets/seredo/exp/exp53.webp",
          },
          {
            name: "عارض 54",
            logo: "/assets/seredo/exp/exp54.webp",
          },
          {
            name: "عارض 55",
            logo: "/assets/seredo/exp/exp55.webp",
          },
          {
            name: "عارض 56",
            logo: "/assets/seredo/exp/exp56.webp",
          },
          {
            name: "عارض 57",
            logo: "/assets/seredo/exp/exp57.webp",
          },
          {
            name: "عارض 58",
            logo: "/assets/seredo/exp/exp58.webp",
          },
          {
            name: "عارض 59",
            logo: "/assets/seredo/exp/exp59.webp",
          },
          {
            name: "عارض 60",
            logo: "/assets/seredo/exp/exp60.webp",
          },
          {
            name: "عارض 61",
            logo: "/assets/seredo/exp/exp61.webp",
          },
          {
            name: "عارض 62",
            logo: "/assets/seredo/exp/exp62.webp",
          },
          {
            name: "عارض 63",
            logo: "/assets/seredo/exp/exp63.webp",
          },
          {
            name: "عارض 64",
            logo: "/assets/seredo/exp/exp64.webp",
          },
          {
            name: "عارض 65",
            logo: "/assets/seredo/exp/exp65.webp",
          },
          {
            name: "عارض 66",
            logo: "/assets/seredo/exp/exp66.webp",
          },
          {
            name: "عارض 67",
            logo: "/assets/seredo/exp/exp67.webp",
          },
          {
            name: "عارض 68",
            logo: "/assets/seredo/exp/exp68.webp",
          },
          {
            name: "عارض 69",
            logo: "/assets/seredo/exp/exp69.webp",
          },
          {
            name: "عارض 70",
            logo: "/assets/seredo/exp/exp70.webp",
          },
          {
            name: "عارض 71",
            logo: "/assets/seredo/exp/exp71.webp",
          },
          {
            name: "عارض 72",
            logo: "/assets/seredo/exp/exp72.webp",
          },
          {
            name: "عارض 73",
            logo: "/assets/seredo/exp/exp73.webp",
          },
          {
            name: "عارض 74",
            logo: "/assets/seredo/exp/exp74.webp",
          },
          {
            name: "عارض 75",
            logo: "/assets/seredo/exp/exp75.webp",
          },
          {
            name: "عارض 76",
            logo: "/assets/seredo/exp/exp76.webp",
          },
          {
            name: "عارض 77",
            logo: "/assets/seredo/exp/exp77.webp",
          },
          {
            name: "عارض 78",
            logo: "/assets/seredo/exp/exp78.webp",
          },
          {
            name: "عارض 79",
            logo: "/assets/seredo/exp/exp79.webp",
          },
          {
            name: "عارض 80",
            logo: "/assets/seredo/exp/exp80.webp",
          }
        ],
      },
      media: {
        title: "الشركاء الإعلاميون",
        countLabel: "Media Partners",
        items: [
          {
            name: "أملاك",
            logo: "/assets/seredo/media-amlak.webp",
          },
          {
            name: "نهدي العقارية",
            logo: "/assets/seredo/media-nahdi.webp",
          },
        ],
      },
    },
  },
  finalCta: {
    eyebrow: "تواصل معنا",
    title: "كن جزءاً من الدورة الخامسة لمعرض سيريدو",
    description:
      "سجّل حضورك كزائر، أو شارك كعارض أو راعٍ، أو تواصل معنا لاستكشاف فرص التعاون والشراكات الاستراتيجية.",
    buttons: [
      { label: "سجّل كزائر", href: siteLinks.visitorsPage, variant: "primary" },
      { label: "كن راعياً", href: siteLinks.sponsorsPage, variant: "accent" },
      { label: "تواصل معنا", href: siteLinks.whatsapp, variant: "outline" },
    ],
  },
  footer: {
    logoAlt: "SEREDO Expo",
    description:
      "سيريدو للتطوير والتمليك العقاري - منصة عقارية متخصصة تجمع المطورين، المستثمرين، جهات التمويل، والخبراء في تجربة مهنية متكاملة.",
    followTitle: "تابعنا على",
    socialLabel: "حسابات سيريدو على مواقع التواصل الاجتماعي",
    venueLogoAlt: "جدة سوبر دوم",
    organizerLogoAlt: "رواد الفعاليات",
    contactTitle: "تواصل معنا",
    eventTitle: "الحدث",
    linksTitle: "روابط الموقع",
    backToTopLabel: "العودة للأعلى",
    copyright: "© 2026 سيريدو - جميع الحقوق محفوظة",
    contactItems: [
      { label: "الهاتف", value: "+966580080464", href: siteLinks.phone },
      { label: "البريد الإلكتروني", value: "info@eventify-organizer.com", href: siteLinks.email },
      { label: "المدينة", value: "جدة - المملكة العربية السعودية" },
      { label: "الموقع", value: "جدة - قاعة سوبر دوم", href: siteLinks.footerMap },
    ],
    eventItems: [
      { label: "التاريخ", value: "6 - 8 سبتمبر 2026" },
      { label: "الوقت", value: "2:00 - 10:00 مساء" },
      { label: "النوع", value: "معرض عقاري واستثماري" },
    ],
    navLinks: [
      { label: "الزوار", href: siteLinks.visitorsPage },
      { label: "الرعايات", href: siteLinks.sponsorsPage },
      { label: "العارضون", href: siteLinks.exhibitorsPage },
      { label: "المركز الإعلامي", href: siteLinks.mediaPage },
      { label: "عن سيريدو", href: "/#seredo-about" },
      { label: "تواصل معنا", href: siteLinks.whatsapp },
      { label: "سياسة الخصوصية", href: siteLinks.privacy },
    ],
  },
  socialLinks: [
    { label: "TikTok", href: "https://www.tiktok.com/@seredoexpoksa", short: "TT" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/seredoexpo26/", short: "in" },
    { label: "Instagram", href: "https://www.instagram.com/seredoexpoksa", short: "IG" },
    { label: "X", href: "https://x.com/seredoexposa", short: "X" },
    { label: "YouTube", href: "https://www.youtube.com/@seredoexposa", short: "YT" },
  ],
  secondaryPages: defaultSecondaryPages,
};

export type SiteContent = typeof defaultSiteContent;
export type SiteContentPartner = SiteContent["partnersSection"]["groups"]["government"]["items"][number];
