
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, TrendingUp, RefreshCw, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { getChatDates, refreshChatData } from '@/lib/fileService';
import { formatDateDisplay, getDayOfWeek } from '@/lib/chatUtils';
import type { ChatDate } from '@/lib/chatUtils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chatDates, setChatDates] = useState<ChatDate[]>([]);
  const [filteredDates, setFilteredDates] = useState<ChatDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // 加载聊天日期数据
  const loadChatDates = async () => {
    try {
      setLoading(true);
      const dates = await getChatDates();
      setChatDates(dates);
      setFilteredDates(dates);
    } catch (error) {
      console.error('Failed to load chat dates:', error);
      toast({
        title: "加载失败",
        description: "无法加载聊天记录，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 筛选日期
  const filterByDate = (date: Date | undefined) => {
    if (!date) {
      setFilteredDates(chatDates);
      return;
    }
    
    const dateString = format(date, 'yyyy-MM-dd');
    const filtered = chatDates.filter(item => item.date === dateString);
    setFilteredDates(filtered);
  };

  // 处理日期选择
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    filterByDate(date);
    setCalendarOpen(false);
  };

  // 清除筛选
  const clearFilter = () => {
    setSelectedDate(undefined);
    setFilteredDates(chatDates);
  };

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast({
        title: "数据刷新中...",
        description: "正在获取最新的聊天记录",
      });
      
      await refreshChatData();
      await loadChatDates();
      
      toast({
        title: "刷新完成",
        description: "聊天记录已更新到最新版本",
      });
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast({
        title: "刷新失败",
        description: "无法刷新数据，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadChatDates();
  }, []);

  return (
    <Layout>
      <div className="p-6">
        {/* Header with refresh button */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-xiaohongshu-pink to-xiaohongshu-orange rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">群聊精华</h1>
            </div>
            <p className="text-gray-600 text-sm">发现每日聊天中的精彩内容</p>
          </div>
          
          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-xiaohongshu-pink border-xiaohongshu-pink/30 hover:bg-xiaohongshu-lightPink hover:border-xiaohongshu-pink"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中...' : '刷新数据'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-xiaohongshu-pink/10 to-xiaohongshu-pink/5 border-xiaohongshu-pink/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-xiaohongshu-pink" />
                <div>
                  <p className="text-sm text-gray-600">总消息数</p>
                  <p className="text-xl font-bold text-xiaohongshu-pink">
                    {filteredDates.reduce((sum, item) => sum + item.messageCount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-xiaohongshu-orange/10 to-xiaohongshu-orange/5 border-xiaohongshu-orange/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-xiaohongshu-orange" />
                <div>
                  <p className="text-sm text-gray-600">记录天数</p>
                  <p className="text-xl font-bold text-xiaohongshu-orange">{filteredDates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Date List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">聊天记录</h2>
            
            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "yyyy年MM月dd日") : "选择日期筛选"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const dateString = format(date, 'yyyy-MM-dd');
                      return !chatDates.some(item => item.date === dateString);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilter}
                  className="text-gray-500 hover:text-gray-700"
                >
                  清除
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-xiaohongshu-pink border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : filteredDates.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{selectedDate ? '该日期无聊天记录' : '暂无聊天记录'}</p>
            </div>
          ) : (
            filteredDates.map((item, index) => (
              <Card 
                key={item.date}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer group border-gray-100 hover:border-xiaohongshu-pink/30 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/chatlog/${item.date}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-xiaohongshu-pink to-xiaohongshu-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{formatDateDisplay(item.date)}</h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {getDayOfWeek(item.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {item.messageCount} 条消息
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-xiaohongshu-pink group-hover:translate-x-1 transition-transform">
                      →
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
