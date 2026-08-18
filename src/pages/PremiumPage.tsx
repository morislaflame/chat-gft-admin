import { useCallback, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { PageHeader, StatsCard } from '@/components/ui';
import {
  getPremiumStats,
  updateEconomySettings,
  upsertPremiumProduct,
  type PremiumStatsResponse,
} from '@/http/adminAPI';
import {
  Button,
  Card,
  CardBody,
  Input,
} from '@heroui/react';
import { Crown, Star, Users, Percent, Zap, Save } from 'lucide-react';
import { formatDate } from '@/utils/formatters';

const PremiumPage = observer(() => {
  const [data, setData] = useState<PremiumStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingEconomy, setSavingEconomy] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [energyCapRegular, setEnergyCapRegular] = useState('');
  const [energyCapPremium, setEnergyCapPremium] = useState('');
  const [dailyMultiplier, setDailyMultiplier] = useState('');
  const [productName, setProductName] = useState('');
  const [starsPrice, setStarsPrice] = useState('');
  const [referralEnergy, setReferralEnergy] = useState('');
  const [referralBalance, setReferralBalance] = useState('');

  const applyStats = (stats: PremiumStatsResponse) => {
    setData(stats);
    setEnergyCapRegular(String(stats.settings.energyCapRegular));
    setEnergyCapPremium(String(stats.settings.energyCapPremium));
    setDailyMultiplier(String(stats.settings.dailyRewardPremiumMultiplier));
    const product = stats.premiumProduct;
    setProductName(product?.name ?? 'Premium');
    setStarsPrice(product != null ? String(product.starsPrice) : '');
    setReferralEnergy(product?.referralBonus?.energy != null ? String(product.referralBonus.energy) : '');
    setReferralBalance(product?.referralBonus?.balance != null ? String(product.referralBonus.balance) : '');
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await getPremiumStats();
      applyStats(stats);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Не удалось загрузить настройки Premium');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveEconomy = async () => {
    const regular = parseInt(energyCapRegular, 10);
    const premium = parseInt(energyCapPremium, 10);
    const multiplier = parseInt(dailyMultiplier, 10);
    if (!Number.isInteger(regular) || regular < 0) {
      setError('Кап энергии для обычных должен быть целым числом ≥ 0');
      return;
    }
    if (!Number.isInteger(premium) || premium < 0) {
      setError('Кап энергии для премиум должен быть целым числом ≥ 0');
      return;
    }
    if (!Number.isInteger(multiplier) || multiplier < 1 || multiplier > 20) {
      setError('Множитель дейлика должен быть целым числом от 1 до 20');
      return;
    }

    setSavingEconomy(true);
    setError(null);
    try {
      await updateEconomySettings({
        energyCapRegular: regular,
        energyCapPremium: premium,
        dailyRewardPremiumMultiplier: multiplier,
      });
      await load();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Не удалось сохранить настройки');
    } finally {
      setSavingEconomy(false);
    }
  };

  const handleSaveProduct = async () => {
    const name = productName.trim();
    const price = parseInt(starsPrice, 10);
    if (!name) {
      setError('Название пасса обязательно');
      return;
    }
    if (!Number.isInteger(price) || price < 1) {
      setError('Цена в Stars должна быть целым числом ≥ 1');
      return;
    }

    const energy = parseInt(referralEnergy, 10);
    const balance = parseInt(referralBalance, 10);
    const referralBonus =
      (Number.isInteger(energy) && energy > 0) || (Number.isInteger(balance) && balance > 0)
        ? {
            energy: Number.isInteger(energy) && energy > 0 ? energy : undefined,
            balance: Number.isInteger(balance) && balance > 0 ? balance : undefined,
          }
        : null;

    setSavingProduct(true);
    setError(null);
    try {
      await upsertPremiumProduct({
        name,
        starsPrice: price,
        referralBonus,
      });
      await load();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Не удалось сохранить продукт пасса');
    } finally {
      setSavingProduct(false);
    }
  };

  const hasProduct = Boolean(data?.premiumProduct);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Premium"
        description="Создание пасса, цена в Stars, капы энергии, множитель дейлика и статистика покупок."
      />

      {error && (
        <Card className="border border-red-500">
          <CardBody>
            <div className="text-red-500 text-sm">{error}</div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Premium-пользователи"
          value={data?.premiumUsers ?? 0}
          icon={Crown}
          color="text-yellow-500"
          bgColor="bg-yellow-100"
        />
        <StatsCard
          title="Конверсия"
          value={`${data?.conversionPercent ?? 0}%`}
          icon={Percent}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatsCard
          title="Покупок пасса"
          value={data?.purchases.total_purchases ?? 0}
          icon={Users}
          color="text-emerald-600"
          bgColor="bg-emerald-100"
        />
        <StatsCard
          title="Stars за пасс"
          value={data?.purchases.total_stars ?? 0}
          icon={Star}
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardBody className="space-y-4">
            <h3 className="text-xl font-semibold">Продукт пасса</h3>
            <p className="text-sm text-zinc-400">
              Один разовый товар за Stars. Клиент покупает его через отдельный роут, не через пакеты энергии.
            </p>
            <Input
              label="Название"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Premium"
            />
            <Input
              label="Цена в Stars"
              type="number"
              value={starsPrice}
              onChange={(e) => setStarsPrice(e.target.value)}
              startContent={<Star className="w-4 h-4 text-yellow-400" />}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Реф. бонус — энергия"
                type="number"
                value={referralEnergy}
                onChange={(e) => setReferralEnergy(e.target.value)}
                description="Пригласившему, необязательно"
              />
              <Input
                label="Реф. бонус — гемы"
                type="number"
                value={referralBalance}
                onChange={(e) => setReferralBalance(e.target.value)}
                description="Пригласившему, необязательно"
              />
            </div>
            <Button
              color="primary"
              startContent={<Save size={16} />}
              onPress={handleSaveProduct}
              isLoading={savingProduct || loading}
            >
              {hasProduct ? 'Сохранить продукт' : 'Создать продукт пасса'}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <h3 className="text-xl font-semibold">Экономика</h3>
            <p className="text-sm text-zinc-400">
              Кап ограничивает накопление энергии из дейликов, квестов и наград за шаги.
              Кейсы, пакеты за Stars и рефералка начисляются сверх лимита.
            </p>
            <Input
              label="Кап энергии — обычные"
              type="number"
              value={energyCapRegular}
              onChange={(e) => setEnergyCapRegular(e.target.value)}
              startContent={<Zap className="w-4 h-4 text-zinc-400" />}
            />
            <Input
              label="Кап энергии — Premium"
              type="number"
              value={energyCapPremium}
              onChange={(e) => setEnergyCapPremium(e.target.value)}
              startContent={<Zap className="w-4 h-4 text-yellow-400" />}
            />
            <Input
              label="Множитель ежедневных наград для Premium"
              type="number"
              value={dailyMultiplier}
              onChange={(e) => setDailyMultiplier(e.target.value)}
              description="Премиум получает те же дейлики, умноженные на это число (включая кейс)"
            />
            <Button
              color="primary"
              startContent={<Save size={16} />}
              onPress={handleSaveEconomy}
              isLoading={savingEconomy || loading}
            >
              Сохранить экономику
            </Button>
            {data?.settings?.updatedAt && (
              <p className="text-xs text-zinc-500">
                Настройки обновлены: {formatDate(data.settings.updatedAt)}
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
});

export default PremiumPage;
