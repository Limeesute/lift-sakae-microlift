(() => {
  'use strict';
  const script=document.currentScript;
  const params=new URLSearchParams(location.search);
  const slug=params.get('store')||script?.dataset.defaultStore||'';
  const target=document.getElementById('loading-message');
  const fail=(message)=>{if(target)target.textContent=message;document.getElementById('retry')?.removeAttribute('hidden');};
  if(!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug)){fail('店舗のページが見つかりません。リンク先をご確認ください。');return;}
  fetch('https://lift-lp-public.caringblock.chatgpt.site/api/render/'+encodeURIComponent(slug),{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(20000)})
    .then(async response=>{if(!response.ok){fail(response.status===404?'このページは現在公開されていません。':'ページを読み込めませんでした。時間をおいてお試しください。');return;}const html=await response.text();if(!html.startsWith('<!doctype html>'))throw new Error('Invalid page');document.open();document.write(html);document.close();})
    .catch(()=>fail('ページを読み込めませんでした。通信環境をご確認のうえ、もう一度お試しください。'));
})();
