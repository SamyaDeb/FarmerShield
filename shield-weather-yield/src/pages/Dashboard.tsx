import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Droplets, 
  Thermometer, 
  Wind, 
  CloudRain,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const Dashboard = () => {
  // Mock data
  const farmerData = {
    wallet: "0x742d...35CE",
    cropType: "Rice",
    location: "Nakuru County, Kenya",
    farmSize: 5,
    premium: 60,
    coverage: 500,
    status: "active"
  };

  const weatherData = {
    rainfall: 45,
    temperature: 28,
    humidity: 72,
    windSpeed: 12,
    lastUpdated: "2 hours ago"
  };

  const claimHistory = [
    { id: 1, date: "2024-09-15", amount: 120, reason: "Drought threshold met", status: "paid" },
    { id: 2, date: "2024-06-22", amount: 85, reason: "Excess rainfall", status: "paid" },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Farmer Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your coverage and weather conditions in real-time
              </p>
            </div>
            <Badge variant="outline" className="w-fit border-primary text-primary">
              <Shield className="w-3 h-3 mr-1" />
              {farmerData.status === "active" ? "Protected" : "Inactive"}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Coverage"
            value={`$${farmerData.coverage}`}
            subtext="cUSD"
            icon={<Shield className="w-5 h-5 text-primary" />}
          />
          <StatCard
            label="Premium Paid"
            value={`$${farmerData.premium}`}
            subtext="This season"
            icon={<TrendingUp className="w-5 h-5 text-accent" />}
          />
          <StatCard
            label="Farm Size"
            value={`${farmerData.farmSize} ha`}
            subtext={farmerData.cropType}
            icon={<CheckCircle2 className="w-5 h-5 text-primary" />}
          />
          <StatCard
            label="Claims Paid"
            value="2"
            subtext="$205 total"
            icon={<AlertCircle className="w-5 h-5 text-accent" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weather Monitor - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-primary" />
                Live Weather Data
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <WeatherCard
                  icon={<Droplets className="w-6 h-6 text-blue-500" />}
                  label="Rainfall"
                  value={`${weatherData.rainfall}mm`}
                  progress={weatherData.rainfall}
                  threshold={50}
                  thresholdLabel="Drought threshold: 50mm/month"
                />
                <WeatherCard
                  icon={<Thermometer className="w-6 h-6 text-orange-500" />}
                  label="Temperature"
                  value={`${weatherData.temperature}°C`}
                  progress={(weatherData.temperature / 45) * 100}
                  threshold={70}
                  thresholdLabel="Heat stress: 35°C+"
                />
                <WeatherCard
                  icon={<Wind className="w-6 h-6 text-gray-500" />}
                  label="Wind Speed"
                  value={`${weatherData.windSpeed} km/h`}
                  progress={(weatherData.windSpeed / 50) * 100}
                  threshold={80}
                  thresholdLabel="Storm alert: 40+ km/h"
                />
                <WeatherCard
                  icon={<Droplets className="w-6 h-6 text-teal-500" />}
                  label="Humidity"
                  value={`${weatherData.humidity}%`}
                  progress={weatherData.humidity}
                  threshold={60}
                  thresholdLabel="Optimal: 60-80%"
                />
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Data sourced from RedStone Oracles • Updated {weatherData.lastUpdated}
              </div>
            </Card>

            {/* Claim History */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Claim History</h2>
              <div className="space-y-3">
                {claimHistory.map((claim) => (
                  <div 
                    key={claim.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div>
                      <p className="font-medium">{claim.reason}</p>
                      <p className="text-sm text-muted-foreground">{claim.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">${claim.amount}</p>
                      <Badge variant="outline" className="text-xs border-primary text-primary">
                        {claim.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - Farm Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Farm Details</h2>
              <div className="space-y-4">
                <DetailRow label="Wallet" value={farmerData.wallet} />
                <DetailRow label="Location" value={farmerData.location} />
                <DetailRow label="Crop Type" value={farmerData.cropType} />
                <DetailRow label="Farm Size" value={`${farmerData.farmSize} hectares`} />
              </div>
              <Button variant="outline" className="w-full mt-4">
                Edit Farm Details
              </Button>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2 text-primary">Coverage Active</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your farm is protected until next renewal date
              </p>
              <Button variant="default" className="w-full">
                Renew Coverage
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, subtext, icon }: any) => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-xs text-muted-foreground">{subtext}</div>
  </Card>
);

const WeatherCard = ({ icon, label, value, progress, threshold, thresholdLabel }: any) => (
  <div className="p-4 bg-secondary/30 rounded-lg border border-border">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <div className="text-2xl font-bold mb-2">{value}</div>
    <Progress value={progress} className="mb-2" />
    <p className="text-xs text-muted-foreground">{thresholdLabel}</p>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

export default Dashboard;
