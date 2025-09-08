import { Card, CardContent } from "@/components/ui/card";
import { LinkedinIcon, Mail } from "lucide-react";
import { useSlideUpOnVisible } from "@/hooks/useSlideUpOnVisible";

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Anuj Gope",
      role: "Web and App developer",
      expertise: "full stack developer, AI enthusiast",
      bio: "Passionate about leveraging technology to create impactful solutions for disaster management.",
      image: "/myprofile.jpg"
    },
    {
      name: "Kunwar Singh",
      role: "Head of IoT Systems and CAD Design",
      expertise: "IoT Architecture,Electronics and CAD Designing",
      bio: "Expert in designing large-scale IoT deployments for critical infrastructure monitoring.",
      image: "/kunwar.jpg"
    },
    {
      name: "Kushagra Srivastava",
      role: "ML and Firmware developer",
      expertise: "Machine learning, IoT & Embedded systems, Edge computing",
      bio: "Specializes in developing predictive models for infrastructure failure detection.",
      image: "/kushagra.jpg"
    },
    {
      name: "Dr. Meera Nair",
      role: "Director of Government Relations",
      expertise: "Policy, Disaster Management",
      bio: "Former NDMA official with deep expertise in disaster management protocols and government systems.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Vikash Singh",
      role: "Hardware Engineering Lead",
      expertise: "Sensor Design, Embedded Systems",
      bio: "Designs ruggedized sensor systems capable of operating in harsh environmental conditions.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face"
    },
    {
      name: "Anita Reddy",
      role: "Product Manager",
      expertise: "Product Strategy, User Experience",
      bio: "Leads product development with focus on user-centric design and government stakeholder needs.",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face"
    }
  ];

  return (
    <section id="team" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Our Expert Team
          </h2>
          <p className="text-lg text-muted-foreground">
            A multidisciplinary team of experts in AI, IoT, structural engineering, and disaster management, 
            united by the mission to make infrastructure safer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => {
            const { ref, visible } = useSlideUpOnVisible();
            return (
            <Card 
              key={index} 
              ref={ref}
              className={`card-gradient border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group ${visible  ? "animate-slide-up" : "opacity-0"}`}
              style={{ transitionDelay: `${index * 0.1}s`, transition: "opacity 0.6s, transform 0.6s" }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  {/* Profile Image */}
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Member Info */}
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  
                  <p className="text-sm font-medium text-primary mb-2">
                    {member.role}
                  </p>

                  {/* <p className="text-xs text-status-warning mb-3 font-medium">
                    {member.expertise}
                  </p> */}

                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex space-x-3">
                    <div className="p-2 bg-muted/20 rounded-full hover:bg-primary/20 transition-colors cursor-pointer">
                      <LinkedinIcon className="h-4 w-4 text-muted-foreground hover:text-primary" href="https://www.linkedin.com/in/kunwar-singh-190b08328/"/>
                    </div>
                    <div className="p-2 bg-muted/20 rounded-full hover:bg-primary/20 transition-colors cursor-pointer">
                      <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" href="https://mail.google.com/mail/u/0/#inbox?compose=CllgCHrkVwTpjNzCdLkgwpptMfxkNMTfZldQvVMGjZwhFfDZQXZqDHktlHWZpLcwTCdGfXPQtFg"/>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })};
        </div>

        {/* Team Stats
        <div className="mt-16 bg-card/50 rounded-lg p-8 border border-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-2">50+</div>
              <p className="text-sm text-muted-foreground">Years Combined Experience</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-status-healthy mb-2">15+</div>
              <p className="text-sm text-muted-foreground">Research Publications</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-status-warning mb-2">8+</div>
              <p className="text-sm text-muted-foreground">Patents Filed</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-status-critical mb-2">100%</div>
              <p className="text-sm text-muted-foreground">Committed to Safety</p>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default TeamSection;