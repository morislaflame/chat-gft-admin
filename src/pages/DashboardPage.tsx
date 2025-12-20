import { useEffect, useContext } from 'react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { DashboardStats, AnalyticsSection } from '@/components/DashboardPageComponents';

const DashboardPage = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  useEffect(() => {
    // Загружаем все данные дашборда одним запросом
    admin.fetchDashboardData();
  }, [admin]);


  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-300">Welcome to ChatGFT Admin Panel</p>
      </div>

      <DashboardStats dashboardData={admin.dashboardData || undefined} />
      <AnalyticsSection dashboardData={admin.dashboardData || undefined} />
    </div>
  );
});

export default DashboardPage;
