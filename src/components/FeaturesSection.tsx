import { Activity, Shield, Layers, Lock, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSlideUpOnVisible } from "@/hooks/useSlideUpOnVisible";

const FeaturesSection = () => {
  const features = [
    {
      icon: Activity,
      title: "Real-time Structural Health Monitoring",
      description: "Continuous monitoring of structural parameters including vibration, strain, tilt, and temperature with sub-second response times.",
      benefits: ["24/7 monitoring", "Multi-parameter sensing", "Instant alerts"],
      color: "primary"
    },
    {
      icon: TrendingUp,
      title: "Predictive Failure Analytics",
      description: "Advanced AI algorithms analyze historical and real-time data to predict potential failures 12 hours in advance.",
      benefits: ["Early warning system", "Failure prediction", "Maintenance optimization"],
      color: "status-healthy"
    },
    {
      icon: Layers,
      title: "Multi-sensor Data Fusion",
      description: "Intelligent fusion of data from multiple sensor types provides comprehensive structural health assessment.",
      benefits: ["Holistic monitoring", "Data correlation", "Enhanced accuracy"],
      color: "status-warning"
    },
    {
      icon: Lock,
      title: "Government-grade Security",
      description: "Enterprise-level security with end-to-end encryption, secure protocols, and compliance with government standards.",
      benefits: ["End-to-end encryption", "Secure protocols", "Compliance ready"],
      color: "status-critical"
    },
    {
      icon: Zap,
      title: "Low-power, Offline Operation",
      description: "Energy-efficient design with local processing capabilities ensures continuous operation even without network connectivity.",
      benefits: ["10+ year battery life", "Offline processing", "Edge computing"],
      color: "primary"
    },
    {
      icon: Shield,
      title: "Disaster Prevention Focus",
      description: "Proactive approach to infrastructure safety with automated alerts and emergency response integration.",
      benefits: ["Proactive alerts", "Emergency integration", "Life safety priority"],
      color: "status-healthy"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary": return "bg-primary/20 text-primary";
      case "status-healthy": return "bg-status-healthy/20 text-status-healthy";
      case "status-warning": return "bg-status-warning/20 text-status-warning";
      case "status-critical": return "bg-status-critical/20 text-status-critical";
      default: return "bg-primary/20 text-primary";
    }
  };
  const { ref, visible } = useSlideUpOnVisible();

  return (
    <section id="features" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
            <h2
            ref={ref}
            className={`text-3xl md:text-4xl font-bold mb-6 text-foreground transition-all duration-500 ${
              visible
              ? "opacity-100 translate-y-0"
              : "opacity-40 translate-y-8"
            }`}
            >
            Key Features
            </h2>
          <p className="text-lg text-muted-foreground">
            Comprehensive infrastructure monitoring solution designed for reliability, 
            accuracy, and real-world deployment challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-gradient border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group h-full"
            >
              <CardContent className="p-6">
                <div className={`flex items-center justify-center w-14 h-14 rounded-lg mb-4 group-hover:scale-110 transition-transform ${getColorClasses(feature.color)}`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center text-xs text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Technical Specifications</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                Sampling rates up to 1kHz for dynamic measurements
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                Operating temperature range: -40°C to +85°C
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                Wireless range up to 10km with LoRaWAN
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3" />
                IP67 weatherproof rating
              </li>
            </ul>
          </div>

          <div className="bg-card/50 rounded-lg p-6 border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Deployment Benefits</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-status-healthy rounded-full mr-3" />
                50% reduction in maintenance costs
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-status-healthy rounded-full mr-3" />
                90% uptime with redundant systems
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-status-healthy rounded-full mr-3" />
                ROI achieved within 18 months
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-status-healthy rounded-full mr-3" />
                Scalable from single assets to city-wide networks
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;