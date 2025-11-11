export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 顶部Logo和标题 */}
      <div className="text-center pt-8 md:pt-12 pb-6 md:pb-8 px-4">
        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
          <span className="text-white text-xl md:text-2xl font-bold">派</span>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 md:mb-3">
          抖音评论派单系统
        </h1>
        <p className="text-gray-600 text-sm md:text-lg mb-6 md:mb-8 px-2 max-w-2xl mx-auto leading-relaxed">
          <span className="block">专业化的评论任务管理平台，</span>
          <span className="block">发现发布、执行、审核、</span>
          <span className="block">结算全流程自动化</span>
        </p>
        
        {/* 系统状态指标 */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-8 mb-8 md:mb-12">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs md:text-sm text-gray-600">效率提高 ≥95%</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs md:text-sm text-gray-600">有效准确率 ≥98%</span>
          </div>
        </div>
      </div>

      {/* 角色选择卡片 */}
      <div className="px-4 md:px-6 mb-12 md:mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          {/* 派单员 */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all border border-blue-100">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <span className="text-white text-lg md:text-xl">🎯</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">派单员</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Task Publisher</p>
            <p className="text-xs text-gray-500 mb-3 md:mb-4 leading-relaxed">
              <span className="block">发布评论任务，</span>
              <span className="block">量身定制任务，</span>
              <span className="block">优化推广效果</span>
            </p>
            <div className="space-y-1 mb-4 md:mb-6">
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>发布任务推广流程
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>智能用户选择流程
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>任务管理效果监控
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>多渠道分析预警
              </div>
            </div>
            <div className="flex space-x-2">
              <a href="/publisher/auth/login" className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg text-center text-sm font-medium hover:bg-blue-600 transition-colors">
                登录派单员账号
              </a>
              <a href="/publisher/auth/register" className="flex-1 py-3 px-4 bg-blue-100 text-blue-700 rounded-lg text-center text-sm font-medium hover:bg-blue-200 transition-colors">
                注册
              </a>
            </div>
          </div>

          {/* 评论员 */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all border border-green-100">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <span className="text-white text-lg md:text-xl">💬</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">评论员</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Content Reviewer</p>
            <p className="text-xs text-gray-500 mb-3 md:mb-4 leading-relaxed">
              <span className="block">执行评论任务，</span>
              <span className="block">获得稳定收益，</span>
              <span className="block">灵活工作时间</span>
            </p>
            <div className="space-y-1 mb-4 md:mb-6">
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>接单大厅自由选择
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>任务完成奖励
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>奖励收益实时统计
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>零成本收益体验
              </div>
            </div>
            <div className="flex space-x-2">
              <a href="/commenter/auth/login" className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg text-center text-sm font-medium hover:bg-green-600 transition-colors">
                登录
              </a>
              <a href="/commenter/auth/register/" className="flex-1 py-3 px-4 bg-green-100 text-green-700 rounded-lg text-center text-sm font-medium hover:bg-green-200 transition-colors">
                注册
              </a>
            </div>
          </div>

          {/* 管理员 */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all border border-red-100">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <span className="text-white text-lg md:text-xl">🛡️</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">管理员</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">System Administrator</p>
            <p className="text-xs text-gray-500 mb-3 md:mb-4 leading-relaxed">
              <span className="block">系统管理与监控，</span>
              <span className="block">用户管理，</span>
              <span className="block">数据分析</span>
            </p>
            <div className="space-y-1 mb-4 md:mb-6">
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>系统运营监控
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>数据风险管理
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>平台运营分析
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>主程配置管理
              </div>
            </div>
            <a href="/admin/auth/login" className="block w-full py-3 px-4 bg-red-500 text-white rounded-lg text-center text-sm font-medium hover:bg-red-600 transition-colors">
              管理员登录 →
            </a>
          </div>

          {/* 客服聊天系统 */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all border border-yellow-100">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <span className="text-white text-lg md:text-xl">💬</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2">客服聊天系统</h3>
            <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">Customer Service Chat</p>
            <p className="text-xs text-gray-500 mb-3 md:mb-4 leading-relaxed">
              <span className="block">即时在线沟通，</span>
              <span className="block">问题快速解决，</span>
              <span className="block">高效用户支持</span>
            </p>
            <div className="space-y-1 mb-4 md:mb-6">
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>用户端聊天界面
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>客服端管理界面
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>文字图片消息支持
              </div>
              <div className="flex items-center text-xs text-green-600">
                <span className="mr-2">✓</span>聊天记录查询
              </div>
            </div>
            <a href="http://localhost:8081/login" className="block w-full py-3 px-4 bg-yellow-500 text-white rounded-lg text-center text-sm font-medium hover:bg-yellow-600 transition-colors">
              进入客服系统 →
            </a>
          </div>
        </div>
      </div>

      {/* 平台数据概览 */}
      <div className="px-4 md:px-6 mb-12 md:mb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6 md:mb-8">平台数据概览</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1 md:mb-2">15,000+</div>
              <div className="text-xs md:text-sm text-gray-600">注册用户</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-green-600 mb-1 md:mb-2">98.5%</div>
              <div className="text-xs md:text-sm text-gray-600">任务完成率</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-orange-600 mb-1 md:mb-2">¥2.8M</div>
              <div className="text-xs md:text-sm text-gray-600">月交易额</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1 md:mb-2">24/7</div>
              <div className="text-xs md:text-sm text-gray-600">全天服务</div>
            </div>
          </div>
        </div>
      </div>

      {/* 平台特色 */}
      <div className="px-4 md:px-6 pb-12 md:pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="text-center bg-white rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-green-600 text-lg md:text-xl">$</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm md:text-base">快速结算</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="block">任务完成后3分钟内智能结算，</span>
                <span className="block">通过安全支付网关到账</span>
              </p>
            </div>
            <div className="text-center bg-white rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-blue-600 text-lg md:text-xl">📊</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm md:text-base">数据驱动</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="block">基于数据分析，</span>
                <span className="block">智能化任务分配和</span>
                <span className="block">收益优化预测</span>
              </p>
            </div>
            <div className="text-center bg-white rounded-2xl p-4 md:p-6 shadow-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                <span className="text-orange-600 text-lg md:text-xl">🛡️</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm md:text-base">安全可靠</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="block">多重安全防护，</span>
                <span className="block">保障资金安全和</span>
                <span className="block">业务数据安全</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 页面底部 */}
      <div className="text-center pb-6 md:pb-8 px-4">
        <div className="text-xs text-gray-500">
          测试账号: admin/admin123
        </div>
      </div>
    </div>
  );
}