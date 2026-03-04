/*
 * /config/site.ts  (Xenovant / Pageit Marketing)
 * 目的：新規 Pageit 作成時に「最小の上書き」だけで全体が組み上がるようにする。
 * 使い方：
 *   1) SITE_BRAND / SITE_OVERRIDES の値だけを書き換える（ブランド名・キャッチ・説明など）
 *   2) 必要なら copy, faqItems, PAGES の文言や画像パスを調整
 *   3) それ以外は触らずに使い回し可能
 */

import type { Metadata } from "next";
import { SITE_KEY } from "@/lib/atoms/siteKeyAtom";
import { type AiSiteConfig } from "@/types/AiSite";
import { type FooterI18n } from "@/types/FooterI18n";
import { type FaqItem } from "@/types/FaqItem";
import { type PageDef } from "@/types/PageDef";

/* =========================
   URL / 環境ユーティリティ
========================= */
const ENV_BASE_URL_RAW =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const BASE_URL = ENV_BASE_URL_RAW.replace(/\/$/, "");

function safeHost(input: string, fallback = "localhost:3000"): string {
  try {
    return new URL(input).host;
  } catch {
    return fallback;
  }
}

function safeMetadataBase(input: string): URL | undefined {
  try {
    return new URL(input);
  } catch {
    return undefined;
  }
}

const DOMAIN = safeHost(BASE_URL);
const METADATA_BASE_SAFE = safeMetadataBase(BASE_URL);

/* =========================
   サイト定義ファクトリ（単一情報源）
========================= */
export type SiteOverrides = {
  /** ブランド名（表示名） */
  name: string;
  /** キャッチコピー */
  tagline: string;
  /** サイト説明（OG/SEO 共通） */
  description: string;
  /** 検索キーワード */
  keywords: ReadonlyArray<string>;
  /** 代表TEL（任意） */
  tel?: string;
  /** ロゴ/OG既定パス */
  logoPath?: string;
  /** Google Site Verification（任意） */
  googleSiteVerification?: string;
  /** SNS（任意） */
  socials?: Partial<{
    instagram: string;
    line: string;
    x: string;
    facebook: string;
  }>;
  /** baseUrl を個別指定したい場合のみ */
  baseUrl?: string;
};

function createSite(overrides: SiteOverrides) {
  const baseUrl = (overrides.baseUrl ?? BASE_URL).replace(/\/$/, "");
  const domain = safeHost(baseUrl, DOMAIN);
  return {
    key: SITE_KEY,
    domain,
    baseUrl,
    name: overrides.name,
    tagline: overrides.tagline,
    description: overrides.description,
    keywords: overrides.keywords as readonly string[],
    tel: overrides.tel ?? "",
    logoPath: overrides.logoPath ?? "/images/ogpLogo.png",
    googleSiteVerification: overrides.googleSiteVerification ?? "",
    socials: {
      instagram: overrides.socials?.instagram ?? "",
      line: overrides.socials?.line ?? "",
      x: overrides.socials?.x ?? "",
      facebook: overrides.socials?.facebook ?? "",
    },
  } as const;
}

/* =========================
   ★ 最小上書き（ここだけ編集）
========================= */
const SITE_BRAND = "Xenovant｜Pageit（ページット）"; // 表示用のフル表記（記号・全角もOK）

const SITE_OVERRIDES: SiteOverrides = {
  name: "Pageit（ページット）",
  tagline: "ホームページ＋ECを、最短で運用開始",
  description:
    "XenovantのPageit（ページット）は、店舗・事業者向けに「ホームページ」と「EC（予約・販売）」をワンタップで切り替えられる仕組みを提供します。初期制作・公開設定までまとめて対応し、運用はスマホ中心で簡単に更新できます。",
  keywords: [
    "Pageit",
    "ページット",
    "Xenovant",
    "ホームページ",
    "ホームページ制作",
    "ECサイト",
    "ネット予約",
    "オンライン販売",
    "店舗集客",
    "小規模事業者",
    "飲食店",
    "サロン",
    "工務店",
    "家事代行",
  ],
  // tel: "",
  logoPath: "/images/ogpLogo.png",
  // googleSiteVerification: "",
  socials: {
    instagram: "",
    line: "",
    x: "",
    facebook: "",
  },
  baseUrl: "https://pageit.jp",
};

/* =========================
   サイト定義（以降は原則編集不要）
========================= */
export const siteName = SITE_BRAND; // 互換：従来の siteName を残す
export const site = createSite(SITE_OVERRIDES);

/* =========================
   住所（公開用）
   ※ マーケ用サイトで住所を出さない場合は空でOK
========================= */
export type PublicAddress = {
  text: string; // 表示用
  postal: {
    "@type": "PostalAddress";
    addressCountry: "JP";
    addressRegion: string;
    addressLocality: string;
    streetAddress: string;
    postalCode?: string;
  };
  hasMap: string; // Google Maps 検索URL（空でもOK）
};

