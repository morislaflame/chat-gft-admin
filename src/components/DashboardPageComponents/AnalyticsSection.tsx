import { Card, CardBody, CardHeader } from '@heroui/react';

interface DashboardData {
  purchaseStats?: {
    total_purchases: number;
    total_stars: number;
  };
  rewardStats?: {
    activeRewards: number;
    totalPurchases: number;
  };
}

interface AnalyticsSectionProps {
  dashboardData?: DashboardData;
}

export const AnalyticsSection = ({ dashboardData }: AnalyticsSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Статистика покупок</h3>
        </CardHeader>
        <CardBody>
          {dashboardData?.purchaseStats ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Всего покупок</span>
                <span className="font-semibold">{dashboardData.purchaseStats.total_purchases}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Всего звезд</span>
                <span className="font-semibold">{dashboardData.purchaseStats.total_stars}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Загрузка...</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Статистика наград</h3>
        </CardHeader>
        <CardBody>
          {dashboardData?.rewardStats ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Активные награды</span>
                <span className="font-semibold">{dashboardData.rewardStats.activeRewards}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Всего покупок</span>
                <span className="font-semibold">{dashboardData.rewardStats.totalPurchases}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Загрузка...</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};
