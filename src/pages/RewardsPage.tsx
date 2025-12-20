import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { RewardStats, RewardsTable, RewardFormModal } from '@/components/RewardsPageComponents';
import { type Reward } from '@/types/reward';

const RewardsPage = observer(() => {
  const { reward } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    tonPrice: '',
    description: '',
    isActive: true,
    onlyCase: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    reward.fetchAllRewards();
    reward.fetchRewardStats();
  }, [reward]);

  const handleCreateReward = () => {
    setSelectedReward(null);
    setIsEditing(false);
    setFormData({
      name: '',
      price: '',
      tonPrice: '',
      description: '',
      isActive: true,
      onlyCase: false,
    });
    setImageFile(null);
    onOpen();
  };

  const handleEditReward = (rew: Reward) => {
    setSelectedReward(rew);
    setIsEditing(true);
    setFormData({
      name: rew.name,
      price: rew.price.toString(),
      tonPrice: rew.tonPrice?.toString() || '',
      description: rew.description || '',
      isActive: rew.isActive,
      onlyCase: !!rew.onlyCase,
    });
    setImageFile(null);
    onOpen();
  };

  const handleSaveReward = async () => {
    try {
      const rewardData = {
        name: formData.name,
        price: parseInt(formData.price),
        tonPrice: formData.tonPrice ? parseFloat(formData.tonPrice) : undefined,
        description: formData.description,
        isActive: formData.isActive,
        onlyCase: formData.onlyCase,
      };

      if (isEditing && selectedReward) {
        await reward.updateReward(selectedReward.id, rewardData, imageFile || undefined);
      } else {
        await reward.createReward(rewardData, imageFile || undefined);
      }
      
      onClose();
      reward.fetchAllRewards();
    } catch (error) {
      console.error('Failed to save reward:', error);
    }
  };

  const handleDeleteReward = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await reward.deleteReward(id);
        reward.fetchAllRewards();
      } catch (error) {
        console.error('Failed to delete reward:', error);
      }
    }
  };


  const totalRewards = reward.stats?.totalRewards || 0;
  const activeRewards = reward.stats?.activeRewards || 0;
  const totalPurchases = reward.stats?.totalPurchases || 0;
  const avgPrice = reward.rewards.length > 0 
    ? Math.round(reward.rewards.reduce((sum, r) => sum + r.price, 0) / reward.rewards.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Rewards"
        description="Manage rewards and animations"
        actionButton={{
          label: "Create Reward",
          icon: Plus,
          onClick: handleCreateReward
        }}
      />

      <RewardStats
        totalRewards={totalRewards}
        activeRewards={activeRewards}
        totalPurchases={totalPurchases}
        avgPrice={avgPrice}
      />

      <RewardsTable
        rewards={reward.rewards}
        loading={reward.loading}
        onEditReward={handleEditReward}
        onDeleteReward={handleDeleteReward}
      />

      <RewardFormModal
        isOpen={isOpen}
        onClose={onClose}
        isEditing={isEditing}
        formData={formData}
        onFormDataChange={setFormData}
        imageFile={imageFile}
        onImageFileChange={setImageFile}
        onSave={handleSaveReward}
      />
    </div>
  );
});

export default RewardsPage;
