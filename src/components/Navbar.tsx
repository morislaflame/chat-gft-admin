import { Navbar as NextUINavbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { 
  Users, 
  MessageSquare, 
  Target, 
  CreditCard, 
  Package, 
  Gift, 
  BarChart3,
  LogOut
} from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';

const Navbar = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(Context) as IStoreContext;


  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/' },
    { key: 'users', label: 'Users', icon: Users, path: '/users' },
    { key: 'messages', label: 'Messages', icon: MessageSquare, path: '/messages' },
    { key: 'quests', label: 'Quests', icon: Target, path: '/quests' },
    { key: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
    { key: 'products', label: 'Products', icon: Package, path: '/products' },
    { key: 'rewards', label: 'Rewards', icon: Gift, path: '/rewards' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    user.logout()
  };

  return (
    <NextUINavbar maxWidth="full" className="bg-zinc-800">
      <NavbarBrand>
        <Link 
          color="foreground" 
          href="/"
          className="text-white font-bold text-xl"
        >
          ChatGFT Admin
        </Link>
      </NavbarBrand>
      
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavbarItem key={item.key} isActive={isActive(item.path)}>
              <Link
                color={isActive(item.path) ? "primary" : "foreground"}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path) 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button 
              variant="light" 
              className="text-white"
              isIconOnly
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">A</span>
              </div>
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">Admin</p>
            </DropdownItem>
            <DropdownItem key="settings">Settings</DropdownItem>
            <DropdownItem key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem 
              key="logout" 
              color="danger"
              onClick={handleLogout}
              className="text-danger"
            >
              <div className="flex items-center gap-2">
                <LogOut size={16} />
                Log Out
              </div>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </NextUINavbar>
  );
});

export default Navbar;
