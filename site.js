/* Point download buttons straight at the latest DMG. Falls back to the release page. */
(function () {
  var API = 'https://api.github.com/repos/puckrin/taneleer-releases/releases/latest';
  var links = document.querySelectorAll('[data-download]');
  if (!links.length || !window.fetch) return;

  function apply(rel) {
    var dmg = (rel.assets || []).filter(function (a) { return /\.dmg$/i.test(a.name); })[0];
    if (!dmg) return;
    links.forEach(function (a) { a.href = dmg.browser_download_url; a.setAttribute('download', ''); });
    var v = String(rel.tag_name || '').replace(/^v/, '');
    if (v) document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = v; });
  }

  var cached = null;
  try { cached = JSON.parse(sessionStorage.getItem('tnlr-latest')); } catch (e) {}
  if (cached) return apply(cached);

  fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (rel) {
      var slim = { tag_name: rel.tag_name, assets: (rel.assets || []).map(function (a) { return { name: a.name, browser_download_url: a.browser_download_url }; }) };
      try { sessionStorage.setItem('tnlr-latest', JSON.stringify(slim)); } catch (e) {}
      apply(slim);
    })
    .catch(function () {});
})();
