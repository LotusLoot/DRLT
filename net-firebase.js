/* ================================================================
   로그라이크-드루이드 · Firebase 연결
   - 처음 들어오면 익명 로그인 → 닉네임만 정하면 친구 순위에 올라갑니다.
   - "구글로 로그인"을 누르면 지금 익명 계정이 구글 계정으로 바뀌어(같은 기록 유지)
     다른 기기에서도 성장 기록이 이어집니다.
   - Firestore 구조
       players/{uid}  { nickname, save: { meta, unlock, slots }, updatedAt }  ← 본인만 읽고 씀
       scores/{uid}   { name, bestMist, bestTime, wins, runs, kills, reach, forms, at } ← 모두 읽기, 본인만 씀
   - firebase-config.js가 비어 있으면 아무것도 하지 않고, 게임은 이 브라우저에만 저장합니다.
   ================================================================ */
(function () {
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !cfg.apiKey || /여기에|YOUR_/.test(cfg.apiKey) || !window.firebase) return;
  try { firebase.initializeApp(cfg); } catch (e) { return; }
  var auth = firebase.auth(), fs = firebase.firestore();
  var H = null, user = null, nickname = '';

  function acct() {
    return { kind: user && !user.isAnonymous ? 'google' : 'anon', uid: user ? user.uid : null, name: nickname, canWrite: !!user, email: user && !user.isAnonymous ? (user.email || '') : '' };
  }
  function loadPlayer() {
    return fs.doc('players/' + user.uid).get().then(function (snap) {
      var d = snap.exists ? snap.data() : {};
      nickname = d.nickname || '';
      H.onAccount(acct());
      H.onCloudSave(d.save || null);
    }).catch(function () { H.onAccount(acct()); });
  }
  function credFrom(e) {
    var G = firebase.auth.GoogleAuthProvider;
    return (G.credentialFromError && G.credentialFromError(e)) || e.credential || null;
  }
  // 이미 다른 기기에서 쓰던 구글 계정이면: 지금 익명 기록을 순위에서 지우고 그 계정으로 들어감
  function switchToExisting(e) {
    var cred = credFrom(e);
    if (!cred) return Promise.reject(e);
    var anon = user && user.isAnonymous ? user.uid : null;
    var cleanup = anon ? fs.doc('scores/' + anon).delete().catch(function () {}) : Promise.resolve();
    return cleanup.then(function () { return auth.signInWithCredential(cred); });
  }

  window.DruidNet = {
    kind: 'firebase',
    start: function (h) {
      H = h;
      fs.collection('scores').orderBy('bestMist', 'desc').limit(200).onSnapshot(function (s) {
        h.onBoard(s.docs.map(function (d) { var o = Object.assign({}, d.data()); o.id = d.id; return o; }), s.metadata.fromCache ? 'slow' : 'ready');
      }, function () { h.onError(); });
      auth.onAuthStateChanged(function (u) {
        if (!u) { auth.signInAnonymously().catch(function () { h.onError(); }); return; }
        user = u; loadPlayer();
      });
      auth.getRedirectResult().catch(function (e) { if (e && e.code === 'auth/credential-already-in-use') switchToExisting(e).catch(function () {}); });
    },
    setName: function (n) {
      nickname = n;
      return fs.doc('players/' + user.uid).set({ nickname: n }, { merge: true }).then(function () { H.onAccount(acct()); });
    },
    pushScore: function (body) {
      if (!user) return Promise.reject({ code: 'no_user' });
      var b = {}; for (var k in body) b[k] = body[k];
      b.name = nickname || '이름 없는 드루이드';
      return fs.doc('scores/' + user.uid).set(b);
    },
    saveCloud: function (blob) {
      if (!user) return Promise.resolve();
      return fs.doc('players/' + user.uid).set({ save: blob, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    },
    google: function () {
      var prov = new firebase.auth.GoogleAuthProvider();
      var p = user && user.isAnonymous ? user.linkWithPopup(prov) : auth.signInWithPopup(prov);
      return p.then(function () { user = auth.currentUser; return loadPlayer(); }).catch(function (e) {
        if (e && e.code === 'auth/credential-already-in-use') return switchToExisting(e);
        if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) {
          return user && user.isAnonymous ? user.linkWithRedirect(prov) : auth.signInWithRedirect(prov);
        }
        throw e;
      });
    },
    signOut: function () { return auth.signOut(); },
  };
})();
