import { AlertTriangle, Building, Clock, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSlideUpOnVisible } from "@/hooks/useSlideUpOnVisible";

const ProblemSection = () => {
  const { ref, visible } = useSlideUpOnVisible();
  const problems = [
    {
      icon: Building,
      title: "Aging Infrastructure",
      description: "Critical bridges, buildings, and infrastructure are aging beyond their design life, creating hidden risks.",
      stat: "73% of bridges need major repairs"
    },
    {
      icon: AlertTriangle,
      title: "Lack of Real-time Monitoring",
      description: "Traditional inspection methods are infrequent, subjective, and often miss critical structural changes.",
      stat: "Inspections happen only every 2 years"
    },
    {
      icon: Clock,
      title: "Reactive Maintenance",
      description: "Current systems only respond after failures occur, leading to catastrophic consequences and higher costs.",
      stat: "90% higher emergency repair costs"
    },
    {
      icon: TrendingDown,
      title: "Preventable Disasters",
      description: "Many structural failures could be prevented with early warning systems and predictive maintenance.",
      stat: "60% of failures are preventable"
    }
  ];

  return (
    <section id="problem" className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            The Infrastructure Crisis
          </h2>
          <p className="text-lg text-muted-foreground">
            Our aging infrastructure faces critical challenges that put lives and resources at risk. 
            Traditional monitoring methods are no longer sufficient for modern safety standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <Card 
              key={index} 
              className="card-gradient border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-status-critical/20 rounded-lg mb-4 group-hover:bg-status-critical/30 transition-colors">
                  <problem.icon className="h-6 w-6 text-status-critical" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">
                  {problem.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {problem.description}
                </p>
                <div className="text-xs font-bold text-status-critical bg-status-critical/10 rounded-full px-3 py-1 inline-block">
                  {problem.stat}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Impact Statistics */}
        <div className="mt-16 bg-card/50 rounded-lg p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-status-critical mb-2">$2.6T</div>
              <p className="text-muted-foreground">Annual infrastructure investment gap</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-status-warning mb-2">9.1%</div>
              <p className="text-muted-foreground">Of bridges are structurally deficient</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-status-critical mb-2">43</div>
              <p className="text-muted-foreground">People die daily from infrastructure failures</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;