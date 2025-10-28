import { useEffect, useState, useContext } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Textarea,
  Chip,
  Switch,
  Image
} from '@heroui/react';
import { Plus, Edit, Trash2, Gift, Star, Upload } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const RewardsPage = observer(() => {
  const { reward } = useContext(Context) as IStoreContext;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    tonPrice: '',
    description: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    reward.fetchAllRewards();
    reward.fetchRewardStats();
  }, []);

  const handleCreateReward = () => {
    setSelectedReward(null);
    setIsEditing(false);
    setFormData({
      name: '',
      price: '',
      tonPrice: '',
      description: '',
      isActive: true
    });
    setImageFile(null);
    onOpen();
  };

  const handleEditReward = (rew: any) => {
    setSelectedReward(rew);
    setIsEditing(true);
    setFormData({
      name: rew.name,
      price: rew.price.toString(),
      tonPrice: rew.tonPrice?.toString() || '',
      description: rew.description || '',
      isActive: rew.isActive
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
        isActive: formData.isActive
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const totalRewards = reward.stats?.totalRewards || 0;
  const activeRewards = reward.stats?.activeRewards || 0;
  const totalPurchases = reward.stats?.totalPurchases || 0;
  const avgPrice = reward.rewards.length > 0 
    ? Math.round(reward.rewards.reduce((sum, r) => sum + r.price, 0) / reward.rewards.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards</h1>
          <p className="text-gray-600">Manage rewards and animations</p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={16} />}
          onClick={handleCreateReward}
        >
          Create Reward
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold text-gray-900">{totalRewards}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Gift className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rewards</p>
                <p className="text-2xl font-bold text-gray-900">{activeRewards}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{totalPurchases}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">{avgPrice}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">All Rewards ({reward.rewards.length})</h3>
        </CardHeader>
        <CardBody>
          {reward.loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <Table aria-label="Rewards table">
              <TableHeader>
                <TableColumn>REWARD</TableColumn>
                <TableColumn>PRICE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ANIMATION</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {reward.rewards.map((rew) => (
                  <TableRow key={rew.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {rew.reward?.url ? (
                          <Image
                            src={rew.reward.url}
                            alt={rew.name}
                            className="w-12 h-12 object-cover rounded-lg"
                            fallbackSrc="https://via.placeholder.com/48x48"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <Gift className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{rew.name}</p>
                          <p className="text-sm text-gray-500">{rew.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">{rew.price}</span>
                      </div>
                      {rew.tonPrice && (
                        <p className="text-xs text-gray-500">{rew.tonPrice} TON</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={rew.isActive ? 'success' : 'danger'} 
                        variant="flat"
                      >
                        {rew.isActive ? 'Active' : 'Inactive'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {rew.reward ? (
                        <Chip color="success" variant="flat" size="sm">
                          Has Animation
                        </Chip>
                      ) : (
                        <Chip color="default" variant="flat" size="sm">
                          No Animation
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {formatDate(rew.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          variant="flat"
                          startContent={<Edit size={14} />}
                          onClick={() => handleEditReward(rew)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          startContent={<Trash2 size={14} />}
                          onClick={() => handleDeleteReward(rew.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create/Edit Reward Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-semibold">
              {isEditing ? 'Edit Reward' : 'Create New Reward'}
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Reward Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter reward name"
                isRequired
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Price (Stars)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Enter price in stars"
                  isRequired
                  startContent={<Star className="w-4 h-4 text-gray-400" />}
                />

                <Input
                  label="TON Price (optional)"
                  type="number"
                  step="0.000000001"
                  value={formData.tonPrice}
                  onChange={(e) => setFormData({...formData, tonPrice: e.target.value})}
                  placeholder="Enter TON price"
                />
              </div>

              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter reward description"
                minRows={3}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Animation File (JSON for Lottie)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="animation-upload"
                  />
                  <label
                    htmlFor="animation-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {imageFile ? imageFile.name : 'Click to upload JSON file'}
                    </p>
                    <p className="text-xs text-gray-500">Lottie animation files only</p>
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  isSelected={formData.isActive}
                  onValueChange={(value) => setFormData({...formData, isActive: value})}
                />
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSaveReward}
              disabled={!formData.name || !formData.price}
            >
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

export default RewardsPage;
