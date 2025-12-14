import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus, RotateCcw } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { DailyRewardStats, DailyRewardsTable, DailyRewardFormModal } from '@/components/DailyRewardsPageComponents';
import { type DailyReward } from '@/http/dailyRewardAPI';

const DailyRewardsPage = observer(() => {
  const { dailyReward } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReward, setSelectedReward] = useState<DailyReward | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    day: '',
    reward: '',
    secondReward: '',
    description: ''
  });

  useEffect(() => {
    dailyReward.fetchAllDailyRewards();
  }, [dailyReward]);

  const handleCreateReward = () => {
    setSelectedReward(null);
    setIsEditing(false);
    setFormData({
      day: '',
      reward: '',
      secondReward: '',
      description: ''
    });
    onOpen();
  };

  const handleEditReward = (reward: DailyReward) => {
    setSelectedReward(reward);
    setIsEditing(true);
    setFormData({
      day: reward.day.toString(),
      reward: reward.reward.toString(),
      secondReward: (reward.secondReward ?? 0).toString(),
      description: reward.description
    });
    onOpen();
  };

  const handleSaveReward = async () => {
    try {
      if (isEditing && selectedReward) {
        await dailyReward.updateDailyRewardByDay(
          selectedReward.day,
          {
            reward: parseInt(formData.reward || '0'),
            rewardType: 'energy',
            secondReward: parseInt(formData.secondReward || '0'),
            secondRewardType: 'tokens',
            description: formData.description
          }
        );
      } else {
        await dailyReward.createDailyReward({
          day: parseInt(formData.day),
          reward: parseInt(formData.reward || '0'),
          rewardType: 'energy',
          secondReward: parseInt(formData.secondReward || '0'),
          secondRewardType: 'tokens',
          description: formData.description
        });
      }

      onClose();
      dailyReward.fetchAllDailyRewards();
    } catch (error) {
      console.error('Failed to save daily reward:', error);
    }
  };

  const handleDeleteReward = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this daily reward?')) {
      try {
        await dailyReward.deleteDailyReward(id);
        dailyReward.fetchAllDailyRewards();
      } catch (error) {
        console.error('Failed to delete daily reward:', error);
      }
    }
  };

  const handleResetRewards = async () => {
    if (window.confirm('Are you sure you want to reset all daily rewards for all users? This will make rewards available again for all users.')) {
      try {
        await dailyReward.resetDailyRewards();
        alert('Daily rewards reset successfully!');
        dailyReward.fetchAllDailyRewards();
      } catch (error) {
        console.error('Failed to reset daily rewards:', error);
        alert('Failed to reset daily rewards');
      }
    }
  };

  const totalRewards = dailyReward.dailyRewards.length;
  const configuredDays = dailyReward.dailyRewards.length;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Daily Rewards"
        description="Manage daily rewards configuration (7-day cycle)"
        actionButton={{
          label: "Create Reward",
          icon: Plus,
          onClick: handleCreateReward
        }}
        secondaryActionButton={{
          label: "Reset All Rewards",
          icon: RotateCcw,
          onClick: handleResetRewards,
          color: "warning"
        }}
      />

      <DailyRewardStats
        totalRewards={totalRewards}
        configuredDays={configuredDays}
      />

      <DailyRewardsTable
        rewards={dailyReward.dailyRewards}
        loading={dailyReward.loading}
        onEditReward={handleEditReward}
        onDeleteReward={handleDeleteReward}
      />

      <DailyRewardFormModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveReward}
      />
    </div>
  );
});

export default DailyRewardsPage;

