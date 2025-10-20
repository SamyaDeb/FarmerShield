import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const handleConnect = async (walletType: 'valora' | 'metamask') => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    setError('');

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful connection
      const mockAddress = '0x1234567890123456789012345678901234567890';
      setConnectionStatus('connected');
      onConnect(mockAddress);
    } catch (err) {
      setConnectionStatus('error');
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const wallets = [
    {
      name: 'Valora',
      description: 'Celo mobile wallet',
      icon: '📱',
      type: 'valora' as const,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
    },
    {
      name: 'MetaMask',
      description: 'Browser extension wallet',
      icon: '🦊',
      type: 'metamask' as const,
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      {connectionStatus === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="text-center">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600">
              Choose your preferred wallet to connect to WeatherShield
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wallets.map((wallet, index) => (
              <motion.div
                key={wallet.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${wallet.color}`}
                  onClick={() => handleConnect(wallet.type)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{wallet.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{wallet.name}</h4>
                        <p className="text-sm text-gray-600">{wallet.description}</p>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't have a wallet? 
              <a href="#" className="text-green-600 hover:text-green-700 ml-1">
                Learn how to get started
              </a>
            </p>
          </div>
        </motion.div>
      )}

      {connectionStatus === 'connecting' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connecting Wallet...
          </h3>
          <p className="text-gray-600">
            Please approve the connection in your wallet
          </p>
        </motion.div>
      )}

      {connectionStatus === 'connected' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wallet Connected!
          </h3>
          <p className="text-gray-600 mb-4">
            Your wallet has been successfully connected
          </p>
          <Badge variant="outline" className="text-green-600 border-green-200">
            Connected
          </Badge>
        </motion.div>
      )}

      {connectionStatus === 'error' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Connection Failed
          </h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <Button 
            onClick={() => setConnectionStatus('idle')}
            variant="outline"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">ℹ</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Security Notice
            </h4>
            <p className="text-sm text-blue-700">
              WeatherShield will never ask for your private keys or seed phrases. 
              Only connect to trusted applications and always verify the connection details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;
