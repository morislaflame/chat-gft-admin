import { useEffect, useState, useContext } from 'react';
import { useDisclosure } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { PageHeader } from '@/components/ui';
import { RewardStats, RewardsTable, RewardFormModal } from '@/components/RewardsPageComponents';
import { type Reward } from '@/types/reward';
import { createRoot } from 'react-dom/client';
import Lottie, { type LottieRefCurrentProps } from 'lottie-react';

async function blobToFile(blob: Blob, fileName: string): Promise<File> {
  return new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
}

async function createPngPreviewFromLottieData(
  animationData: Record<string, unknown>,
  opts?: { size?: number }
): Promise<Blob> {
  const size = opts?.size ?? 512;

  const container = document.createElement('div');
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '-10000px';
  document.body.appendChild(container);

  try {
    const lottieRef: { current: LottieRefCurrentProps | null } = { current: null };
    const root = createRoot(container);
    root.render(
      <div style={{ width: size, height: size }}>
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={false}
          autoplay={false}
          style={{ width: size, height: size }}
        />
      </div>
    );

    // Give React + lottie a tick to mount
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    // Ensure first frame is rendered
    lottieRef.current?.goToAndStop?.(0, true);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const svg = container.querySelector('svg');
    if (!svg) {
      root.unmount();
      throw new Error('SVG renderer not available');
    }

    const serialized = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load SVG into image'));
        image.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas context unavailable');
      }
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (!b) return reject(new Error('Failed to export PNG'));
          resolve(b);
        }, 'image/png');
      });

      root.unmount();
      return pngBlob;
    } finally {
      URL.revokeObjectURL(url);
    }
  } finally {
    container.remove();
  }
}

const RewardsPage = observer(() => {
  const { reward } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewGeneratingId, setPreviewGeneratingId] = useState<number | null>(null);
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

      let saved: { id: number } | null = null;
      if (isEditing && selectedReward) {
        saved = await reward.updateReward(selectedReward.id, rewardData, imageFile || undefined);
      } else {
        saved = await reward.createReward(rewardData, imageFile || undefined);
      }

      // If media was provided, generate & upload preview after reward exists
      if (saved?.id && imageFile) {
        try {
          setPreviewGeneratingId(saved.id);
          if (imageFile.type === 'application/json' || imageFile.name.toLowerCase().endsWith('.json')) {
            const raw = await imageFile.text();
            const animationData = JSON.parse(raw) as Record<string, unknown>;
            const pngBlob = await createPngPreviewFromLottieData(animationData);
            const previewFile = await blobToFile(pngBlob, `reward-${saved.id}-preview.png`);
            await reward.setRewardPreview(saved.id, previewFile);
          } else if (imageFile.type.startsWith('image/')) {
            // For image rewards: reuse the image as preview
            await reward.setRewardPreview(saved.id, imageFile);
          }
        } finally {
          setPreviewGeneratingId(null);
        }
      }
      
      onClose();
      reward.fetchAllRewards();
    } catch (error) {
      console.error('Failed to save reward:', error);
    }
  };

  const handleGeneratePreview = async (rew: Reward) => {
    if (!rew.mediaFile?.url) return;

    try {
      setPreviewGeneratingId(rew.id);

      if (rew.mediaFile.mimeType === 'application/json') {
        const response = await fetch(rew.mediaFile.url);
        const animationData = (await response.json()) as Record<string, unknown>;
        const pngBlob = await createPngPreviewFromLottieData(animationData);
        const previewFile = await blobToFile(pngBlob, `reward-${rew.id}-preview.png`);
        await reward.setRewardPreview(rew.id, previewFile);
      } else if (rew.mediaFile.mimeType.startsWith('image/')) {
        const response = await fetch(rew.mediaFile.url);
        const blob = await response.blob();
        const previewFile = await blobToFile(blob, `reward-${rew.id}-preview.${rew.mediaFile.mimeType.split('/')[1] || 'png'}`);
        await reward.setRewardPreview(rew.id, previewFile);
      }

      reward.fetchAllRewards();
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setPreviewGeneratingId(null);
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
        onGeneratePreview={handleGeneratePreview}
        previewGeneratingId={previewGeneratingId}
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
