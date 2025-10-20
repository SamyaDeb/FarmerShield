import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Shield,
  MapPin,
  Calendar,
  Crop
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface FarmStatsProps {
  farmer: any;
  claims: any[];
  detailed?: boolean;
}

const FarmStats: React.FC<FarmStatsProps> = ({ farmer, claims, detailed = false }) => {
  if (!farmer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farm Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">Loading farm data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPayouts = claims.reduce((sum, claim) => sum + claim.amount, 0);
  const averagePayout = claims.length > 0 ? totalPayouts / claims.length : 0;
  const coverageUtilization = farmer.insuranceDetails.coverageAmount > 0 
    ? (totalPayouts / farmer.insuranceDetails.coverageAmount) * 100 
    : 0;

  const stats = [
    {
      title: 'Farm Size',
      value: `${farmer.farmDetails.farmSize} ${farmer.farmDetails.farmSizeUnit}`,
      icon: <MapPin className="h-5 w-5 text-blue-500" />,
      description: 'Total farm area'
    },
    {
      title: 'Crop Type',
      value: farmer.farmDetails.cropType.charAt(0).toUpperCase() + farmer.farmDetails.cropType.slice(1),
      icon: <Crop className="h-5 w-5 text-green-500" />,
      description: 'Primary crop grown'
    },
    {
      title: 'Coverage Amount',
      value: `$${farmer.insuranceDetails.coverageAmount.toLocaleString()}`,
      icon: <Shield className="h-5 w-5 text-purple-500" />,
      description: 'Maximum coverage limit'
    },
    {
      title: 'Total Payouts',
      value: `$${totalPayouts.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
      description: 'Amount received in claims'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Farm Statistics
          </CardTitle>
          <CardDescription>
            Overview of your farm and insurance performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                variants={itemVariants}
                className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {stat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {stat.title}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coverage Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Coverage Utilization
          </CardTitle>
          <CardDescription>
            How much of your coverage has been utilized
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Coverage Used
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {coverageUtilization.toFixed(1)}%
              </span>
            </div>
            <Progress value={coverageUtilization} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>${totalPayouts.toLocaleString()} used</span>
              <span>${farmer.insuranceDetails.coverageAmount.toLocaleString()} total</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-purple-500" />
            Policy Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <Badge 
                className={
                  farmer.insuranceDetails.policyStatus === 'active' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }
              >
                {farmer.insuranceDetails.policyStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Premium Amount</span>
              <span className="text-sm font-semibold text-gray-900">
                ${farmer.insuranceDetails.premiumAmount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Next Payment Due</span>
              <span className="text-sm text-gray-600">
                {new Date(farmer.insuranceDetails.nextPremiumDue).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {detailed && (
        <>
          {/* Claims Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                Claims Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {claims.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Claims</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${averagePayout.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Average Payout</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {claims.filter(c => c.status === 'paid').length}
                  </div>
                  <div className="text-sm text-gray-600">Paid Claims</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farm Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Farm Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Farm Registered
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(farmer.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Crop Planted
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(farmer.farmDetails.plantingDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      Expected Harvest
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(farmer.farmDetails.expectedHarvestDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default FarmStats;
