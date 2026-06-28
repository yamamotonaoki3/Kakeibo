# Kakeibo — Claude Code ワークフロールール

## 絶対に守るルール

1. **作業は必ずイシューから始める**
   - コード変更・機能追加・バグ修正・ドキュメント更新、いかなる作業も GitHub Issue を先に作成する。
   - Issue なしにブランチを切ってはいけない。

2. **main ブランチへの直接プッシュ禁止**
   - `git push origin main` は禁止。GitHub 側でも強制されている。
   - 必ず作業ブランチから PR を作成し、マージで取り込む。

3. **PR はレビュー・動作確認後にマージする**
   - 自分でセルフレビューを行い、チェックリストを埋めてからマージする。
   - CI（整備後）が通っていることを確認する。

---

## ブランチ命名規則

```
<prefix>/#<issue番号>-<英語の概要>
```

| プレフィックス | 用途 |
|---|---|
| `feature` | 機能追加 |
| `fix` | 不具合修正 |
| `chore` | リファクタ・設定変更・依存更新 |
| `docs` | ドキュメントのみの変更 |

**例:**
- `feature/#12-add-transaction-entity`
- `fix/#34-summary-calculation-error`
- `chore/#7-update-maven-wrapper`
- `docs/#2-add-requirements`

---

## 作業フロー（毎回この順番で）

```
1. GitHub で Issue を作成（テンプレートを使う）
2. ブランチを切る: git checkout -b feature/#<番号>-<概要>
3. ファイル作成・実装
4. 動作確認（アプリを起動して実際の動作をブラウザで検証）
5. コミット: git commit
6. プッシュ: git push origin <ブランチ名>
7. GitHub で PR を作成（テンプレートを使う・Closes #<番号> を記載）
8. セルフレビュー → マージ
9. ブランチ削除
```

> **ポイント:** ステップ 3→4→5→6 の順序は厳守。動作確認なしでコミット・プッシュしない。

---

## コミットメッセージ規則

```
<種別>: <変更内容の要約>（日本語可）

例:
feat: 月次サマリー画面を追加
fix: 収支計算のNullPointerExceptionを修正
chore: Maven Wrapper を更新
docs: 要件定義書を追加
```

---

## 技術スタック（参考）

- **Backend:** Java 25 / Spring Boot 4.0.5 / Gradle 9.5.0 (Kotlin DSL) / PostgreSQL 17
- **Frontend:** React 19 / TypeScript / Vite
- **パッケージ:** `com.example.Kakeibo`
- **DB起動:** `docker compose up -d`（リポジトリルートで実行）
- **バックエンド起動:** `cd backend && ./gradlew bootRun`
- **フロントエンド起動:** `cd frontend && npm run dev`
