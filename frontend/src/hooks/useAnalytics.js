import { useEffect, useRef } from "react";

/**
 * Injects third-party analytics/tracking scripts into `document.head`
 * based on IDs from the CMS SiteSettings singleton's `analytics` object.
 *
 * Providers supported:
 *   - Google Analytics 4 (GA4)          — googleAnalyticsId  (G-XXXXXXXXXX)
 *   - Google Tag Manager (GTM)          — googleTagManagerId (GTM-XXXXXXX)
 *   - Facebook Pixel                    — facebookPixelId    (numeric string)
 *   - Hotjar                            — hotjarId           (numeric string)
 *   - Microsoft Clarity                 — microsoftClarityId (alphanumeric)
 *
 * Guards:
 *   - Only injects when the ID is a non-empty string.
 *   - Tracks which IDs have already been injected via a ref — safe to
 *     call in strict mode / remounts without double-injecting.
 *   - Removes previously injected scripts when the ID is cleared in the
 *     CMS, so disabling analytics actually takes effect (after reload).
 *
 * Security note: script content is constructed from server-validated IDs,
 * not from arbitrary user text, so there is no XSS surface here. The IDs
 * themselves are validated by SiteSettings' Mongoose schema (maxlength 40).
 */
export function useAnalytics(settings) {
  const analytics = settings?.analytics;
  const injectedRef = useRef({});

  useEffect(() => {
    if (!analytics) return;

    const {
      googleAnalyticsId,
      googleTagManagerId,
      facebookPixelId,
      hotjarId,
      microsoftClarityId,
    } = analytics;

    // ── Google Analytics 4 ─────────────────────────────────────────
    injectOrRemove({
      key: "ga4",
      id: googleAnalyticsId,
      injected: injectedRef.current,
      buildScripts: (id) => [
        buildScript({
          id: "ga4-loader",
          src: `https://www.googletagmanager.com/gtag/js?id=${id}`,
          async: true,
        }),
        buildInlineScript({
          id: "ga4-init",
          content: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}');`,
        }),
      ],
    });

    // ── Google Tag Manager ─────────────────────────────────────────
    injectOrRemove({
      key: "gtm",
      id: googleTagManagerId,
      injected: injectedRef.current,
      buildScripts: (id) => [
        buildInlineScript({
          id: "gtm-init",
          content: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`,
        }),
      ],
    });

    // ── Facebook Pixel ─────────────────────────────────────────────
    injectOrRemove({
      key: "fbpixel",
      id: facebookPixelId,
      injected: injectedRef.current,
      buildScripts: (id) => [
        buildInlineScript({
          id: "fb-pixel-init",
          content: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`,
        }),
      ],
    });

    // ── Hotjar ─────────────────────────────────────────────────────
    injectOrRemove({
      key: "hotjar",
      id: hotjarId,
      injected: injectedRef.current,
      buildScripts: (id) => [
        buildInlineScript({
          id: "hotjar-init",
          content: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${id},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
        }),
      ],
    });

    // ── Microsoft Clarity ──────────────────────────────────────────
    injectOrRemove({
      key: "clarity",
      id: microsoftClarityId,
      injected: injectedRef.current,
      buildScripts: (id) => [
        buildInlineScript({
          id: "clarity-init",
          content: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`,
        }),
      ],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    analytics?.googleAnalyticsId,
    analytics?.googleTagManagerId,
    analytics?.facebookPixelId,
    analytics?.hotjarId,
    analytics?.microsoftClarityId,
  ]);
}

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Either injects the script tags for a given provider (if the ID is
 * non-empty and not already injected) or removes them (if the ID was
 * cleared). Tracks state in the `injected` map (keyed by provider key).
 */
function injectOrRemove({ key, id, injected, buildScripts }) {
  const trimmedId = typeof id === "string" ? id.trim() : "";

  if (!trimmedId) {
    // ID was cleared — remove any previously injected elements.
    const existingIds = injected[key];
    if (existingIds) {
      existingIds.forEach((elId) => document.getElementById(elId)?.remove());
      delete injected[key];
    }
    return;
  }

  // Already injected with this exact ID — skip.
  if (injected[key]) return;

  const scripts = buildScripts(trimmedId);
  const elementIds = [];
  scripts.forEach((el) => {
    if (!document.getElementById(el.id)) {
      document.head.appendChild(el);
    }
    elementIds.push(el.id);
  });
  injected[key] = elementIds;
}

function buildScript({ id, src, async: isAsync }) {
  const el = document.createElement("script");
  el.id = id;
  el.src = src;
  if (isAsync) el.async = true;
  return el;
}

function buildInlineScript({ id, content }) {
  const el = document.createElement("script");
  el.id = id;
  el.textContent = content;
  return el;
}

export default useAnalytics;
