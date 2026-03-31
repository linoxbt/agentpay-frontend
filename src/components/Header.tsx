import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Bot, LayoutDashboard, Store, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  currentView: 'marketplace' | 'dashboard' | 'create-agent' | 'create-service';
  onViewChange: (view: 'marketplace' | 'dashboard' | 'create-agent' | 'create-service') => void;
}

export function Header({
  currentView,
  onViewChange,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isServiceDetail = location.pathname.startsWith('/service/');

  const handleNavigate = (view: 'marketplace' | 'dashboard' | 'create-agent' | 'create-service') => {
    onViewChange(view);
    if (view === 'marketplace') {
      navigate('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => handleNavigate('marketplace')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <img src="/logo.png" alt="AgentPay" className="w-8 h-8 object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AgentPay
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">AI Agent Marketplace</p>
          </div>
        </div>

        {/* Navigation */}
        {!isServiceDetail && (
          <nav className="hidden md:flex items-center gap-1">
            <Button
              variant={currentView === 'marketplace' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('marketplace')}
              className={currentView === 'marketplace' ? 'bg-blue-600' : ''}
            >
              <Store className="w-4 h-4 mr-2" />
              Marketplace
            </Button>
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('dashboard')}
              className={currentView === 'dashboard' ? 'bg-blue-600' : ''}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={currentView === 'create-agent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('create-agent')}
              className={currentView === 'create-agent' ? 'bg-blue-600' : ''}
            >
              <Bot className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
            <Button
              variant={currentView === 'create-service' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('create-service')}
              className={currentView === 'create-service' ? 'bg-green-600' : ''}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Service
            </Button>
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ConnectButton 
            label="Connect"
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
            accountStatus={{
              smallScreen: 'avatar',
              largeScreen: 'full',
            }}
            chainStatus={{
              smallScreen: 'icon',
              largeScreen: 'full',
            }}
          />
        </div>
      </div>

      {/* Mobile Navigation */}
      {!isServiceDetail && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-2 flex justify-around overflow-x-auto">
            <Button
              variant={currentView === 'marketplace' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('marketplace')}
              className={`${currentView === 'marketplace' ? 'bg-blue-600' : ''} flex-shrink-0`}
            >
              <Store className="w-4 h-4" />
            </Button>
            <Button
              variant={currentView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('dashboard')}
              className={`${currentView === 'dashboard' ? 'bg-blue-600' : ''} flex-shrink-0`}
            >
              <LayoutDashboard className="w-4 h-4" />
            </Button>
            <Button
              variant={currentView === 'create-agent' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('create-agent')}
              className={`${currentView === 'create-agent' ? 'bg-blue-600' : ''} flex-shrink-0`}
            >
              <Bot className="w-4 h-4" />
            </Button>
            <Button
              variant={currentView === 'create-service' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigate('create-service')}
              className={`${currentView === 'create-service' ? 'bg-green-600' : ''} flex-shrink-0`}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
