import { useEffect, useContext } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Users, MessageSquare, Target, Gift, TrendingUp, DollarSign } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const DashboardPage = observer(() => {
  const { admin } = useContext(Context) as IStoreContext;

  useEffect(() => {
    // Загружаем все данные дашборда одним запросом
    admin.fetchDashboardData();
  }, [admin]);

  const statsCards = [
    {
      title: 'Total Users',
      value: admin.dashboardData?.users.length || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Messages',
      value: admin.dashboardData?.messageStats.messageCount || 0,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Quests',
      value: admin.dashboardData?.questStats.activeQuests || 0,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Rewards',
      value: admin.dashboardData?.rewardStats.totalRewards || 0,
      icon: Gift,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Total Orders',
      value: admin.dashboardData?.orderStats.totalOrders || 0,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Total Products',
      value: admin.dashboardData?.productStats.totalProducts || 0,
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-300">Welcome to ChatGFT Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-30">{stat.title}</p>
                    <p className="text-3xl font-bold ">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Purchase Statistics</h3>
          </CardHeader>
          <CardBody>
            {admin.dashboardData?.purchaseStats ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Purchases</span>
                  <span className="font-semibold">{admin.dashboardData.purchaseStats.total_purchases}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Stars</span>
                  <span className="font-semibold">{admin.dashboardData.purchaseStats.total_stars}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Reward Statistics</h3>
          </CardHeader>
          <CardBody>
            {admin.dashboardData?.rewardStats ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Rewards</span>
                  <span className="font-semibold">{admin.dashboardData.rewardStats.activeRewards}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Purchases</span>
                  <span className="font-semibold">{admin.dashboardData.rewardStats.totalPurchases}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading...</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Users</h3>
        </CardHeader>
        <CardBody>
          {admin.dashboardData?.users && admin.dashboardData.users.length > 0 ? (
            <div className="space-y-3">
              {admin.dashboardData.users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user.firstName?.charAt(0) || user.username?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-300">@{user.username || 'No username'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.balance} balance</p>
                    <p className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No users found</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
});

export default DashboardPage;
