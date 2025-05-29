import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, MessageCircle, Search, BarChart3, Edit3, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import { fetchChatFile } from '@/lib/fileService';
import { formatDateDisplay, parseTxtContent } from '@/lib/chatUtils';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ChatLogPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [txtMessages, setTxtMessages] = useState<Array<{
    sender: string;
    time: string;
    message: string;
    line: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 24]);
  const [isTimeEditOpen, setIsTimeEditOpen] = useState(false);
  const [startTimeInput, setStartTimeInput] = useState('00:00');
  const [endTimeInput, setEndTimeInput] = useState('24:00');
  const [showMissingHtmlAlert, setShowMissingHtmlAlert] = useState(false);

  // 加载聊天数据
  const loadChatData = async () => {
    if (!date) return;
    
    try {
      setLoading(true);
      
      // 优先加载TXT文件
      try {
        const txt = await fetchChatFile(date, 'txt');
        const messages = parseTxtContent(txt);
        setTxtMessages(messages);
        
        // 同时尝试加载HTML文件（用于汇总功能）
        try {
          const html = await fetchChatFile(date, 'html');
          setHtmlContent(html);
        } catch (htmlError) {
          console.warn('HTML file not found');
        }
      } catch (txtError) {
        console.warn('TXT file not found, trying HTML file');
        
        // 如果TXT文件不存在，尝试加载HTML文件
        try {
          const html = await fetchChatFile(date, 'html');
          setHtmlContent(html);
        } catch (htmlError) {
          toast({
            title: "文件不存在",
            description: `未找到 ${date} 的聊天记录文件`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
      toast({
        title: "加载失败",
        description: "无法加载聊天记录，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChatData();
  }, [date]);

  // 将时间字符串转换为小时数
  const timeToHours = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    // 特殊处理24:00的情况，将其视为24.0小时
    if (hours === 24 && minutes === 0) {
      return 24;
    }
    return hours + minutes / 60;
  };

  // 将小时数转换为时间字符串
  const hoursToTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // 过滤消息（根据搜索词和时间范围）
  const filteredMessages = txtMessages.filter(message => {
    // 搜索过滤
    const matchesSearch = message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 时间过滤
    const messageHour = timeToHours(message.time);
    const matchesTime = messageHour >= timeRange[0] && messageHour <= timeRange[1];
    
    return matchesSearch && matchesTime;
  });

  // 格式化时间显示
  const formatTimeRange = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    // 确保分钟数是10的倍数
    const roundedMinutes = Math.round(m / 10) * 10;
    const finalMinutes = roundedMinutes === 60 ? 0 : roundedMinutes;
    const finalHours = roundedMinutes === 60 ? h + 1 : h;
    return `${finalHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  // 验证时间格式
  const validateTime = (timeStr: string): boolean => {
    // 特殊处理24:00的情况
    if (timeStr === '24:00') {
      return true;
    }
    // 正常时间格式验证 (00:00 - 23:59)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
  };

  // 处理时间输入确认
  const handleTimeInputConfirm = () => {
    if (!validateTime(startTimeInput) || !validateTime(endTimeInput)) {
      toast({
        title: "时间格式错误",
        description: "请输入正确的时间格式（HH:MM）",
        variant: "destructive",
      });
      return;
    }

    const startHours = timeToHours(startTimeInput);
    const endHours = timeToHours(endTimeInput);

    if (startHours >= endHours) {
      toast({
        title: "时间范围错误",
        description: "开始时间必须小于结束时间",
        variant: "destructive",
      });
      return;
    }

    if (startHours < 0 || startHours > 24 || endHours < 0 || endHours > 24) {
      toast({
        title: "时间范围错误",
        description: "时间必须在 00:00 到 24:00 之间",
        variant: "destructive",
      });
      return;
    }

    setTimeRange([startHours, endHours]);
    setIsTimeEditOpen(false);
    
    toast({
      title: "时间范围已更新",
      description: `已设置为 ${startTimeInput} - ${endTimeInput}`,
    });
  };

  // 打开时间编辑弹窗时同步当前时间
  const handleTimeEditOpen = () => {
    setStartTimeInput(formatTimeRange(timeRange[0]));
    setEndTimeInput(formatTimeRange(timeRange[1]));
    setIsTimeEditOpen(true);
  };

  return (
    <Layout showNavigation={false}>
      <div>
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-10">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-xiaohongshu-pink"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回
              </Button>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    console.log('汇总按钮被点击，当前日期:', date);
                    
                    // 检查当前日期是否有对应的HTML文件
                    try {
                      // 直接使用fetchChatFile函数，它已经处理了正确的路径
                      const htmlForCurrentDate = await fetchChatFile(date!, 'html');
                      console.log('找到对应日期的HTML文件，文件大小:', htmlForCurrentDate.length);
                      console.log('HTML内容前100字符:', htmlForCurrentDate.substring(0, 100));
                      
                      // 检查是否是真正的聊天记录HTML（而不是404页面或index.html）
                      if (htmlForCurrentDate.includes('<!DOCTYPE html>') && 
                          !htmlForCurrentDate.includes('injectIntoGlobalHoo') && // 不是Vite的index.html
                          !htmlForCurrentDate.includes('<script type="module">') && // 不是React应用页面
                          (htmlForCurrentDate.includes('微信') || htmlForCurrentDate.includes('聊天记录') || htmlForCurrentDate.includes('chat') || htmlForCurrentDate.includes('AI 产品创建大本营'))) {
                        // 如果是真正的聊天记录HTML文件，在新窗口中打开
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(htmlForCurrentDate);
                          newWindow.document.close();
                        }
                      } else {
                        console.log('返回的不是真正的聊天记录HTML文件，可能是404页面');
                        throw new Error('返回的不是聊天记录HTML文件');
                      }
                    } catch (error) {
                      console.log('没有找到对应日期的HTML文件，错误:', error);
                      // 如果没有找到对应日期的HTML文件，显示弹窗提醒
                      setShowMissingHtmlAlert(true);
                    }
                  }}
                  className="text-xiaohongshu-orange border-xiaohongshu-orange/30 hover:bg-orange-50 hover:border-xiaohongshu-orange"
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  汇总
                </Button>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h1 className="text-lg font-bold text-gray-800">{formatDateDisplay(date || '')}</h1>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {filteredMessages.length} 条消息
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索消息内容或发送人..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-xiaohongshu-pink/20 focus:border-xiaohongshu-pink"
              />
            </div>
            
            {/* Time Range Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  时间范围
                </span>
                <Popover open={isTimeEditOpen} onOpenChange={setIsTimeEditOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xiaohongshu-pink font-medium hover:bg-xiaohongshu-lightPink/20 flex items-center gap-1"
                      onClick={handleTimeEditOpen}
                    >
                      {formatTimeRange(timeRange[0])} - {formatTimeRange(timeRange[1])}
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="text-sm font-medium">手动设置时间范围</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">开始时间</label>
                          <Input
                            placeholder="00:00"
                            value={startTimeInput}
                            onChange={(e) => setStartTimeInput(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">结束时间</label>
                          <Input
                            placeholder="24:00"
                            value={endTimeInput}
                            onChange={(e) => setEndTimeInput(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        格式：HH:MM（如 09:30）
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleTimeInputConfirm}
                          className="flex-1 bg-xiaohongshu-pink hover:bg-xiaohongshu-pink/90"
                        >
                          确认
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsTimeEditOpen(false)}
                          className="flex-1"
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="px-2">
                <Slider
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as [number, number])}
                  max={24}
                  min={0}
                  step={10/60}
                  className="w-full"
                  defaultValue={[0, 24]}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 px-2">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="p-4 pb-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-xiaohongshu-pink border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message, index) => (
                  <Card 
                    key={`${message.line}-${index}`}
                    className="animate-fade-in bg-white border-gray-100"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-xiaohongshu-pink to-xiaohongshu-orange rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                          {message.sender.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm">{message.sender}</span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {message.time}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{message.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    {searchTerm || timeRange[0] > 0 || timeRange[1] < 24 
                      ? '没有找到匹配的消息' 
                      : '暂无聊天记录'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Missing HTML File Alert Dialog */}
      <AlertDialog open={showMissingHtmlAlert} onOpenChange={(open) => {
        console.log('AlertDialog状态变化:', open);
        setShowMissingHtmlAlert(open);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-xiaohongshu-orange" />
              HTML文件缺失
            </AlertDialogTitle>
            <AlertDialogDescription>
              该日期（{formatDateDisplay(date || '')}）缺少HTML格式的聊天记录文件，无法生成汇总视图。
              <br /><br />
              汇总功能需要HTML格式的聊天记录文件才能正常工作。请确保相应的HTML文件存在于聊天记录目录中。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowMissingHtmlAlert(false)}
              className="bg-xiaohongshu-pink hover:bg-xiaohongshu-pink/90"
            >
              我知道了
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ChatLogPage;
