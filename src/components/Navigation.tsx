
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Search, MessageCircle } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '首页', description: '日期列表' },
    { path: '/search', icon: Search, label: '搜索', description: '关键词搜索' }
  ];

  return (
    <>
      {/* 桌面端侧边栏 */}
      <div className="hidden md:block fixed left-0 top-0 w-64 h-full bg-white/95 backdrop-blur-md border-r border-gray-100 z-50">
        <div className="p-6">
          {/* Logo区域 */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-xiaohongshu-purple to-xiaohongshu-pink rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">群聊精华</h1>
              <p className="text-xs text-gray-500">微信聊天整理工具</p>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className={`w-full justify-start gap-3 h-12 px-4 ${
                    isActive 
                      ? 'text-xiaohongshu-pink bg-xiaohongshu-lightPink border border-xiaohongshu-pink/20' 
                      : 'text-gray-600 hover:text-xiaohongshu-pink hover:bg-xiaohongshu-lightPink'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                    isActive 
                      ? 'text-xiaohongshu-pink bg-xiaohongshu-lightPink' 
                      : 'text-gray-600 hover:text-xiaohongshu-pink hover:bg-xiaohongshu-lightPink'
                  }`}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
