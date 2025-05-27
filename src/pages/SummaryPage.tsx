
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';

const SummaryPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString || '');
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <Layout showNavigation={false}>
      <div className="p-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/chatlog/${date}`)}
            className="text-gray-600 hover:text-xiaohongshu-pink mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回聊天记录
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {formatDate(date || '')} 汇总
          </h1>
          <p className="text-gray-600">当日聊天内容的智能汇总分析</p>
        </div>

        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gradient-to-r from-xiaohongshu-pink to-xiaohongshu-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">汇总功能开发中</h2>
          <p className="text-gray-600">我们正在为您准备精彩的内容汇总功能</p>
        </div>
      </div>
    </Layout>
  );
};

export default SummaryPage;
