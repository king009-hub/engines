import{c as d,r as n}from"./index-BgmxaMFN.js";/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=d("Heart",[["path",{d:"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",key:"c3ymky"}]]),r="engine-wishlist";function c(){try{const e=localStorage.getItem(r);return e?JSON.parse(e):[]}catch{return[]}}function g(){const[e,o]=n.useState(c);n.useEffect(()=>{const t=localStorage.getItem(r),s=JSON.stringify(e);t!==s&&(localStorage.setItem(r,s),window.dispatchEvent(new Event("wishlist-updated")))},[e]),n.useEffect(()=>{const t=()=>{const s=c();o(i=>JSON.stringify(i)===JSON.stringify(s)?i:s)};return window.addEventListener("wishlist-updated",t),window.addEventListener("storage",t),()=>{window.removeEventListener("wishlist-updated",t),window.removeEventListener("storage",t)}},[]);const a=n.useCallback(t=>{o(s=>s.includes(t)?s.filter(i=>i!==t):[...s,t])},[]),l=n.useCallback(t=>e.includes(t),[e]);return{wishlistIds:e,toggle:a,isWishlisted:l,count:e.length}}export{w as H,g as u};
