import { Navbar as NextUINavbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Tooltip } from '@heroui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import {
  Users,
  Target,
  CreditCard,
  Package,
  Gift,
  Box,
  BarChart3,
  Bot,
  LogOut,
  Calendar,
  Download,
  Menu,
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
    { key: 'quests', label: 'Quests', icon: Target, path: '/quests' },
    { key: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
    { key: 'products', label: 'Products', icon: Package, path: '/products' },
    { key: 'rewards', label: 'Rewards', icon: Gift, path: '/rewards' },
    { key: 'cases', label: 'Cases', icon: Box, path: '/cases' },
    { key: 'withdrawals', label: 'Withdrawals', icon: Download, path: '/withdrawals' },
    { key: 'dailyRewards', label: 'Daily Rewards', icon: Calendar, path: '/daily-rewards' },
    { key: 'agents', label: 'Agents', icon: Bot, path: '/agents' },
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
      
      <NavbarContent className="hidden md:flex gap-1" justify="center">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <NavbarItem key={item.key}>
              <Tooltip content={item.label} placement="bottom" showArrow>
                <Button
                  isIconOnly
                  variant="light"
                  className={`min-w-10 h-10 ${
                    active 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                >
                  <Icon size={20} />
                </Button>
              </Tooltip>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* Mobile/Tablet dropdown menu */}
      <NavbarContent className="md:hidden" justify="center">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button 
              variant="light" 
              className="text-white"
              isIconOnly
            >
              <Menu size={20} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Navigation Menu" variant="flat" className="max-h-[600px] overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <DropdownItem
                  key={item.key}
                  startContent={<Icon size={18} />}
                  className={active ? 'bg-primary/20' : ''}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>
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
