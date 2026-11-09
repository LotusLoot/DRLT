# 로그라이크-드루이드

동물로 변신하며 안개 숲을 정화하는 탑다운 액션 로그라이크입니다. PC와 휴대폰 모두에서 할 수 있어요.
그림·소리·음악은 모두 코드로 만들었고, 친구 순위와 성장 기록은 Firebase에 저장됩니다.

## 폴더 구성

| 파일 | 하는 일 |
|---|---|
| `index.html` | 게임 화면 (여기를 열면 게임이 시작) |
| `css/style.css` | 화면 꾸밈 |
| `js/game.js` | 게임 본체 (전투·형태·보스·성소 전부) |
| `js/net-firebase.js` | Firebase 연결 (로그인·닉네임·순위·성장 기록 저장) |
| `firebase-config.js` | **내 Firebase 프로젝트 값을 붙여 넣는 곳** |
| `firestore.rules` | Firestore 보안 규칙 (콘솔에 붙여 넣기) |

## 처음 한 번: Firebase 설정 (약 10분)

1. [Firebase 콘솔](https://console.firebase.google.com)에서 **프로젝트 추가** → 이름 예: `roguelike-druid` (애널리틱스는 꺼도 됨)
2. **빌드 → Authentication → 시작하기 → 로그인 방법**에서 두 가지를 켭니다.
   - **익명** → 사용 설정 → 저장
   - **Google** → 사용 설정 → 지원 이메일 고르기 → 저장
3. **Authentication → 설정 → 승인된 도메인 → 도메인 추가**: `lotusloot.github.io`
   (이걸 안 하면 GitHub 주소에서 구글 로그인이 막힙니다)
4. **빌드 → Firestore Database → 데이터베이스 만들기** → 위치 `asia-northeast3 (서울)` → **프로덕션 모드**
5. Firestore의 **규칙** 탭 → 안의 내용을 지우고 `firestore.rules` 파일 내용을 통째로 붙여 넣기 → **게시**
6. **프로젝트 설정(톱니바퀴) → 일반 → 내 앱 → 웹(`</>`) 아이콘** → 앱 닉네임 적고 등록
   → 나오는 `firebaseConfig = { ... }` 안의 값들을 `firebase-config.js`에 붙여 넣기

## GitHub Pages에 올리기

1. GitHub(lotusloot)에서 **New repository** → 이름 예: `roguelike-druid` → **Public** → Create
2. **Add file → Upload files** → 이 폴더 안의 파일과 폴더를 전부 끌어다 놓기 → **Commit changes**
3. 저장소의 **Settings → Pages** → Branch `main`, 폴더 `/ (root)` → **Save**
4. 1~2분 뒤 `https://lotusloot.github.io/roguelike-druid/` 에서 게임이 열립니다. 이 주소를 친구들에게 보내면 끝!

## 잘 됐는지 확인

- 게임 홈 화면의 **숲의 성소 → 친구 순위** 탭에 닉네임 칸과 "구글로 로그인" 버튼이 보이면 연결 성공
- 닉네임을 저장하고 한 판을 끝내면 순위에 내 이름이 올라갑니다
- Firebase 콘솔 → Firestore → 데이터에 `players`, `scores`가 생기는지 확인
- 닉네임 칸이 안 보이고 "온라인 연결이 없어서…"라고 나오면 `firebase-config.js` 값을 다시 확인

## 업데이트할 때

Claude가 새 버전을 만들어 주면 바뀐 파일(보통 `js/game.js`, `css/style.css`, `index.html`)만
GitHub에 다시 올리면 됩니다. **`firebase-config.js`는 덮어쓰지 마세요.** (내 프로젝트 값이 들어 있음)

## 알아 둘 점

- 성장 기록은 이 브라우저에도 저장되고, 서버에도 저장됩니다. 구글로 로그인해 두면 다른 기기에서도 이어집니다.
- 순위는 게임 쪽에서 올리는 기록이라, 마음먹고 조작하려는 사람까지 막지는 못합니다 (친구끼리 쓰는 용도).
