import React from 'react';
import { Shield, FileText, Lock } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          <FileText className="h-3.5 w-3.5" />
          <span>規約・ポリシー</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          利用規約・プライバシーポリシー
        </h1>
        <p className="mt-2 text-xs text-slate-500">最終改定日：2026年11月17日</p>

        <hr className="my-6 border-slate-100" />

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Shield className="h-5 w-5 text-sky-600" />
            <span>第1部：利用規約</span>
          </h2>

          <div className="space-y-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div>
              <h3 className="font-bold text-slate-900">1. サービスの概要</h3>
              <p className="mt-1">
                「ナンプレ＆クロスワード広場」（以下「当サイト」）は、ユーザーがナンプレ（数独）およびクロスワードパズルを作成・公開・プレイできるWebサービスです。利用者は本規約に同意のうえ当サイトを利用するものとします。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">2. 投稿コンテンツと禁止事項</h3>
              <p className="mt-1">
                ユーザーがパズルを投稿する際、以下の内容を含むタイトル・製作者名・ヒント文・解答の投稿を固く禁じます。
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>特定の個人や団体を誹謗中傷・侮辱する表現、または個人情報を特定できる内容</li>
                <li>暴力的・わいせつ・差別的・反社会的な表現および公序良俗に反する内容</li>
                <li>第三者の著作権・商標権・プライバシー権等を侵害する内容</li>
                <li>スパム投稿やサイトの正常な運営を妨害する行為</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">3. 通報機能およびパズルの非表示措置</h3>
              <p className="mt-1">
                当サイトには不適切なパズルを報告できる通報機能が備わっています。一定回数（3回以上）の通報が行われたパズル、または運営者が不適切と判断したパズルは、事前の通知なく一覧から非表示または削除される場合があります。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">4. 免責事項</h3>
              <p className="mt-1">
                当サイトの提供にあたり、データの永続性や完全性を保証するものではありません。当サイトの利用により生じた損害について、運営者は一切の責任を負いません。
              </p>
            </div>
          </div>
        </section>

        <hr className="my-8 border-slate-100" />

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Lock className="h-5 w-5 text-emerald-600" />
            <span>第2部：プライバシーポリシー</span>
          </h2>

          <div className="space-y-4 text-xs leading-relaxed text-slate-600 sm:text-sm">
            <div>
              <h3 className="font-bold text-slate-900">
                1. ローカルストレージ・セッションストレージの利用について
              </h3>
              <p className="mt-1">
                当サイトでは、パズルデータの保存および同一セッション内での重複カウント防止のためにブラウザのWeb Storage（localStorage・sessionStorage）を使用しています。これらは個人を特定する情報を含みません。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">2. 広告配信について</h3>
              <p className="mt-1">
                当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用する場合があります。広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、Cookie（クッキー）を使用することがあります。Cookieを無効にする設定およびGoogleアドセンスに関する詳細は、Googleの「ポリシーと規約」ページをご確認ください。
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">3. アクセス解析およびデータベースについて</h3>
              <p className="mt-1">
                投稿されたパズルデータ（タイトル、製作者名、盤面データ、プレイ回数、クリア回数、作成日時）は全体公開データとして保存・表示されます。本名や連絡先などの個人情報は絶対に入力しないでください。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
