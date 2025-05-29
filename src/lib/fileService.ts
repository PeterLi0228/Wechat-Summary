import { ChatDate, parseFileDate, estimateMessageCount } from './chatUtils';

// 获取正确的基础路径
const getBasePath = (): string => {
  // 在开发环境中使用根路径，在生产环境中使用GitHub Pages路径
  if (import.meta.env.DEV) {
    return '';
  }
  // 检查当前URL是否包含GitHub Pages路径
  if (window.location.pathname.includes('/wechat-summary')) {
    return '/wechat-summary';
  }
  return '';
};

// 从index.json读取可用的聊天文件
const loadFileIndex = async (): Promise<string[]> => {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}/chatlogs/index.json`);
    if (!response.ok) {
      throw new Error(`Failed to load file index: ${response.status}`);
    }
    const data = await response.json();
    return data.files || [];
  } catch (error) {
    console.error('Failed to load file index:', error);
    // 如果无法加载索引文件，返回空数组
    return [];
  }
};

// 获取所有可用的聊天日期
export const getChatDates = async (): Promise<ChatDate[]> => {
  try {
    // 从索引文件读取可用的文件
    const availableFiles = await loadFileIndex();
    const dateMap = new Map<string, Partial<ChatDate>>();
    
    // 处理文件列表
    for (const filename of availableFiles) {
      const date = parseFileDate(filename);
      if (date) {
        if (!dateMap.has(date)) {
          dateMap.set(date, {
            date,
            messageCount: 0,
            hasHtml: false,
            hasTxt: false
          });
        }
        
        const chatDate = dateMap.get(date)!;
        
        if (filename.endsWith('.html')) {
          chatDate.hasHtml = true;
        } else if (filename.endsWith('.txt')) {
          chatDate.hasTxt = true;
          // 读取TXT文件来获取消息统计
          try {
            const txtContent = await fetchChatFile(date, 'txt');
            const messageCount = estimateMessageCount(txtContent);
            chatDate.messageCount = messageCount;
          } catch (error) {
            console.warn(`Failed to read txt file for ${date}:`, error);
            // 如果无法读取文件，设置默认值
            chatDate.messageCount = 0;
          }
        }
      }
    }
    
    // 转换为数组并按日期排序（最新的在前）
    // 只显示有TXT文件的日期
    const chatDates = Array.from(dateMap.values())
      .filter(item => item.hasTxt && item.messageCount! > 0)
      .map(item => ({
        date: item.date!,
        messageCount: item.messageCount || 0,
        hasHtml: item.hasHtml || false,
        hasTxt: item.hasTxt || false
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return chatDates;
  } catch (error) {
    console.error('Failed to get chat dates:', error);
    return [];
  }
};

// 读取聊天文件内容
export const fetchChatFile = async (date: string, type: 'html' | 'txt'): Promise<string> => {
  try {
    // 将日期格式从 2025-05-26 转换为 20250526
    const dateStr = date.replace(/-/g, '');
    const filename = `${dateStr}.${type}`;
    const basePath = getBasePath();
    const url = `${basePath}/chatlogs/${filename}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
    }
    
    const content = await response.text();
    return content;
  } catch (error) {
    console.error(`Failed to fetch chat file for ${date} (${type}):`, error);
    throw error;
  }
};

// 搜索所有TXT文件
export const searchAllChatFiles = async (
  keyword: string,
  selectedDate?: string
): Promise<Array<{
  date: string;
  results: Array<{
    id: string;
    sender: string;
    time: string;
    message: string;
    context: string[];
    highlight: string;
  }>;
}>> => {
  try {
    const chatDates = await getChatDates();
    const searchResults: Array<{
      date: string;
      results: Array<{
        id: string;
        sender: string;
        time: string;
        message: string;
        context: string[];
        highlight: string;
      }>;
    }> = [];
    
    // 过滤日期
    const datesToSearch = selectedDate && selectedDate !== 'all' 
      ? chatDates.filter(item => item.date === selectedDate)
      : chatDates;
    
    for (const chatDate of datesToSearch) {
      if (!chatDate.hasTxt) continue;
      
      try {
        const txtContent = await fetchChatFile(chatDate.date, 'txt');
        const { searchInTxtContent } = await import('./chatUtils');
        const results = searchInTxtContent(txtContent, keyword);
        
        if (results.length > 0) {
          searchResults.push({
            date: chatDate.date,
            results: results.map(result => ({
              ...result,
              date: chatDate.date
            }))
          });
        }
      } catch (error) {
        console.warn(`Failed to search in ${chatDate.date}:`, error);
      }
    }
    
    return searchResults;
  } catch (error) {
    console.error('Failed to search chat files:', error);
    return [];
  }
};

// 刷新数据（重新读取文件索引）
export const refreshChatData = async (): Promise<void> => {
  console.log('Refreshing chat data...');
  
  // 清除缓存
  localStorage.removeItem('chatDatesCache');
  
  // 重新读取文件索引
  try {
    const files = await loadFileIndex();
    console.log(`Loaded ${files.length} files from index:`, files);
  } catch (error) {
    console.warn('Failed to load file index during refresh:', error);
  }
}; 