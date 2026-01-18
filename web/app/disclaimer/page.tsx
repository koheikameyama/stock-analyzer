import { Layout } from '@/components/Layout';

export const metadata = {
  title: '免責事項 | AI株式分析ツール',
  description: 'AI株式分析ツールの免責事項',
};

export default function DisclaimerPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">
            免責事項
          </h1>
          <p className="text-surface-600">
            AI株式分析ツールをご利用いただく前に、必ずお読みください
          </p>
        </div>

        {/* 免責事項内容 */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6 sm:p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">1. サービスの性質</h2>
            <p className="text-surface-700 leading-relaxed">
              本サービス「AI株式分析ツール」は、株式投資に関する参考情報をAIが分析して提供するものです。
              本サービスは投資助言や投資勧誘を目的としたものではなく、金融商品取引法に基づく投資助言業ではありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">2. 投資リスクについて</h2>
            <p className="text-surface-700 leading-relaxed mb-3">
              株式投資には以下のようなリスクが伴います：
            </p>
            <ul className="list-disc list-inside space-y-2 text-surface-700 ml-4">
              <li>価格変動リスク：株価の変動により、投資元本を割り込む可能性があります</li>
              <li>信用リスク：発行会社の経営・財務状況の変化により、損失が生じる可能性があります</li>
              <li>流動性リスク：市場環境により、売買が困難になる場合があります</li>
              <li>為替リスク：外国株式等の場合、為替相場の変動により損失が生じる可能性があります</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">3. 情報の正確性について</h2>
            <p className="text-surface-700 leading-relaxed">
              本サービスで提供する情報は、信頼できると判断した情報源から取得したデータに基づいていますが、
              その正確性、完全性、適時性、有用性等について保証するものではありません。
              AIによる分析結果は参考情報であり、将来の投資成果を保証するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">4. 投資判断の責任</h2>
            <p className="text-surface-700 leading-relaxed">
              本サービスで提供される情報に基づいて行われた投資判断および投資行動の結果については、
              全てご利用者ご自身の責任において行っていただくものとします。
              投資にあたっては、ご自身で十分に調査・検討を行った上で、最終的な投資判断を行ってください。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">5. 損害賠償の免責</h2>
            <p className="text-surface-700 leading-relaxed">
              本サービスの利用、または利用不能により生じた、あるいは本サービスの情報に起因して発生した
              いかなる損害（直接損害、間接損害、逸失利益、データ損失等を含む）についても、
              当方は一切の責任を負いかねます。これには、情報の誤り、遅延、中断、システム障害等による損害も含まれます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">6. サービスの変更・中断</h2>
            <p className="text-surface-700 leading-relaxed">
              当方は、予告なく本サービスの内容を変更、追加、削除、または本サービスの提供を中断・終了することがあります。
              これにより生じた損害について、当方は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">7. 第三者サービスについて</h2>
            <p className="text-surface-700 leading-relaxed">
              本サービスは、GitHub API等の第三者サービスを利用しています。
              これら第三者サービスの利用可能性、正確性、継続性について、当方は保証いたしません。
              第三者サービスの利用により生じた損害について、当方は責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">8. 知的財産権</h2>
            <p className="text-surface-700 leading-relaxed">
              本サービスで提供される情報、分析結果、コンテンツ等の著作権その他の知的財産権は、
              当方または正当な権利者に帰属します。ユーザーは、個人的な利用の範囲内でのみ使用することができ、
              商用利用、再配布、転載等は禁止されています。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-surface-900 mb-3">9. 準拠法・管轄裁判所</h2>
            <p className="text-surface-700 leading-relaxed">
              本免責事項および本サービスの利用については、日本法に準拠します。
              本サービスに関連して生じた紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section className="pt-4 border-t border-surface-200">
            <p className="text-sm text-surface-600">
              最終更新日: 2026年1月19日
            </p>
          </section>
        </div>

        {/* 注意喚起 */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">重要なお知らせ</p>
              <p className="leading-relaxed">
                本サービスを利用することで、本免責事項に同意したものとみなされます。
                同意いただけない場合は、本サービスのご利用をお控えください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
