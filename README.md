# RunRebuild v0.2.0 (Mac / Web)

v0.1 のランニングタイマー・8週間計画・履歴に、プロフィール設定・自重筋トレ・セット記録を追加しました。IndexedDB は v1→v2 に移行し、既存のランニング履歴を保持します。

## 起動
```bash
npm install
npm run dev
```
表示されたURLをブラウザで開きます。`npm run build` と `npm test` で検証できます。

## Gitへの反映
`main` の変更がコミット済みであることを確認し、`git switch -c feat/v0.2-strength` で作業ブランチを作成します。ZIPの **中身** を既存の `runningAgent` に上書きしてください（`.git` は上書き・削除しない）。`git add . && git commit -m "Add profile and bodyweight training v0.2.0"` でコミットします。

## 注意
- 性別は任意です。性別だけで負荷を変更しません。
- 痛みがある・疲労4以上の場合、筋トレメニューを表示しません。医学的診断は行いません。
- 筋トレは手動のセット記録で、休憩タイマー・AI・地図・GPSは未実装です。
- 位置情報やAIへの送信は行いません。データはブラウザのIndexedDBに保存されます。
- タイマーの画面ロック中の動作・音声通知は保証されません。
