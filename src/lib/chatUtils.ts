// 聊天记录工具函数
export interface ChatDate {
  date: string;
  messageCount: number;
  hasHtml: boolean;
  hasTxt: boolean;
}

export interface SearchResult {
  id: string;
  date: string;
  sender: string;
  time: string;
  message: string;
  context: string[];
  highlight: string;
}

// 从文件名解析日期
export const parseFileDate = (filename: string): string | null => {
  const match = filename.match(/(\d{8})\.(html|txt)$/);
  if (match) {
    const dateStr = match[1];
    // 将 20250526 转换为 2025-05-26
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  return null;
};

// 格式化日期显示
export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

// 获取星期几
export const getDayOfWeek = (dateString: string): string => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

// 判断是否为拍一拍消息
const isPaiYiPaiMessage = (message: string): boolean => {
  // 匹配各种拍一拍的格式
  const paiYiPaiPatterns = [
    /拍了拍/
  ];
  
  return paiYiPaiPatterns.some(pattern => pattern.test(message));
};

// 解析TXT文件内容，提取消息
export const parseTxtContent = (content: string): Array<{
  sender: string;
  time: string;
  message: string;
  line: number;
}> => {
  const lines = content.split('\n');
  const messages: Array<{
    sender: string;
    time: string;
    message: string;
    line: number;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // 匹配格式：发送者(wxid) 时间
    const match = line.match(/^(.+?)\(([^)]+)\)\s+(\d{2}:\d{2}:\d{2})$/);
    if (match) {
      const sender = match[1];
      const time = match[3];
      
      // 获取下一行作为消息内容
      let message = '';
      if (i + 1 < lines.length) {
        message = lines[i + 1].trim();
        i++; // 跳过消息行
      }

      if (message && !message.startsWith('>') && !isPaiYiPaiMessage(message)) { // 排除引用消息和拍一拍消息
        messages.push({
          sender,
          time,
          message,
          line: i
        });
      }
    }
  }

  return messages;
};

// 在TXT内容中搜索关键词
export const searchInTxtContent = (
  content: string,
  keyword: string,
  contextLines: number = 2
): SearchResult[] => {
  const messages = parseTxtContent(content);
  const results: SearchResult[] = [];
  
  messages.forEach((message, index) => {
    if (message.message.toLowerCase().includes(keyword.toLowerCase())) {
      // 获取上下文
      const contextStart = Math.max(0, index - contextLines);
      const contextEnd = Math.min(messages.length - 1, index + contextLines);
      const context: string[] = [];
      
      for (let i = contextStart; i <= contextEnd; i++) {
        const contextMsg = messages[i];
        const prefix = i === index ? '→ ' : '  ';
        context.push(`${prefix}${contextMsg.sender}: ${contextMsg.message}`);
      }

      results.push({
        id: `${message.line}-${index}`,
        date: '', // 需要从外部传入
        sender: message.sender,
        time: message.time,
        message: message.message,
        context,
        highlight: keyword
      });
    }
  });

  return results;
};

// 估算消息数量（从TXT文件）
export const estimateMessageCount = (content: string): number => {
  return parseTxtContent(content).length;
};

 