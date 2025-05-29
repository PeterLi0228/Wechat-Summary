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

// 发现可用的聊天文件
const discoverChatFiles = async (): Promise<string[]> => {
  const files: string[] = [];
  const basePath = getBasePath();
  
  // 尝试一些常见的日期格式来发现文件
  // 这里可以根据实际需要扩展日期范围
  const today = new Date();
  const dates: string[] = [];
  
  // 生成最近30天的日期
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    dates.push(dateStr);
  }
  
  // 检查每个日期的文件是否存在
  for (const dateStr of dates) {
    // 检查TXT文件
    try {
      const response = await fetch(`${basePath}/chatlogs/${dateStr}.txt`, { method: 'HEAD' });
      if (response.ok) {
        files.push(`${dateStr}.txt`);
      }
    } catch (error) {
      // 文件不存在，忽略
    }
    
    // 检查HTML文件
    try {
      const response = await fetch(`${basePath}/chatlogs/${dateStr}.html`, { method: 'HEAD' });
      if (response.ok) {
        files.push(`${dateStr}.html`);
      }
    } catch (error) {
      // 文件不存在，忽略
    }
  }
  
  // 如果没有发现任何文件，回退到已知文件
  if (files.length === 0) {
    return ['20250526.txt', '20250526.html'];
  }
  
  return files;
};

// 获取所有可用的聊天日期
export const getChatDates = async (): Promise<ChatDate[]> => {
  try {
    // 尝试发现可用的文件
    const knownFiles = await discoverChatFiles();
    
    const dateMap = new Map<string, Partial<ChatDate>>();
    
    for (const filename of knownFiles) {
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
          // 读取TXT文件来获取消息统计
          try {
            const txtContent = await fetchChatFile(date, 'txt');
            const messageCount = estimateMessageCount(txtContent);
            if (messageCount > 0) {
              chatDate.hasTxt = true;
              chatDate.messageCount = messageCount;
            }
          } catch (error) {
            console.warn(`Failed to read txt file for ${date}:`, error);
            // 如果无法读取文件，不标记为有TXT文件
          }
        }
      }
    }
    
    // 转换为数组并按日期排序（最新的在前）
    const chatDates = Array.from(dateMap.values())
      .filter(item => item.hasTxt && item.messageCount! > 0) // 只显示有TXT文件且有消息的日期
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

// 刷新数据（重新读取文件列表）
export const refreshChatData = async (): Promise<void> => {
  console.log('Refreshing chat data...');
  
  // 清除缓存
  localStorage.removeItem('chatDatesCache');
  
  // 重新发现文件（这会在下次调用getChatDates时生效）
  try {
    await discoverChatFiles();
    console.log('File discovery completed');
  } catch (error) {
    console.warn('Failed to discover files during refresh:', error);
  }
}; 