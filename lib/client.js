/**
 * @dsh-external/android-fit-plugin — client bundle (hand-written for
 * window.__ModuleLoader__.load, no build step required).
 *
 * Adapts the settings panel for Android WebView:
 *  - portrait (<640px): full-bleed panel, safe-area insets (env()),
 *    dynamic viewport height (dvh) for keyboard/short viewports;
 *  - landscape phones / narrow windows (640–1023px): clamp the fixed
 *    800px panel into the viewport with safe-area margins;
 *  - touch polish: tap-highlight off, text-size-adjust 100%,
 *    overscroll containment; optional 44px touch targets and motion
 *    reduction toggles in the "安卓适配" settings section.
 */
window.__ModuleLoader__.load({
  id: '@dsh-external/android-fit-plugin',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    let react = require('react')

    const BASE_CSS = `
/* Portrait phones: full-bleed settings panel and any dialog, respecting safe-area */
@media (max-width: 639px) {
  /* Settings panel (has nav) */
  [role='dialog'][aria-modal='true']:has(> nav) {
    width: calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
    max-width: calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
    height: min(720px, calc(100vh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    height: min(720px, calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    max-height: min(720px, calc(100vh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    max-height: min(720px, calc(100dvh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
  }
  /* Any other dialogs without a nav (e.g. confirm, onboarding) */
  [role='dialog'][aria-modal='true']:not(:has(> nav)) {
    width: calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
    max-width: calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
    max-height: calc(100vh - 24px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
  }
}

/* Landscape phones / narrow windows: clamp the fixed 800px panel into the viewport */
@media (min-width: 640px) and (max-width: 1023px) {
  [role='dialog'][aria-modal='true']:has(> nav) {
    width: min(800px, calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
    max-width: min(800px, calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)));
    height: min(720px, calc(100vh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    height: min(720px, calc(100dvh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    max-height: min(720px, calc(100vh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
    max-height: min(720px, calc(100dvh - 32px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)));
  }
}

/* WebView / touch polish for any dialog at any size */
[role='dialog'][aria-modal='true'] {
  -webkit-tap-highlight-color: transparent;
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}
[role='dialog'][aria-modal='true'] > div:nth-child(2) {
  overscroll-behavior: contain;
}

/* ContextMeter popover (JObwrW_panel): the generic mobile fallback
   (html[data-dsh-mobile] [class*="panel"] { max-width:100% !important })
   clamps max-width to the 28px trigger (its containing block), crushing
   the 264px panel into a vertical sliver with one-char-per-line text.
   Restore the intended width, capped to the viewport. */
html[data-dsh-mobile] .JObwrW_panel {
  max-width: none !important;
  width: min(264px, calc(100vw - 32px)) !important;
}

/* Composer "⋯" sheet: restore the original inline toolbar.
   memory-evolve's mobile-input-sheet hides .tools (add + access-mode)
   behind the ⋯ button; the user prefers the original inline layout.
   Restore .tools and hide the now-redundant ⋯ button (the model pill
   is already inline; its menu falls back to the fixed viewport panel). */
html[data-dsh-mobile] [data-composer-card] > [data-input-scroll] + div:has(> .dsh-mobile-more-btn) > div:first-child {
  display: flex !important;
}
html[data-dsh-mobile] [data-composer-card] .dsh-mobile-more-btn {
  display: none !important;
}
`

    const TOUCH_CSS = `
@media (max-width: 1023px), (pointer: coarse) {
  /* Nav buttons: larger tap target */
  [role='dialog'][aria-modal='true']:has(> nav) nav button {
    min-height: 44px;
    min-width: 44px;
  }
  /* Labels that contain an input (checkboxes, radios) */
  [role='dialog'][aria-modal='true']:has(> nav) label:has(input) {
    min-height: 44px;
  }
  [role='dialog'][aria-modal='true']:has(> nav) input[type='checkbox'] {
    width: 20px;
    height: 20px;
  }
}
`

    const MOTION_CSS = `
[role='dialog'][aria-modal='true'] *,
[data-plugin='android-fit'] * {
  transition-duration: 0.01ms !important;
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
}
`

    const SECTION_CSS = `
[data-plugin='android-fit'] {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 0 16px;
}
.fit-note {
  margin: 0;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-secondary, #888);
}
.fit-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 52px;
  padding: 8px 14px;
  border: 1px solid var(--dsw-alias-border-l1, #e3e3e8);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.fit-row input[type='checkbox'] {
  flex: none;
  width: 22px;
  height: 22px;
  margin: 0;
}
.fit-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.fit-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #232326);
}
.fit-desc {
  font-size: 12px;
  line-height: 17px;
  color: var(--dsw-alias-label-secondary, #888);
}
@media (prefers-color-scheme: dark) {
  .fit-row { background: var(--dsw-alias-bg-layer-1, #26262b); border-color: var(--dsw-alias-border-l1, #3c3c42); }
  .fit-title { color: var(--dsw-alias-label-primary, #f2f2f4); }
  .fit-note, .fit-desc { color: var(--dsw-alias-label-secondary, #a9a9b0); }
}
`

    function insertCss(css) {
      const style = document.createElement('style')
      style.setAttribute('data-plugin', 'android-fit')
      style.textContent = css
      document.head.appendChild(style)
      return () => {
        style.remove()
      }
    }

    function ToggleRow(props) {
      return react.createElement('label', { className: 'fit-row' },
        react.createElement('span', { className: 'fit-text' },
          react.createElement('span', { className: 'fit-title' }, props.title),
          react.createElement('span', { className: 'fit-desc' }, props.desc),
        ),
        react.createElement('input', {
          type: 'checkbox',
          checked: props.checked,
          onChange: (event) => props.onChange(event.currentTarget.checked),
        }),
      )
    }

    function AndroidFitSection() {
      const [bigTargets, setBigTargets] = react.useState(true)
      const [calmMotion, setCalmMotion] = react.useState(false)
      react.useEffect(() => {
        if (!bigTargets) return undefined
        return insertCss(TOUCH_CSS)
      }, [bigTargets])
      react.useEffect(() => {
        if (!calmMotion) return undefined
        return insertCss(MOTION_CSS)
      }, [calmMotion])
      return react.createElement('div', { 'data-plugin': 'android-fit' },
        react.createElement('p', { className: 'fit-note' },
          '安卓端页面适配层：设置面板在手机上自动全屏化（竖屏）并按视口钳制尺寸（横屏），避让系统手势安全区，默认加大触控目标。以下开关即时生效，仅本会话有效。'),
        react.createElement(ToggleRow, {
          title: '大触控目标',
          desc: '设置面板内导航与选项行最小高度 44px，复选框放大，减少误触。',
          checked: bigTargets,
          onChange: setBigTargets,
        }),
        react.createElement(ToggleRow, {
          title: '减少动效',
          desc: '压缩设置面板内过渡与动画时长，低端安卓机操作更跟手。',
          checked: calmMotion,
          onChange: setCalmMotion,
        }),
        react.createElement('p', { className: 'fit-note' },
          '适配范围：所有设置面板（含弹窗）与本页；宽度 1024px 以上的桌面布局不受影响。'),
      )
    }

    const inject = ['slots']

    function apply(ctx) {
      ctx.effect(() => insertCss(BASE_CSS), 'android-fit: base adaptation')
      ctx.effect(() => insertCss(SECTION_CSS), 'android-fit: section styling')
      ctx.slots.inject('settings.section', () => ctx.slots.register({
        name: 'settings.section',
        id: 'android-fit',
        order: 96,
        label: () => '安卓适配',
      }, AndroidFitSection))
    }

    exports.inject = inject
    exports.apply = apply
    return module.exports
  },
})
