import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, MessageCircle, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';
import { searchAllChatFiles, getChatDates } from '@/lib/fileService';
import { formatDateDisplay } from '@/lib/chatUtils';
import { useToast } from '@/hooks/use-toast';

const SearchPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [searchResults, setSearchResults] = useState<Array<{
    date: string;
    results: Array<{
      id: string;
      sender: string;
      time: string;
      message: string;
      context: string[];
      highlight: string;
    }>;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [availableDates, setAvailableDates] = useState<Array<{
    date: string;
    messageCount: number;
    highlights: number;
    hasHtml: boolean;
    hasTxt: boolean;
  }>>([]);

  // 加载可用日期
  const loadAvailableDates = async () => {
    try {
      const dates = await getChatDates();
      setAvailableDates(dates);
    } catch (error) {
      console.error('Failed to load available dates:', error);
    }
  };

  useEffect(() => {
    loadAvailableDates();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const results = await searchAllChatFiles(searchQuery, selectedDate);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "未找到结果",
          description: `没有找到包含"${searchQuery}"的消息`,
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "搜索失败",
        description: "搜索过程中出现错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <span key={index} className="bg-yellow-200 text-yellow-800 px-1 rounded">{part}</span> : 
        part
    );
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 lg:p-12">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-xiaohongshu-purple to-xiaohongshu-pink rounded-full flex items-center justify-center">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">智能搜索</h1>
          </div>
          <p className="text-gray-600 text-sm md:text-base">在群聊记录中快速找到重要信息</p>
        </div>

        {/* Search Controls */}
        <div className="space-y-4 mb-6 md:mb-8 max-w-4xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="输入关键词搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="border-gray-200 focus:border-xiaohongshu-pink h-11 md:h-12 text-base"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="bg-xiaohongshu-pink hover:bg-xiaohongshu-pink/90 text-white px-6 h-11 md:h-12 md:px-8"
            >
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </Button>
          </div>

          <div className="max-w-xs">
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="border-gray-200 focus:border-xiaohongshu-pink h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部日期</SelectItem>
                {availableDates.map((dateItem) => (
                  <SelectItem key={dateItem.date} value={dateItem.date}>
                    {formatDateDisplay(dateItem.date)} ({dateItem.messageCount}条消息)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-w-5xl">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-xiaohongshu-orange" />
              <span className="text-sm md:text-base text-gray-600">
                找到 <span className="font-semibold text-xiaohongshu-pink">
                  {searchResults.reduce((total, dateGroup) => total + dateGroup.results.length, 0)}
                </span> 条相关消息
              </span>
            </div>

            <div className="space-y-6">
              {searchResults.map((dateGroup) => (
                <div key={dateGroup.date}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDateDisplay(dateGroup.date)} ({dateGroup.results.length}条结果)
                  </h3>
                  <div className="grid gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {dateGroup.results.map((result, index) => (
                      <Card 
                        key={result.id}
                        className="hover:shadow-lg transition-all duration-300 border-gray-100 hover:border-xiaohongshu-pink/30 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-4 md:p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-xiaohongshu-pink to-xiaohongshu-orange rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                              📝
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-medium text-gray-800 text-sm">{result.sender}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  {dateGroup.date}
                                </span>
                                <span className="text-xs text-gray-500">{result.time}</span>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {highlightText(result.message, result.highlight)}
                                </p>
                              </div>
                              
                              <div className="space-y-1">
                                <p className="text-xs text-gray-500 mb-1">上下文：</p>
                                {result.context.map((line, idx) => (
                                  <p key={idx} className="text-xs text-gray-600 pl-2 border-l-2 border-gray-200 line-clamp-2">
                                    {highlightText(line, result.highlight)}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-12 md:py-16 max-w-md mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">未找到相关内容</h3>
            <p className="text-gray-600 text-sm md:text-base">试试其他关键词或调整搜索条件</p>
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12 md:py-16 max-w-md mx-auto">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-xiaohongshu-lightPink rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-xiaohongshu-pink" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">开始搜索</h3>
            <p className="text-gray-600 text-sm md:text-base">输入关键词，找到群聊中的重要信息</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
