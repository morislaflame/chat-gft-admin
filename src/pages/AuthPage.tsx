import { useState, useContext } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Button,
  Input
} from '@heroui/react';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '@/utils/consts';

const AuthPage = observer(() => {
  const { user } = useContext(Context) as IStoreContext;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await user.loginUser(email, password);

      if (result.success) {
        // Переходим на дашборд, затем перезагружаем
        navigate(DASHBOARD_ROUTE);
        window.location.reload();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">
              ChatGFT Admin
            </h1>
            <p className="text-gray-600">
              Welcome back! Please sign in
            </p>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                isRequired
                variant="bordered"
              />
            </div>

            {/* Password Input */}
            <div>
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                }
                isRequired
                variant="bordered"
              />
            </div>


            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
              isLoading={user.loading}
              startContent={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
});

export default AuthPage;
