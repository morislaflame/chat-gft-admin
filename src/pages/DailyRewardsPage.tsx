import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus, RotateCcw } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { DailyRewardStats, DailyRewardsTable, DailyRewardFormModal } from '@/components/DailyRewardsPageComponents';
import { type DailyReward } from '@/http/dailyRewardAPI';

type DailyRewardUpdatePayload = {
  reward?: number;
  rewardType?: 'energy' | 'tokens';
  rewardCaseId?: number | null;
  secondReward?: number;
  secondRewardType?: 'energy' | 'tokens' | null;
};

type DailyRewardCreatePayload = {
  day: number;
  reward: number;
  rewardType: 'energy' | 'tokens';
  rewardCaseId?: number | null;
  secondReward?: number;
  secondRewardType?: 'energy' | 'tokens' | null;
  description: string;
};

const DailyRewardsPage = observer(() => {
  const { dailyReward, caseStore } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({
    day: '',
    reward: '',
    secondReward: '',
    rewardCaseId: ''
  });
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    dailyReward.fetchAllDailyRewards();
    caseStore.fetchAllCasesAdmin();
  }, [dailyReward, caseStore]);

  const handleCreateReward = () => {
    setFormData({
      day: '',
      reward: '',
      secondReward: '',
      rewardCaseId: ''
    });
    onOpen();
  };

  const handleSaveReward = async () => {
    try {
      await dailyReward.createDailyReward({
        day: parseInt(formData.day),
        reward: parseInt(formData.reward || '0'),
        rewardType: 'energy',
        rewardCaseId: formData.rewardCaseId ? Number(formData.rewardCaseId) : null,
        secondReward: parseInt(formData.secondReward || '0'),
        secondRewardType: 'tokens',
        description: ''
      } as DailyRewardCreatePayload);

      onClose();
      dailyReward.fetchAllDailyRewards();
    } catch (error) {
      console.error('Не удалось сохранить ежедневную награду:', error);
    }
  };

  const handleInlineUpdateReward = async (reward: DailyReward, patch: DailyRewardUpdatePayload) => {
    await dailyReward.updateDailyRewardByDay(reward.day, {
      rewardType: 'energy',
      secondRewardType: 'tokens',
      ...patch
    });
  };

  const handleInlineUpdateError = (message: string) => {
    setToast({ message, type: 'error' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteReward = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту ежедневную награду?')) {
      try {
        await dailyReward.deleteDailyReward(id);
        dailyReward.fetchAllDailyRewards();
      } catch (error) {
        console.error('Не удалось удалить ежедневную награду:', error);
      }
    }
  };

  const handleResetRewards = async () => {
    if (window.confirm('Вы уверены, что хотите сбросить ежедневные награды для всех пользователей? Награды снова станут доступными всем.')) {
      try {
        await dailyReward.resetDailyRewards();
        alert('Ежедневные награды успешно сброшены!');
        dailyReward.fetchAllDailyRewards();
      } catch (error) {
        console.error('Не удалось сбросить ежедневные награды:', error);
        alert('Не удалось сбросить ежедневные награды');
      }
    }
  };

  const totalRewards = dailyReward.dailyRewards.length;
  const configuredDays = dailyReward.dailyRewards.length;

  return (
    <div className="p-6 space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`rounded-lg px-4 py-3 text-sm shadow-lg border ${toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' : 'bg-green-500/90 border-green-400 text-white'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <PageHeader
        title="Ежедневные награды"
        description="Управление настройкой ежедневных наград (цикл 7 дней)"
        actionButton={{
          label: "Создать награду",
          icon: Plus,
          onClick: handleCreateReward
        }}
        secondaryActionButton={{
          label: "Сбросить все награды",
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
        onDeleteReward={handleDeleteReward}
        onInlineUpdateReward={handleInlineUpdateReward}
        onInlineUpdateError={handleInlineUpdateError}
        cases={caseStore.cases}
      />

      <DailyRewardFormModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={false}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveReward}
        cases={caseStore.cases}
      />
    </div>
  );
});

export default DailyRewardsPage;

