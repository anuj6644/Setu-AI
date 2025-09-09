import { Brain, Cpu, Database, Monitor, Wifi, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSlideUpOnVisible } from "@/hooks/useSlideUpOnVisible";

const SolutionSection = () => {
  const { ref, visible } = useSlideUpOnVisible();
  const solutionSteps = [
    {
      icon: Wifi,
      title: "IoT Sensor Network",
      description: "Deploy weatherproof sensors that continuously monitor vibration, strain, temperature, and structural movement.",
      features: ["Multi-parameter sensing", "Weather-resistant design", "Long battery life"]
    },
    {
      icon: Cpu,
      title: "Edge AI Processing",
      description: "Real-time data processing at the edge ensures immediate threat detection without relying on cloud connectivity.",
      features: ["Offline operation", "Real-time analysis", "Low latency response"]
    },
    {
      icon: Brain,
      title: "Predictive Analytics",
      description: "Advanced AI algorithms analyze patterns and predict potential failures before they occur.",
      features: ["Machine learning models", "Failure prediction", "Risk assessment"]
    },
    {
      icon: Monitor,
      title: "Monitoring Dashboard",
      description: "Comprehensive dashboard provides real-time insights and alerts for disaster management authorities.",
      features: ["Real-time visualization", "Alert management", "Historical analysis"]
    }
  ];

  return (
    <section id="solution" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Our AI-Powered Solution
          </h2>
          <p className="text-lg text-muted-foreground">
            Setu AI combines cutting-edge IoT sensors, Edge AI processing, and predictive analytics 
            to transform infrastructure monitoring from reactive to proactive.
          </p>
        </div>

        {/* Solution Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {solutionSteps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="card-gradient border-border hover:border-primary/50 transition-all duration-300 h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-lg mb-4 mx-auto">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-center text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {step.description}
                  </p>
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-xs text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Connection Arrow */}
              {index < solutionSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-primary/50" />
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-primary/50 border-t-2 border-b-2 border-t-transparent border-b-transparent" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Technical Architecture */}
        <div className="bg-card/50 rounded-lg p-8 border border-border">
          <h3 className="text-2xl font-bold mb-6 text-center text-foreground">Technical Architecture</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Database className="h-10 w-10 text-primary mx-auto mb-3" />
              <h4 className="font-semibold text-foreground mb-2">Data Collection</h4>
              <p className="text-sm text-muted-foreground">
                Continuous sensor data collection with 90% uptime and millisecond precision
              </p>
            </div>
            <div className="text-center">
              <Zap className="h-10 w-10 text-status-warning mx-auto mb-3" />
              <h4 className="font-semibold text-foreground mb-2">Real-time Processing</h4>
              <p className="text-sm text-muted-foreground">
                Edge computing processes data locally for instant threat detection and response
              </p>
            </div>
            <div className="text-center">
              <Brain className="h-10 w-10 text-status-healthy mx-auto mb-3" />
              <h4 className="font-semibold text-foreground mb-2">AI Prediction</h4>
              <p className="text-sm text-muted-foreground">
                Advanced ML models predict failures 12 hours in advance with high accuracy
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;