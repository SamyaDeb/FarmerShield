import { Button } from "@/components/ui/button";
import { Shield, Droplets, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-farmer.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-background z-0" />
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6 border border-primary/20">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Powered by Celo Blockchain</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              WeatherShield
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Parametric crop insurance that pays automatically when weather conditions threaten your harvest.
              No claims. No waiting. Just protection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={() => navigate('/register')}
                className="text-lg"
              >
                Get Protected Now
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="text-lg"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How WeatherShield Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Register Your Farm"
              description="Connect your wallet, add your location and crop type. Get instant premium quotes."
            />
            <FeatureCard
              icon={<Droplets className="w-8 h-8" />}
              title="Automated Monitoring"
              description="RedStone oracles track rainfall, temperature, and drought conditions 24/7."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Instant Payouts"
              description="When thresholds are met, smart contracts send cUSD directly to your wallet."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StatCard number="1000+" label="Farmers Protected" />
            <StatCard number="$250K" label="Total Coverage" />
            <StatCard number="98%" label="Payout Accuracy" />
            <StatCard number="< 1hr" label="Claim Time" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Protect Your Harvest?
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of farmers using blockchain-powered insurance
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => navigate('/register')}
            className="text-lg"
          >
            Start Registration
          </Button>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow duration-300">
    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const StatCard = ({ number, label }: { number: string; label: string }) => (
  <div className="text-center">
    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{number}</div>
    <div className="text-muted-foreground">{label}</div>
  </div>
);

export default Landing;
