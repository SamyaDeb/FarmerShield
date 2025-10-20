import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, MapPin, Sprout, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [formData, setFormData] = useState({
    cropType: "",
    location: "",
    farmSize: "",
  });

  const handleWalletConnect = () => {
    // Mock wallet connection
    const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
    setWalletAddress(mockAddress);
    setIsConnected(true);
    toast.success("Wallet connected successfully!");
  };

  const handleRegister = () => {
    if (!formData.cropType || !formData.location || !formData.farmSize) {
      toast.error("Please fill all fields");
      return;
    }
    
    toast.success("Registration successful! Redirecting to dashboard...");
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Register Your Farm</h1>
          <p className="text-muted-foreground">
            Connect your wallet and provide farm details to get started
          </p>
        </div>

        {/* Wallet Connection Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Wallet Connection</h3>
                {isConnected ? (
                  <p className="text-sm text-muted-foreground font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not connected</p>
                )}
              </div>
            </div>
            <Button 
              onClick={handleWalletConnect}
              disabled={isConnected}
              variant={isConnected ? "secondary" : "default"}
            >
              {isConnected ? "Connected" : "Connect Wallet"}
            </Button>
          </div>
        </Card>

        {/* Registration Form */}
        <Card className="p-8">
          <form className="space-y-6">
            {/* Crop Type */}
            <div className="space-y-2">
              <Label htmlFor="cropType" className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-primary" />
                Crop Type
              </Label>
              <Select 
                value={formData.cropType}
                onValueChange={(value) => setFormData({...formData, cropType: value})}
              >
                <SelectTrigger id="cropType">
                  <SelectValue placeholder="Select your primary crop" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rice">Rice</SelectItem>
                  <SelectItem value="wheat">Wheat</SelectItem>
                  <SelectItem value="corn">Corn (Maize)</SelectItem>
                  <SelectItem value="sorghum">Sorghum</SelectItem>
                  <SelectItem value="millet">Millet</SelectItem>
                  <SelectItem value="cassava">Cassava</SelectItem>
                  <SelectItem value="cotton">Cotton</SelectItem>
                  <SelectItem value="coffee">Coffee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Farm Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., Nakuru County, Kenya"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Enter your region or GPS coordinates
              </p>
            </div>

            {/* Farm Size */}
            <div className="space-y-2">
              <Label htmlFor="farmSize" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Farm Size (Hectares)
              </Label>
              <Input
                id="farmSize"
                type="number"
                placeholder="e.g., 5"
                value={formData.farmSize}
                onChange={(e) => setFormData({...formData, farmSize: e.target.value})}
              />
            </div>

            {/* Premium Estimate */}
            {formData.farmSize && (
              <div className="bg-secondary/50 border border-border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Premium</span>
                  <span className="text-2xl font-bold text-primary">
                    {(parseFloat(formData.farmSize) * 12).toFixed(2)} cUSD
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Per growing season • Automatic renewal available
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="button"
              onClick={handleRegister}
              disabled={!isConnected}
              className="w-full"
              size="lg"
            >
              Complete Registration
            </Button>

            {!isConnected && (
              <p className="text-sm text-center text-muted-foreground">
                Please connect your wallet to continue
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
