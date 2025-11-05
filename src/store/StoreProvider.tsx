import { createContext, useState, useEffect, type ReactNode } from "react";
import LoadingIndicator from "../components/LoadingIndicator";
import UserStore from "@/store/UserStore";
import AdminStore from "@/store/AdminStore";
import MessageStore from "@/store/MessageStore";
import QuestStore from "@/store/QuestStore";
import PaymentStore from "@/store/PaymentStore";
import ProductStore from "@/store/ProductStore";
import RewardStore from "@/store/RewardStore";
import AgentStore from "@/store/AgentStore";
import DailyRewardStore from "@/store/DailyRewardStore";
import WithdrawalStore from "@/store/WithdrawalStore";

// Определяем интерфейс для нашего контекста
export interface IStoreContext {
  user: UserStore;
  admin: AdminStore;
  message: MessageStore;
  quest: QuestStore;
  payment: PaymentStore;
  product: ProductStore;
  reward: RewardStore;
  agent: AgentStore;
  dailyReward: DailyRewardStore;
  withdrawal: WithdrawalStore;
}

let storeInstance: IStoreContext | null = null;

// Функция для получения экземпляра хранилища
export function getStore(): IStoreContext {
  if (!storeInstance) {
    throw new Error("Store not initialized");
  }
  return storeInstance;
}

// Создаем контекст с начальным значением null, но указываем правильный тип
export const Context = createContext<IStoreContext | null>(null);

// Добавляем типы для пропсов
interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  const [stores, setStores] = useState<{
    user: UserStore;
    admin: AdminStore;
    message: MessageStore;
    quest: QuestStore;
    payment: PaymentStore;
    product: ProductStore;
    reward: RewardStore;
    agent: AgentStore;
    dailyReward: DailyRewardStore;
    withdrawal: WithdrawalStore;
  } | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      const [
        { default: UserStore },
        { default: AdminStore },
        { default: MessageStore },
        { default: QuestStore },
        { default: PaymentStore },
        { default: ProductStore },
        { default: RewardStore },
        { default: AgentStore },
        { default: DailyRewardStore },
        { default: WithdrawalStore },
      ] = await Promise.all([
        import("@/store/UserStore"),
        import("@/store/AdminStore"),
        import("@/store/MessageStore"),
        import("@/store/QuestStore"),
        import("@/store/PaymentStore"),
        import("@/store/ProductStore"),
        import("@/store/RewardStore"),
        import("@/store/AgentStore"),
        import("@/store/DailyRewardStore"),
        import("@/store/WithdrawalStore"),
      ]);

      setStores({
        user: new UserStore(),
        admin: new AdminStore(),
        message: new MessageStore(),
        quest: new QuestStore(),
        payment: new PaymentStore(),
        product: new ProductStore(),
        reward: new RewardStore(),
        agent: new AgentStore(),
        dailyReward: new DailyRewardStore(),
        withdrawal: new WithdrawalStore(),
      });
    };

    loadStores();
  }, []);

  if (!stores) {
    return <LoadingIndicator />; // Use custom loading indicator
  }

  // Сохраняем экземпляр хранилища для доступа из других модулей
  storeInstance = stores;

  return <Context.Provider value={stores}>{children}</Context.Provider>;
};

export default StoreProvider;