function mapUrlFromText(text: string) {
  if (!text) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    text,
  )}`;
}

/** 公開住所（必要ならここに入れる。出さないなら空でOK） */
export const PUBLIC_ADDRESS: PublicAddress = {
  text: "",
  postal: {
    "@type": "PostalAddress",
    addressCountry: "JP",
    addressRegion: "",
    addressLocality: "",
    streetAddress: "",
  },
  hasMap: mapUrlFromText(""),
};

/* =========================
   便利ヘルパ
========================= */
export const pageUrl = (path = "/") =>
  `${site.baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

const ogImage = (p?: string) => pageUrl(p ?? site.logoPath);

/* =========================
   コピー（集中管理）★多言語対応
   - copy[lang].home.headline のように参照
========================= */
export type CopyBundle = {
  home: {
    headline: string;
    description: string;
  };
  stores: {
    heroTitle: string;
    heroAreas: string;
    heroLead: string;
    heroTail: string;
    heroIntroLine: string;
  };
  areasLocal: {
    h1: string;
    lead: string;
    services: {
      title: string;
      bullets: string[];
    }[];
    coverageTitle: string;
    coverageBody: string;
    faq: {
      q: string;
      a: string;
    }[];
    contactTitle: string;
    contactText: string;
    toProductsText: string;
  };
};

/**
 * UI 言語ごとの文言。
 * 例：
 *   const t = copy[uiLang] ?? copy["ja"];
 *   t.home.headline
 */
export const copy: Record<string, CopyBundle> = {
  /* ========= 日本語 ========= */
  ja: {
    home: {
      headline: "Pageit（ページット）",
      description:
        "ホームページとEC（予約・販売）をワンタップで切り替え。初期制作・公開設定までまとめて対応し、運用はスマホで簡単。小規模事業者の集客と売上を、最短で仕組み化します。",
    },
    stores: {
      heroTitle: "Pageit｜対応業種",
      heroAreas: "全国対応（オンライン）",
      heroLead:
        "飲食店・サロン・家事代行・工務店など、業種に合わせてページ構成を最適化します。",
      heroTail:
        "まずは「どんなサイトにしたいか」を教えてください。最小の手間で運用開始まで伴走します。",
      heroIntroLine:
        "Pageitは、店舗・事業者の「集客」と「予約/販売」を一体で設計できるホームページ基盤です。",
    },
    areasLocal: {
      h1: "Pageitでできること",
      lead: "ホームページとEC（予約・販売）をワンタップで切り替え。運用はスマホ中心で完結します。",
      services: [
        {
          title: "初期制作・公開設定まで丸ごと",
          bullets: [
            "公開に必要な設定を含めて運用開始までサポート",
            "写真・文章が揃っていなくても相談しながら整備",
            "更新はスマホで簡単（お知らせ/メニュー/商品など）",
          ],
        },
        {
          title: "ホームページ × EC（予約・販売）",
          bullets: [
            "通常サイト表示とEC表示をワンタップ切り替え",
            "業種に合わせた導線設計（予約/販売/メニュー）",
            "運用を止めない「小さく改善」前提の作り",
          ],
        },
      ],
      coverageTitle: "対象",
      coverageBody:
        "飲食店／美容室・ネイル／家事代行・清掃／工務店・設備／小売・物販／各種サービス業 など",
      faq: [
        {
          q: "何を用意すれば始められますか？",
          a: "店名・連絡先・やりたい内容が分かればOKです。写真や文章が未完成でも、ヒアリングしながら整えます。",
        },
        {
          q: "ホームページとECの切り替えは難しいですか？",
          a: "ワンタップ切り替えを想定しています。運用者が迷わない導線にします。",
        },
        {
          q: "スマホだけで更新できますか？",
          a: "はい。お知らせやメニュー、商品などの更新はスマホ中心で完結できます。",
        },
        {
          q: "制作後のサポートはありますか？",
          a: "運用に合わせて小さく改善できるよう、相談窓口を用意します（範囲は契約内容により異なります）。",
        },
      ],
      contactTitle: "お問い合わせ",
      contactText:
        "「こういうサイトにしたい」「予約/販売もしたい」など、まずは要望を送ってください。最短で運用開始までの流れをご案内します。",
      toProductsText: "トップページへ",
    },
  },

  /* ========= 英語 ========= */
  en: {
    home: {
      headline: "Pageit",
      description:
        "Switch between a website and e-commerce (booking/sales) with one tap. We handle initial setup and launch, and you can update the site easily from your phone.",
    },
    stores: {
      heroTitle: "Pageit ─ Industries",
      heroAreas: "Remote / Nationwide (Japan)",
      heroLead:
        "Optimized structure for restaurants, salons, home services, contractors, and more.",
      heroTail:
        "Tell us what you want to achieve. We’ll guide you to launch with minimal effort.",
      heroIntroLine:
        "Pageit is a website foundation designed for both marketing and booking/sales.",
    },
    areasLocal: {
      h1: "What you can do with Pageit",
      lead: "One-tap switching between website and e-commerce (booking/sales). Easy updates from your phone.",
      services: [
        {
          title: "We handle setup & launch",
          bullets: [
            "Launch-ready setup (including public settings as needed)",
            "OK even if you don’t have all photos/text yet",
            "Easy updates: news, menus, products, etc.",
          ],
        },
        {
          title: "Website × E-commerce",
          bullets: [
            "One-tap mode switching",
            "Booking/sales flow tailored to your business",
            "Built for continuous small improvements",
          ],
        },
      ],
      coverageTitle: "Best for",
      coverageBody:
        "Restaurants, salons, home services, contractors, retail, and other small businesses.",
      faq: [
        {
          q: "What do I need to start?",
          a: "Basic business info and your goals are enough. We can help refine content as we build.",
        },
        {
          q: "Is switching between website and e-commerce hard?",
          a: "No. It’s designed to be one-tap and simple for operators.",
        },
        {
          q: "Can I update the site from my phone?",
          a: "Yes. Updates are designed to be mobile-friendly.",
        },
        {
          q: "Do you offer support after launch?",
          a: "Yes, depending on your plan. We support ongoing improvements.",
        },
      ],
      contactTitle: "Contact",
      contactText:
        "Tell us what you want to achieve. We’ll propose the fastest path to launch.",
      toProductsText: "Back to top",
    },
  },

  /* ========= 簡体中文 ========= */
  zh: {
    home: {
      headline: "Pageit（页面系统）",
      description:
        "一键切换“官网展示”和“预约/销售（电商）”。我们负责初期制作与上线设置，日常更新可用手机轻松完成，帮助小型商家更快实现获客与成交。",
    },
    stores: {
      heroTitle: "Pageit ─ 适用行业",
      heroAreas: "在线支持（日本全国）",
      heroLead: "餐饮、美业、家政、工务店等，可按行业优化页面结构与引导路径。",
      heroTail: "先告诉我们你想实现什么，我们会给出最短上线方案。",
      heroIntroLine: "Pageit 是把“获客”与“预约/销售”整合在一起的网站基础。",
    },
    areasLocal: {
      h1: "Pageit 能做什么",
      lead: "官网与电商（预约/销售）一键切换，运营更新以手机为中心。",
      services: [
        {
          title: "从制作到上线一站式",
          bullets: [
            "包含上线所需设置，协助尽快开始运营",
            "照片/文案未齐也可，边沟通边完善",
            "手机轻松更新：公告/菜单/商品等",
          ],
        },
        {
          title: "官网 × 预约/销售",
          bullets: [
            "展示模式与电商模式一键切换",
            "按行业设计动线（预约/销售/菜单）",
            "支持持续小改进，运营不中断",
          ],
        },
      ],
      coverageTitle: "适用对象",
      coverageBody: "餐饮／美业／家政清洁／工务店设备／零售物贩／各类服务业等",
      faq: [
        {
          q: "开始前需要准备什么？",
          a: "提供店名、联系方式和目标即可。照片/文案不完整也没问题，可在制作过程中完善。",
        },
        {
          q: "切换官网和电商会很难吗？",
          a: "不会，设计为一键切换，运营者不容易迷路。",
        },
        {
          q: "可以只用手机更新吗？",
          a: "可以。公告、菜单、商品等更新以手机友好为前提。",
        },
        {
          q: "上线后有支持吗？",
          a: "有。支持范围取决于方案/合同内容。",
        },
      ],
      contactTitle: "联系我们",
      contactText:
        "告诉我们你的需求（获客/预约/销售等）。我们会提供最快上线的流程建议。",
      toProductsText: "返回首页",
    },
  },

  /* ========= 繁體中文 ========= */
  "zh-TW": {
    home: {
      headline: "Pageit（頁面系統）",
      description:
        "一鍵切換「官網展示」與「預約/銷售（電商）」。我們負責初期製作與上線設定，日常更新可用手機輕鬆完成，協助小型商家更快達成集客與成交。",
    },
    stores: {
      heroTitle: "Pageit ─ 適用行業",
      heroAreas: "線上支援（日本全國）",
      heroLead: "餐飲、美業、家政、工務店等，可依行業優化頁面結構與導線。",
      heroTail: "先告訴我們你想達成什麼，我們會提出最短上線方案。",
      heroIntroLine: "Pageit 是把「集客」與「預約/銷售」整合在一起的網站基礎。",
    },
    areasLocal: {
      h1: "Pageit 可以做什麼",
      lead: "官網與電商（預約/銷售）一鍵切換，營運更新以手機為中心。",
      services: [
        {
          title: "從製作到上線一站式",
          bullets: [
            "包含上線所需設定，協助快速開始營運",
            "照片/文案未齊也可，邊溝通邊完善",
            "手機輕鬆更新：公告/菜單/商品等",
          ],
        },
        {
          title: "官網 × 預約/銷售",
          bullets: [
            "展示模式與電商模式一鍵切換",
            "依行業設計導線（預約/銷售/菜單）",
            "支援持續小改進，營運不中斷",
          ],
        },
      ],
      coverageTitle: "適用對象",
      coverageBody: "餐飲／美業／家政清潔／工務店設備／零售物販／各類服務業等",
      faq: [
        {
          q: "開始前需要準備什麼？",
          a: "店名、聯絡方式與目標即可。照片/文案不完整也沒問題，可在製作過程中完善。",
        },
        {
          q: "切換官網和電商會很難嗎？",
          a: "不會，設計為一鍵切換，營運者不易迷路。",
        },
        {
          q: "可以只用手機更新嗎？",
          a: "可以。公告、菜單、商品等更新以手機友善為前提。",
        },
        {
          q: "上線後有支援嗎？",
          a: "有。支援範圍依方案/合約內容而定。",
        },
      ],
      contactTitle: "聯絡我們",
      contactText:
        "告訴我們你的需求（集客/預約/銷售等）。我們會提供最快上線的流程建議。",
      toProductsText: "回到首頁",
    },
  },

  /* ========= 韓国語 ========= */
  ko: {
    home: {
      headline: "Pageit",
      description:
        "웹사이트와 이커머스(예약/판매)를 원탭으로 전환. 초기 제작과 오픈 설정까지 지원하고, 운영 업데이트는 스마트폰으로 쉽게 할 수 있습니다.",
    },
    stores: {
      heroTitle: "Pageit ─ 적용 업종",
      heroAreas: "온라인 지원(전국)",
      heroLead:
        "음식점, 살롱, 가사서비스, 공사업 등 업종에 맞춰 페이지 구조를 최적화합니다.",
      heroTail:
        "원하는 목표를 알려주시면 최소한의 노력으로 빠르게 오픈할 수 있게 안내합니다.",
      heroIntroLine:
        "Pageit는 ‘집객’과 ‘예약/판매’를 한 번에 설계하는 웹사이트 기반입니다.",
    },
    areasLocal: {
      h1: "Pageit로 할 수 있는 것",
      lead: "웹사이트와 이커머스(예약/판매)를 원탭으로 전환, 운영은 스마트폰 중심.",
      services: [
        {
          title: "제작부터 오픈까지 한 번에",
          bullets: [
            "오픈에 필요한 설정을 포함해 운영 시작까지 지원",
            "사진/문구가 부족해도 상담하며 정리",
            "공지/메뉴/상품 등 스마트폰으로 간단 업데이트",
          ],
        },
        {
          title: "웹사이트 × 예약/판매",
          bullets: [
            "표시 모드 원탭 전환",
            "업종별 동선 설계(예약/판매/메뉴)",
            "작게 개선하며 꾸준히 운영 가능",
          ],
        },
      ],
      coverageTitle: "추천 대상",
      coverageBody:
        "음식점 / 미용(네일) / 가사·청소 / 공사업 / 소매·물판매 / 각종 서비스업",
      faq: [
        {
          q: "시작하려면 무엇이 필요하나요?",
          a: "상호, 연락처, 목표만 알면 OK. 사진/문구가 미완성이어도 제작 과정에서 함께 정리합니다.",
        },
        {
          q: "웹사이트와 이커머스 전환이 어렵나요?",
          a: "아니요. 원탭 전환을 전제로 운영자가 헷갈리지 않게 설계합니다.",
        },
        {
          q: "스마트폰만으로 업데이트 가능한가요?",
          a: "네. 공지/메뉴/상품 업데이트는 모바일 중심으로 구성합니다.",
        },
        {
          q: "오픈 후 지원이 있나요?",
          a: "있습니다. 지원 범위는 플랜/계약에 따라 다릅니다.",
        },
      ],
      contactTitle: "문의하기",
      contactText:
        "원하는 목표(집객/예약/판매)를 알려주세요. 가장 빠른 오픈 경로를 제안합니다.",
      toProductsText: "상단으로",
    },
  },

  /* ========= フランス語 ========= */
  fr: {
    home: {
      headline: "Pageit",
      description:
        "Basculez en un clic entre un site vitrine et l’e-commerce (réservation/vente). Nous gérons la mise en place et le lancement, et vous mettez à jour facilement depuis votre téléphone.",
    },
    stores: {
      heroTitle: "Pageit ─ Secteurs",
      heroAreas: "À distance (national)",
      heroLead:
        "Restaurants, salons, services à domicile, artisans… structure optimisée selon votre activité.",
      heroTail:
        "Dites-nous votre objectif. Nous vous guidons vers un lancement rapide, avec un minimum d’effort.",
      heroIntroLine:
        "Pageit est une base de site conçue pour le marketing et la réservation/vente.",
    },
    areasLocal: {
      h1: "Ce que Pageit permet",
      lead: "Un clic pour passer du site vitrine à l’e-commerce (réservation/vente). Mises à jour mobiles.",
      services: [
        {
          title: "Mise en place & lancement",
          bullets: [
            "Configuration prête au lancement",
            "OK même si vous n’avez pas tous les contenus",
            "Mises à jour faciles : actus, menus, produits",
          ],
        },
        {
          title: "Site × E-commerce",
          bullets: [
            "Changement de mode en un clic",
            "Parcours adapté à votre métier",
            "Conçu pour de petites améliorations continues",
          ],
        },
      ],
      coverageTitle: "Idéal pour",
      coverageBody:
        "Restaurants, salons, services à domicile, artisans, commerce de détail, etc.",
      faq: [
        {
          q: "De quoi ai-je besoin pour commencer ?",
          a: "Les infos de base et vos objectifs suffisent. Nous aidons à structurer le contenu au fur et à mesure.",
        },
        {
          q: "Le changement de mode est-il compliqué ?",
          a: "Non. C’est prévu pour être simple, en un clic.",
        },
        {
          q: "Puis-je mettre à jour depuis mon téléphone ?",
          a: "Oui. L’édition est pensée pour le mobile.",
        },
        {
          q: "Y a-t-il un support après le lancement ?",
          a: "Oui, selon le plan choisi.",
        },
      ],
      contactTitle: "Contact",
      contactText:
        "Expliquez votre objectif (marketing, réservation, vente). Nous proposerons le chemin le plus rapide vers le lancement.",
      toProductsText: "Retour en haut",
    },
  },

  /* ========= スペイン語 ========= */
  es: {
    home: {
      headline: "Pageit",
      description:
        "Cambia con un toque entre web y e-commerce (reservas/ventas). Nos encargamos de la configuración y el lanzamiento; tú actualizas fácilmente desde el móvil.",
    },
    stores: {
      heroTitle: "Pageit ─ Sectores",
      heroAreas: "Remoto / Nacional",
      heroLead:
        "Restaurantes, salones, servicios a domicilio, contratistas… estructura optimizada según tu negocio.",
      heroTail:
        "Cuéntanos tu objetivo. Te guiamos para lanzar rápido con el mínimo esfuerzo.",
      heroIntroLine:
        "Pageit es una base web diseñada para marketing y reservas/ventas.",
    },
    areasLocal: {
      h1: "Qué puedes hacer con Pageit",
      lead: "Cambio con un toque entre web y e-commerce (reservas/ventas). Actualizaciones fáciles desde el móvil.",
      services: [
        {
          title: "Configuración y lanzamiento",
          bullets: [
            "Configuración lista para publicar",
            "No pasa nada si faltan fotos/textos al inicio",
            "Actualiza noticias, menús, productos, etc.",
          ],
        },
        {
          title: "Web × E-commerce",
          bullets: [
            "Cambio de modo con un toque",
            "Flujo adaptado a tu sector",
            "Pensado para mejoras pequeñas continuas",
          ],
        },
      ],
      coverageTitle: "Ideal para",
      coverageBody:
        "Restaurantes, salones, servicios a domicilio, contratistas, retail y más.",
      faq: [
        {
          q: "¿Qué necesito para empezar?",
          a: "Información básica del negocio y tu objetivo. Te ayudamos a completar el contenido durante la creación.",
        },
        {
          q: "¿Es difícil cambiar entre web y e-commerce?",
          a: "No. Está diseñado para ser simple y de un toque.",
        },
        {
          q: "¿Puedo actualizar desde el móvil?",
          a: "Sí. La edición es mobile-friendly.",
        },
        {
          q: "¿Hay soporte tras el lanzamiento?",
          a: "Sí, según el plan.",
        },
      ],
      contactTitle: "Contacto",
      contactText:
        "Dinos tu objetivo (marketing, reservas, ventas). Propondremos la ruta más rápida para lanzar.",
      toProductsText: "Volver arriba",
    },
  },

  /* ========= ドイツ語 ========= */
  de: {
    home: {
      headline: "Pageit",
      description:
        "Mit einem Tipp zwischen Website und E-Commerce (Buchung/Verkauf) wechseln. Wir übernehmen Setup & Launch, Updates gehen einfach per Smartphone.",
    },
    stores: {
      heroTitle: "Pageit ─ Branchen",
      heroAreas: "Remote / landesweit",
      heroLead:
        "Restaurants, Salons, Haushaltsservices, Handwerk… Struktur passend zu Ihrem Geschäft.",
      heroTail:
        "Sagen Sie uns Ihr Ziel. Wir führen Sie mit minimalem Aufwand zum schnellen Launch.",
      heroIntroLine:
        "Pageit ist eine Website-Basis für Marketing und Buchung/Verkauf.",
    },
    areasLocal: {
      h1: "Was Pageit kann",
      lead: "One-Tap Wechsel zwischen Website und E-Commerce (Buchung/Verkauf). Updates per Smartphone.",
      services: [
        {
          title: "Setup & Launch",
          bullets: [
            "Launch-fertige Einrichtung",
            "Auch ohne vollständige Fotos/Texte startbar",
            "Einfache Updates: News, Menüs, Produkte",
          ],
        },
        {
          title: "Website × E-Commerce",
          bullets: [
            "Moduswechsel per Tipp",
            "Flow passend zur Branche",
            "Für kontinuierliche kleine Verbesserungen",
          ],
        },
      ],
      coverageTitle: "Geeignet für",
      coverageBody:
        "Gastronomie, Beauty, Haushaltsservices, Handwerk, Einzelhandel und mehr.",
      faq: [
        {
          q: "Was brauche ich zum Start?",
          a: "Grundinfos und Ihr Ziel reichen. Inhalte können wir im Prozess gemeinsam verfeinern.",
        },
        {
          q: "Ist der Wechsel zwischen Website und E-Commerce kompliziert?",
          a: "Nein. Es ist als One-Tap und einfach für Betreiber konzipiert.",
        },
        {
          q: "Kann ich per Smartphone aktualisieren?",
          a: "Ja. Die Bedienung ist mobilfreundlich.",
        },
        {
          q: "Gibt es Support nach dem Launch?",
          a: "Ja, je nach Plan.",
        },
      ],
      contactTitle: "Kontakt",
      contactText:
        "Teilen Sie Ihr Ziel (Marketing/Buchung/Verkauf). Wir schlagen den schnellsten Weg zum Launch vor.",
      toProductsText: "Nach oben",
    },
  },

  /* ========= ポルトガル語 ========= */
  pt: {
    home: {
      headline: "Pageit",
      description:
        "Alterne com um toque entre site e e-commerce (agendamento/vendas). Cuidamos da configuração e do lançamento, e você atualiza facilmente pelo celular.",
    },
    stores: {
      heroTitle: "Pageit ─ Setores",
      heroAreas: "Remoto / Nacional",
      heroLead:
        "Restaurantes, salões, serviços domésticos, construtoras… estrutura otimizada por segmento.",
      heroTail:
        "Conte seu objetivo. Vamos orientar o caminho mais rápido para lançar com o mínimo esforço.",
      heroIntroLine:
        "Pageit é uma base de site para marketing e agendamento/vendas.",
    },
    areasLocal: {
      h1: "O que dá para fazer com Pageit",
      lead: "Troca com um toque entre site e e-commerce (agendamento/vendas). Atualizações fáceis no celular.",
      services: [
        {
          title: "Configuração e lançamento",
          bullets: [
            "Configuração pronta para publicar",
            "Tudo bem se faltar foto/texto no início",
            "Atualize notícias, menus, produtos etc.",
          ],
        },
        {
          title: "Site × E-commerce",
          bullets: [
            "Troca de modo com um toque",
            "Fluxo adaptado ao seu negócio",
            "Pensado para pequenas melhorias contínuas",
          ],
        },
      ],
      coverageTitle: "Ideal para",
      coverageBody:
        "Restaurantes, beleza, serviços domésticos, construção, varejo e outros serviços.",
      faq: [
        {
          q: "O que preciso para começar?",
          a: "Informações básicas e seu objetivo. Ajudamos a finalizar o conteúdo durante a criação.",
        },
        {
          q: "É difícil alternar entre site e e-commerce?",
          a: "Não. Foi desenhado para ser simples e com um toque.",
        },
        {
          q: "Posso atualizar pelo celular?",
          a: "Sim. A edição é mobile-friendly.",
        },
        {
          q: "Há suporte após o lançamento?",
          a: "Sim, depende do plano.",
        },
      ],
      contactTitle: "Contato",
      contactText:
        "Diga seu objetivo (marketing, agendamento, vendas). Propomos a rota mais rápida para lançar.",
      toProductsText: "Voltar ao topo",
    },
  },

  /* ========= イタリア語 ========= */
  it: {
    home: {
      headline: "Pageit",
      description:
        "Passa con un tap dal sito all’e-commerce (prenotazioni/vendite). Gestiamo setup e lancio, e puoi aggiornare facilmente dal telefono.",
    },
    stores: {
      heroTitle: "Pageit ─ Settori",
      heroAreas: "Da remoto / Nazionale",
      heroLead:
        "Ristoranti, saloni, servizi domestici, imprese… struttura ottimizzata per settore.",
      heroTail:
        "Raccontaci l’obiettivo. Ti guidiamo al lancio rapido con il minimo sforzo.",
      heroIntroLine:
        "Pageit è una base sito pensata per marketing e prenotazioni/vendite.",
    },
    areasLocal: {
      h1: "Cosa puoi fare con Pageit",
      lead: "Switch con un tap tra sito ed e-commerce (prenotazioni/vendite). Aggiornamenti facili da smartphone.",
      services: [
        {
          title: "Setup e lancio",
          bullets: [
            "Configurazione pronta per la pubblicazione",
            "Ok anche senza tutti i contenuti iniziali",
            "Aggiorna news, menu, prodotti, ecc.",
          ],
        },
        {
          title: "Sito × E-commerce",
          bullets: [
            "Cambio modalità con un tap",
            "Flusso su misura per il tuo business",
            "Pensato per piccoli miglioramenti continui",
          ],
        },
      ],
      coverageTitle: "Ideale per",
      coverageBody:
        "Ristorazione, beauty, servizi domestici, imprese, retail e altri servizi.",
      faq: [
        {
          q: "Cosa serve per iniziare?",
          a: "Bastano info base e obiettivi. Possiamo perfezionare i contenuti durante la realizzazione.",
        },
        {
          q: "È difficile passare tra sito ed e-commerce?",
          a: "No. È progettato per essere semplice e in un tap.",
        },
        {
          q: "Posso aggiornare dal telefono?",
          a: "Sì. L’editor è mobile-friendly.",
        },
        {
          q: "C’è supporto dopo il lancio?",
          a: "Sì, a seconda del piano.",
        },
      ],
      contactTitle: "Contatti",
      contactText:
        "Dicci l’obiettivo (marketing, prenotazioni, vendite). Proporremo il percorso più rapido per il lancio.",
      toProductsText: "Torna su",
    },
  },

  /* ========= ロシア語 ========= */
  ru: {
    home: {
      headline: "Pageit",
      description:
        "Переключайтесь одним нажатием между сайтом и e-commerce (запись/продажи). Мы делаем настройку и запуск, обновления — легко со смартфона.",
    },
    stores: {
      heroTitle: "Pageit ─ Сферы",
      heroAreas: "Удалённо / по стране",
      heroLead:
        "Рестораны, салоны, услуги по дому, подрядчики и др. — структура под вашу сферу.",
      heroTail:
        "Скажите цель — предложим самый быстрый путь к запуску с минимумом усилий.",
      heroIntroLine:
        "Pageit — основа сайта для маркетинга и записи/продаж в одном месте.",
    },
    areasLocal: {
      h1: "Что умеет Pageit",
      lead: "Переключение сайт ↔ e-commerce (запись/продажи) одним нажатием. Обновления со смартфона.",
      services: [
        {
          title: "Настройка и запуск",
          bullets: [
            "Подготовка к запуску, включая настройки публикации",
            "Можно начать даже без всех фото/текстов",
            "Лёгкие обновления: новости, меню, товары",
          ],
        },
        {
          title: "Сайт × e-commerce",
          bullets: [
            "Режимы одним нажатием",
            "Сценарий под ваш бизнес",
            "Поддержка небольших улучшений без остановки",
          ],
        },
      ],
      coverageTitle: "Подходит для",
      coverageBody:
        "Общепит, beauty, домашние услуги, строительство/ремонт, розница и др.",
      faq: [
        {
          q: "Что нужно для старта?",
          a: "Достаточно базовой информации и вашей цели. Контент можно доработать в процессе.",
        },
        {
          q: "Сложно ли переключать режимы?",
          a: "Нет. Это сделано максимально просто — одним нажатием.",
        },
        {
          q: "Можно ли обновлять только со смартфона?",
          a: "Да. Редактирование рассчитано на мобильные устройства.",
        },
        {
          q: "Есть ли поддержка после запуска?",
          a: "Да, в зависимости от тарифа.",
        },
      ],
      contactTitle: "Связаться с нами",
      contactText:
        "Опишите цель (маркетинг, запись, продажи). Мы предложим самый быстрый путь к запуску.",
      toProductsText: "Наверх",
    },
  },

  /* ========= タイ語 ========= */
  th: {
    home: {
      headline: "Pageit",
      description:
        "สลับระหว่างเว็บไซต์และอีคอมเมิร์ซ (จอง/ขาย) ได้ในแตะเดียว เราดูแลการตั้งค่าและการเปิดใช้งาน อัปเดตได้ง่ายจากมือถือ",
    },
    stores: {
      heroTitle: "Pageit ─ ประเภทธุรกิจ",
      heroAreas: "ออนไลน์ / ทั่วประเทศ",
      heroLead:
        "ร้านอาหาร ซาลอน บริการแม่บ้าน ผู้รับเหมา ฯลฯ ปรับโครงสร้างให้เหมาะกับธุรกิจของคุณ",
      heroTail:
        "บอกเป้าหมายของคุณ เราจะแนะนำเส้นทางเปิดใช้งานที่เร็วที่สุดด้วยแรงน้อยที่สุด",
      heroIntroLine:
        "Pageit คือฐานเว็บไซต์ที่รวมการตลาดและการจอง/ขายไว้ด้วยกัน",
    },
    areasLocal: {
      h1: "Pageit ทำอะไรได้บ้าง",
      lead: "สลับโหมดเว็บไซต์ ↔ อีคอมเมิร์ซ (จอง/ขาย) ในแตะเดียว อัปเดตผ่านมือถือได้ง่าย",
      services: [
        {
          title: "ดูแลตั้งค่าและเปิดใช้งาน",
          bullets: [
            "ตั้งค่าให้พร้อมเปิดใช้งาน",
            "เริ่มได้แม้รูป/ข้อความยังไม่ครบ",
            "อัปเดตข่าว เมนู สินค้า ได้ง่าย",
          ],
        },
        {
          title: "เว็บไซต์ × จอง/ขาย",
          bullets: [
            "สลับโหมดในแตะเดียว",
            "ออกแบบเส้นทางตามธุรกิจ",
            "รองรับการปรับปรุงเล็กๆ อย่างต่อเนื่อง",
          ],
        },
      ],
      coverageTitle: "เหมาะกับใคร",
      coverageBody:
        "ร้านอาหาร / ความงาม / บริการแม่บ้าน / ผู้รับเหมา / ค้าปลีก / ธุรกิจบริการต่างๆ",
      faq: [
        {
          q: "ต้องเตรียมอะไรเพื่อเริ่มต้น?",
          a: "ข้อมูลพื้นฐานและเป้าหมายก็พอ เราช่วยจัดเนื้อหาให้ระหว่างทำได้",
        },
        {
          q: "สลับเว็บไซต์กับอีคอมเมิร์ซยากไหม?",
          a: "ไม่ยาก ออกแบบให้แตะเดียวและใช้งานง่าย",
        },
        {
          q: "อัปเดตจากมือถือได้ไหม?",
          a: "ได้ ออกแบบให้เหมาะกับมือถือ",
        },
        {
          q: "มีซัพพอร์ตหลังเปิดใช้งานไหม?",
          a: "มี ตามแผนบริการ",
        },
      ],
      contactTitle: "ติดต่อเรา",
      contactText:
        "บอกเป้าหมาย (การตลาด/จอง/ขาย) เราจะแนะนำวิธีเปิดใช้งานที่เร็วที่สุด",
      toProductsText: "กลับไปด้านบน",
    },
  },

  /* ========= ベトナム語 ========= */
  vi: {
    home: {
      headline: "Pageit",
      description:
        "Chuyển đổi một chạm giữa website và e-commerce (đặt lịch/bán hàng). Chúng tôi lo phần thiết lập & ra mắt; bạn cập nhật dễ dàng trên điện thoại.",
    },
    stores: {
      heroTitle: "Pageit ─ Ngành phù hợp",
      heroAreas: "Từ xa / Toàn quốc",
      heroLead:
        "Nhà hàng, salon, dịch vụ gia đình, nhà thầu… tối ưu cấu trúc theo ngành.",
      heroTail:
        "Hãy cho biết mục tiêu của bạn. Chúng tôi đề xuất lộ trình ra mắt nhanh với ít công sức nhất.",
      heroIntroLine:
        "Pageit là nền tảng website kết hợp marketing và đặt lịch/bán hàng.",
    },
    areasLocal: {
      h1: "Pageit làm được gì",
      lead: "Chuyển đổi một chạm giữa website và e-commerce (đặt lịch/bán). Cập nhật dễ trên di động.",
      services: [
        {
          title: "Thiết lập & ra mắt",
          bullets: [
            "Thiết lập sẵn sàng ra mắt",
            "Không sao nếu chưa đủ ảnh/nội dung",
            "Cập nhật tin tức, menu, sản phẩm dễ dàng",
          ],
        },
        {
          title: "Website × E-commerce",
          bullets: [
            "Chuyển chế độ một chạm",
            "Luồng phù hợp theo ngành",
            "Hỗ trợ cải tiến nhỏ liên tục",
          ],
        },
      ],
      coverageTitle: "Phù hợp với",
      coverageBody:
        "Nhà hàng, làm đẹp, dịch vụ gia đình, xây dựng, bán lẻ và các dịch vụ khác.",
      faq: [
        {
          q: "Cần chuẩn bị gì để bắt đầu?",
          a: "Chỉ cần thông tin cơ bản và mục tiêu. Nội dung có thể hoàn thiện trong quá trình làm.",
        },
        {
          q: "Chuyển giữa website và e-commerce có khó không?",
          a: "Không. Thiết kế để một chạm và dễ vận hành.",
        },
        {
          q: "Có thể cập nhật bằng điện thoại không?",
          a: "Có. Trải nghiệm chỉnh sửa ưu tiên di động.",
        },
        {
          q: "Có hỗ trợ sau khi ra mắt không?",
          a: "Có, tùy gói.",
        },
      ],
      contactTitle: "Liên hệ",
      contactText:
        "Hãy nói mục tiêu (marketing/đặt lịch/bán). Chúng tôi sẽ đề xuất cách ra mắt nhanh nhất.",
      toProductsText: "Về đầu trang",
    },
  },

  /* ========= インドネシア語 ========= */
  id: {
    home: {
      headline: "Pageit",
      description:
        "Beralih satu ketukan antara website dan e-commerce (booking/penjualan). Kami urus setup & peluncuran; Anda bisa update mudah lewat ponsel.",
    },
    stores: {
      heroTitle: "Pageit ─ Industri",
      heroAreas: "Remote / Nasional",
      heroLead:
        "Restoran, salon, layanan rumah tangga, kontraktor, dll. Struktur dioptimalkan sesuai bisnis.",
      heroTail:
        "Ceritakan target Anda. Kami pandu jalur tercepat untuk launching dengan usaha minimal.",
      heroIntroLine:
        "Pageit adalah fondasi website untuk marketing dan booking/penjualan.",
    },
    areasLocal: {
      h1: "Apa yang bisa dilakukan Pageit",
      lead: "Ganti mode website ↔ e-commerce (booking/penjualan) satu ketukan. Update mudah via ponsel.",
      services: [
        {
          title: "Setup & launching",
          bullets: [
            "Setup siap tayang",
            "Tak masalah jika foto/teks belum lengkap",
            "Update berita, menu, produk, dll.",
          ],
        },
        {
          title: "Website × E-commerce",
          bullets: [
            "Ganti mode satu ketukan",
            "Alur sesuai jenis bisnis",
            "Dirancang untuk perbaikan kecil berkelanjutan",
          ],
        },
      ],
      coverageTitle: "Cocok untuk",
      coverageBody:
        "Restoran, beauty, layanan rumah tangga, konstruksi, ritel, dan layanan lainnya.",
      faq: [
        {
          q: "Apa yang dibutuhkan untuk mulai?",
          a: "Info dasar dan tujuan Anda. Konten bisa disempurnakan sambil berjalan.",
        },
        {
          q: "Apakah sulit beralih mode?",
          a: "Tidak. Dirancang sederhana satu ketukan.",
        },
        {
          q: "Bisa update dari ponsel?",
          a: "Bisa. Editing dibuat ramah mobile.",
        },
        {
          q: "Ada dukungan setelah launching?",
          a: "Ada, tergantung paket.",
        },
      ],
      contactTitle: "Hubungi kami",
      contactText:
        "Sampaikan tujuan (marketing/booking/penjualan). Kami usulkan cara tercepat untuk launching.",
      toProductsText: "Kembali ke atas",
    },
  },

  /* ========= ヒンディー語 ========= */
  hi: {
    home: {
      headline: "Pageit",
      description:
        "एक टैप में वेबसाइट और ई-कॉमर्स (बुकिंग/सेल्स) के बीच स्विच करें। हम सेटअप और लॉन्च संभालते हैं; अपडेट मोबाइल से आसान है।",
    },
    stores: {
      heroTitle: "Pageit ─ उद्योग",
      heroAreas: "रिमोट / राष्ट्रीय",
      heroLead:
        "रेस्टोरेंट, सैलून, होम सर्विस, कॉन्ट्रैक्टर आदि—आपके बिज़नेस के हिसाब से स्ट्रक्चर ऑप्टिमाइज़।",
      heroTail:
        "अपना लक्ष्य बताइए। हम न्यूनतम मेहनत में तेज़ लॉन्च का रास्ता बताएँगे।",
      heroIntroLine:
        "Pageit एक वेबसाइट बेस है जो मार्केटिंग और बुकिंग/सेल्स को जोड़ता है।",
    },
    areasLocal: {
      h1: "Pageit से क्या कर सकते हैं",
      lead: "वेबसाइट ↔ ई-कॉमर्स (बुकिंग/सेल्स) एक टैप में। मोबाइल से आसान अपडेट।",
      services: [
        {
          title: "सेटअप और लॉन्च",
          bullets: [
            "लॉन्च-रेडी सेटअप",
            "फोटो/टेक्स्ट अधूरे हों तब भी शुरू कर सकते हैं",
            "न्यूज़, मेन्यू, प्रोडक्ट अपडेट आसान",
          ],
        },
        {
          title: "वेबसाइट × ई-कॉमर्स",
          bullets: [
            "एक टैप में मोड स्विच",
            "बिज़नेस के अनुसार फ्लो",
            "छोटे-छोटे सुधार के लिए डिज़ाइन",
          ],
        },
      ],
      coverageTitle: "किसके लिए",
      coverageBody:
        "रेस्टोरेंट / ब्यूटी / होम सर्विस / कंस्ट्रक्शन / रिटेल / अन्य सेवाएँ",
      faq: [
        {
          q: "शुरू करने के लिए क्या चाहिए?",
          a: "बेसिक जानकारी और आपका लक्ष्य काफी है। कंटेंट हम बनाते समय साथ में ठीक कर देंगे।",
        },
        {
          q: "मोड स्विच करना मुश्किल है?",
          a: "नहीं। इसे एक टैप और आसान ऑपरेशन के लिए बनाया गया है।",
        },
        {
          q: "क्या मोबाइल से अपडेट कर सकते हैं?",
          a: "हाँ। एडिटिंग मोबाइल-फ्रेंडली है।",
        },
        {
          q: "लॉन्च के बाद सपोर्ट मिलता है?",
          a: "हाँ, प्लान के अनुसार।",
        },
      ],
      contactTitle: "संपर्क करें",
      contactText:
        "अपना लक्ष्य (मार्केटिंग/बुकिंग/सेल्स) बताइए। हम लॉन्च का सबसे तेज़ रास्ता बताएँगे।",
      toProductsText: "ऊपर लौटें",
    },
  },

  /* ========= アラビア語 ========= */
  ar: {
    home: {
      headline: "Pageit",
      description:
        "بدّل بنقرة واحدة بين الموقع والمتجر (حجز/بيع). نحن نتولى الإعداد والإطلاق، ويمكنك التحديث بسهولة عبر الهاتف.",
    },
    stores: {
      heroTitle: "Pageit ─ المجالات",
      heroAreas: "عن بُعد / على مستوى البلد",
      heroLead:
        "مطاعم، صالونات، خدمات منزلية، مقاولون… بنية صفحات مناسبة لطبيعة عملك.",
      heroTail: "أخبرنا بهدفك وسنقترح أسرع طريق للإطلاق بأقل جهد.",
      heroIntroLine:
        "Pageit منصة موقع تجمع التسويق مع الحجز/البيع في مكان واحد.",
    },
    areasLocal: {
      h1: "ماذا يقدّم Pageit",
      lead: "تبديل بنقرة واحدة بين الموقع والمتجر (حجز/بيع)، وتحديثات سهلة عبر الهاتف.",
      services: [
        {
          title: "الإعداد والإطلاق",
          bullets: [
            "إعداد جاهز للإطلاق",
            "لا مشكلة إن لم تكتمل الصور/النصوص بعد",
            "تحديث الأخبار والقوائم والمنتجات بسهولة",
          ],
        },
        {
          title: "موقع × متجر",
          bullets: [
            "تبديل الوضع بنقرة واحدة",
            "مسار حجز/بيع مناسب لنشاطك",
            "مصمم لتحسينات صغيرة مستمرة",
          ],
        },
      ],
      coverageTitle: "مناسب لـ",
      coverageBody:
        "مطاعم / تجميل / خدمات منزلية / مقاولات / بيع بالتجزئة / خدمات متنوعة",
      faq: [
        {
          q: "ماذا أحتاج للبدء؟",
          a: "معلومات أساسية وهدفك يكفيان. يمكننا تحسين المحتوى أثناء البناء.",
        },
        {
          q: "هل التبديل بين الوضعين صعب؟",
          a: "لا. صُمّم ليكون بنقرة واحدة وسهل التشغيل.",
        },
        {
          q: "هل يمكنني التحديث عبر الهاتف فقط؟",
          a: "نعم. التحرير مُصمم ليكون مناسبًا للهاتف.",
        },
        {
          q: "هل يوجد دعم بعد الإطلاق؟",
          a: "نعم، حسب الخطة.",
        },
      ],
      contactTitle: "تواصل معنا",
      contactText: "أخبرنا بهدفك (تسويق/حجز/بيع) وسنقترح أسرع طريق للإطلاق.",
      toProductsText: "العودة للأعلى",
    },
  },
};

/* =========================
   Footer L10N（サイト名は自動追従）
========================= */
function footerAlt(name: string) {
  return name || "Official Website";
}

/** Footer の多言語テキスト */
export const FOOTER_STRINGS: Record<string, FooterI18n> = {
  ja: {
    cta: "無料相談・お問い合わせ",
    snsAria: "SNSリンク",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "公式サイト",
    siteAlt: site.name,
    areaLinkText: "Pageitでできること",
    rights: "All rights reserved.",
  },
  en: {
    cta: "Contact us",
    snsAria: "Social links",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Official website",
    siteAlt: footerAlt(site.name),
    areaLinkText: "What you can do with Pageit",
    rights: "All rights reserved.",
  },
  zh: {
    cta: "免费咨询・联系",
    snsAria: "社交链接",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "官网",
    siteAlt: "Pageit 官方网站",
    areaLinkText: "Pageit 能做什么",
    rights: "版权所有。",
  },
  "zh-TW": {
    cta: "免費諮詢・聯絡我們",
    snsAria: "社群連結",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "官方網站",
    siteAlt: "Pageit 官方網站",
    areaLinkText: "Pageit 可以做什麼",
    rights: "版權所有。",
  },
  ko: {
    cta: "문의하기",
    snsAria: "SNS 링크",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "공식 사이트",
    siteAlt: "Pageit 공식",
    areaLinkText: "Pageit로 할 수 있는 것",
    rights: "All rights reserved.",
  },
  fr: {
    cta: "Nous contacter",
    snsAria: "Liens sociaux",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Site officiel",
    siteAlt: "Pageit (Officiel)",
    areaLinkText: "Ce que Pageit permet",
    rights: "Tous droits réservés.",
  },
  es: {
    cta: "Contáctanos",
    snsAria: "Enlaces sociales",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Sitio oficial",
    siteAlt: "Pageit (Oficial)",
    areaLinkText: "Qué puedes hacer con Pageit",
    rights: "Todos los derechos reservados.",
  },
  de: {
    cta: "Kontakt",
    snsAria: "Soziale Links",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Offizielle Website",
    siteAlt: "Pageit (Offiziell)",
    areaLinkText: "Was Pageit kann",
    rights: "Alle Rechte vorbehalten.",
  },
  pt: {
    cta: "Fale conosco",
    snsAria: "Redes sociais",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Site oficial",
    siteAlt: "Pageit (Oficial)",
    areaLinkText: "O que dá para fazer com Pageit",
    rights: "Todos os direitos reservados.",
  },
  it: {
    cta: "Contattaci",
    snsAria: "Link social",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Sito ufficiale",
    siteAlt: "Pageit (Ufficiale)",
    areaLinkText: "Cosa puoi fare con Pageit",
    rights: "Tutti i diritti riservati.",
  },
  ru: {
    cta: "Связаться с нами",
    snsAria: "Ссылки на соцсети",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Официальный сайт",
    siteAlt: "Pageit (Официальный)",
    areaLinkText: "Что умеет Pageit",
    rights: "Все права защищены.",
  },
  th: {
    cta: "ติดต่อเรา",
    snsAria: "ลิงก์โซเชียล",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "เว็บไซต์ทางการ",
    siteAlt: "Pageit (ทางการ)",
    areaLinkText: "Pageit ทำอะไรได้บ้าง",
    rights: "สงวนลิขสิทธิ์",
  },
  vi: {
    cta: "Liên hệ",
    snsAria: "Liên kết mạng xã hội",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Trang chính thức",
    siteAlt: "Pageit (Chính thức)",
    areaLinkText: "Pageit làm được gì",
    rights: "Mọi quyền được bảo lưu.",
  },
  id: {
    cta: "Hubungi kami",
    snsAria: "Tautan sosial",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "Situs resmi",
    siteAlt: "Pageit (Resmi)",
    areaLinkText: "Apa yang bisa dilakukan Pageit",
    rights: "Hak cipta dilindungi.",
  },
  hi: {
    cta: "संपर्क करें",
    snsAria: "सोशल लिंक",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "आधिकारिक वेबसाइट",
    siteAlt: "Pageit (आधिकारिक)",
    areaLinkText: "Pageit से क्या कर सकते हैं",
    rights: "सर्वाधिकार सुरक्षित।",
  },
  ar: {
    cta: "اتصل بنا",
    snsAria: "روابط التواصل الاجتماعي",
    instagramAlt: "Instagram",
    lineAlt: "LINE",
    siteAria: "الموقع الرسمي",
    siteAlt: "Pageit (رسمي)",
    areaLinkText: "ماذا يقدّم Pageit",
    rights: "جميع الحقوق محفوظة.",
  },
};

/* =========================
   FAQ データ（ここで集約管理）
========================= */
export const faqItems: FaqItem[] = [
  {
    question: "Pageitは何のサービスですか？",
    answer:
      "店舗・事業者向けに、ホームページとEC（予約・販売）を一体で運用できる仕組みを提供します。ワンタップで表示モードを切り替えられる設計が特徴です。",
  },
  {
    question: "制作はどこまでやってくれますか？",
    answer:
      "初期制作・公開に必要な設定・基本ページ作成まで、運用開始できる状態に整えてお渡しします（内容はプランにより異なります）。",
  },
  {
    question: "スマホだけで更新できますか？",
    answer:
      "はい。お知らせ、メニュー、商品などの更新はスマホ中心で完結できるように設計しています。",
  },
  {
    question: "ホームページとECはどう切り替えますか？",
    answer:
      "サイト側でワンタップ切り替えを想定しています。ユーザー導線が混乱しないように設計します。",
  },
  {
    question: "相談・見積もりは無料ですか？",
    answer:
      "はい。まずはやりたい内容を伺い、運用開始までの流れと必要な作業を整理してご案内します。",
  },
];

/* =========================
   ページ辞書（ogImage は任意）
========================= */
export type PageDefWithOg = PageDef & { ogImage?: string };

const PAGES = {
  home: {
    path: "/",
    title: `${site.name}｜${site.tagline}`,
    description:
      "ホームページとEC（予約・販売）をワンタップで切り替え。初期制作・公開設定までまとめて対応し、最短で運用開始。",
    ogType: "website",
  },
  about: {
    path: "/about",
    title: `Pageitについて｜${site.name}`,
    description:
      "Pageit（ページット）は、店舗・事業者の集客と予約/販売を一体で運用できるホームページ基盤です。",
    ogType: "website",
  },
  news: {
    path: "/news",
    title: `お知らせ｜${site.name}`,
    description: `${site.name} の最新情報・アップデート・運用ヒントを掲載します。`,
    ogType: "website",
  },
  areasLocal: {
    path: "/areas/local",
    title: `Pageitでできること｜${site.name}`,
    description:
      "ホームページ×EC（予約・販売）をワンタップで切り替え。スマホ中心で更新できる設計で運用を継続しやすい。",
    ogType: "article",
  },
  products: {
    path: "/products",
    title: `機能・サービス一覧｜${site.name}`,
    description:
      "Pageit（ページット）の機能・サービス一覧。導入の流れ、更新項目、運用のポイントなどをまとめています。",
    ogType: "website",
    ogImage: "/ogp-products.jpg",
  },
  productsEC: {
    path: "/products-ec",
    title: `オンライン予約・販売（デモ）｜${site.name}`,
    description:
      "予約・販売の導線イメージ（デモ/サンプル）として、EC表示モードの例を掲載します。",
    ogType: "website",
    ogImage: "/ogp-products.jpg",
  },
  projects: {
    path: "/projects",
    title: `導入の流れ｜${site.name}`,
    description:
      "ヒアリングから初期制作、公開、運用開始までの流れを分かりやすくご案内します。",
    ogType: "website",
  },
  stores: {
    path: "/stores",
    title: `対応業種｜${site.name}`,
    description:
      "飲食店・サロン・家事代行・工務店など、業種に合わせた最適な構成をご提案します。",
    ogType: "website",
  },
  faq: {
    path: "/faq",
    title: `よくある質問（FAQ）｜${site.name}`,
    description:
      "料金・制作範囲・運用方法・更新のしやすさなど、Pageit（ページット）に関するよくある質問。",
    ogType: "article",
  },
} as const satisfies Record<string, PageDefWithOg>;

export type PageKey = keyof typeof PAGES;
const pages: Record<PageKey, PageDefWithOg> = PAGES;

/* =========================
   SEO メタデータビルダー
========================= */
export const seo = {
  base: (): Metadata => ({
    title: `${site.name}｜${site.tagline}`,
    description: site.description,
    keywords: Array.from(site.keywords),
    authors: [{ name: site.name }],
    metadataBase: METADATA_BASE_SAFE,
    alternates: { canonical: pageUrl("/") },

    verification: site.googleSiteVerification
      ? { google: site.googleSiteVerification }
      : undefined,

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },

    openGraph: {
      title: `${site.name}｜${site.tagline}`,
      description: site.description,
      url: pageUrl("/"),
      siteName: site.name,
      type: "website",
      images: [
        {
          url: pageUrl(site.logoPath),
          width: 1200,
          height: 630,
          alt: `${site.name} OGP`,
        },
      ],
      locale: "ja_JP",
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name}｜${site.tagline}`,
      description: site.description,
      images: [pageUrl(site.logoPath)],
    },
    icons: {
      icon: [
        { url: "/favicon.ico?v=4" },
        { url: "/icon.png", type: "image/png", sizes: "any" },
      ],
      apple: "/icon.png",
      shortcut: "/favicon.ico?v=4",
    },
  }),

  page: (key: PageKey, extra?: Partial<Metadata>): Metadata => {
    const p = pages[key];
    return {
      title: p.title,
      description: p.description,
      keywords: Array.from(site.keywords),
      alternates: { canonical: pageUrl(p.path) },
      openGraph: {
        title: p.title,
        description: p.description,
        url: pageUrl(p.path),
        siteName: site.name,
        images: [
          {
            url: ogImage(p.ogImage),
            width: 1200,
            height: 630,
            alt: site.name,
          },
        ],
        locale: "ja_JP",
        type: p.ogType,
      },
      twitter: {
        card: "summary_large_image",
        title: p.title,
        description: p.description,
        images: [ogImage(p.ogImage)],
      },
      ...extra,
    };
  },
};

/* =========================
   FAQ → JSON-LD 変換
========================= */
export type QA = { q: string; a: string };
export function faqToJsonLd(faq: ReadonlyArray<QA>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/* =========================
   AI サイト設定（ブランド名/URLは site に追従）
========================= */
export const AI_SITE: AiSiteConfig = {
  brand: site.name,
  url: site.baseUrl,
  areasByLang: {
    ja: "全国（オンライン対応）",
    en: "Remote / Nationwide (Japan)",
  },
  servicesByLang: {
    ja: [
      "ホームページ制作",
      "EC（予約・販売）導線設計",
      "運用更新（お知らせ/メニュー/商品）",
      "集客用ページ作成",
    ],
    en: [
      "website setup",
      "booking/sales flow",
      "content updates",
      "marketing pages",
    ],
  },
  retail: true,
  productPageRoute: "/products",
  languages: {
    default: "ja",
    allowed: [
      "ja",
      "en",
      "zh",
      "zh-TW",
      "ko",
      "fr",
      "es",
      "de",
      "pt",
      "it",
      "ru",
      "th",
      "vi",
      "id",
      "hi",
      "ar",
    ],
  },
  limits: {
    qaBase: 30,
    qaOwner: 40,
    qaLearned: 60,
    menuLines: 120,
    productLines: 120,
    keywords: 200,
  },
};
