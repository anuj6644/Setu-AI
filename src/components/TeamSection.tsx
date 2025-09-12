import { Card, CardContent } from "@/components/ui/card";
import { LinkedinIcon, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

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
      role: "IoT Systems and CAD Design",
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
      name: "Rakhi Garhwal",
      role: "Data Engineer and Analyst",
      expertise: "Policy, Disaster Management",
      bio: "Engineering student working on innovative solutions in AI and Machine Learning, with a focus on Data Analysis.",
      image: "/rakhi.jpg"
    },
    {
      name: "Kartik",
      role: "Security Framework Developer",
      expertise: "Sensor Design, Embedded Systems",
      bio: "Passionate about building secure and reliable IoT solutions by integrating encryption, authentication, and threat mitigation into every layer of the system.",
      image: "/kartik.jpg"
    },
    {
      name: "Jyoti Gupta",
      role: "Team Lead",
      expertise: "Product Strategy, User Experience",
      bio: "Focused on creating user-centric designs that enhance the overall experience and usability of technology products.",
      image: "/jyoti.jpg"
    }
  ];

  const containerRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(350);
  const [visibleCards, setVisibleCards] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  // Calculate how many cards can fit based on container width
  useEffect(() => {
    const calculateLayout = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const calculatedCardWidth = Math.min(400, Math.max(300, containerWidth / 4));
        setCardWidth(calculatedCardWidth);
        
        const gap = 24;
        const cardsThatFit = Math.floor(containerWidth / (calculatedCardWidth + gap));
        setVisibleCards(Math.max(1, cardsThatFit));
      }
    };

    calculateLayout();
    window.addEventListener('resize', calculateLayout);
    
    return () => window.removeEventListener('resize', calculateLayout);
  }, []);

  // Duplicate team members for seamless looping
  const duplicatedTeamMembers = [...teamMembers, ...teamMembers];

  return (
    <section id="team" className="py-20 overflow-hidden">
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

        <div 
          ref={containerRef}
          className="relative overflow-visible"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            className="flex"
            animate={{
              x: [0, -cardWidth * teamMembers.length],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20 * (teamMembers.length / visibleCards),
                ease: "linear",
              },
            }}
            style={{ width: `${duplicatedTeamMembers.length * cardWidth}px` }}
          >
            {duplicatedTeamMembers.map((member, index) => (
              <div
                key={index}
                className="flex px-3"
                style={{ width: `${cardWidth}px` }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="card-gradient border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group h-full">
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

                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          {member.bio}
                        </p>

                        {/* Social Links */}
                        <div className="flex space-x-3">
                          <div className="p-2 bg-muted/20 rounded-full hover:bg-primary/20 transition-colors cursor-pointer">
                            <LinkedinIcon className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </div>
                          <div className="p-2 bg-muted/20 rounded-full hover:bg-primary/20 transition-colors cursor-pointer">
                            <Mail className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            ))}
          </motion.div>

          {/* Gradient overlays for a smoother transition
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
        </div>

        {/* Manual navigation buttons 
        <div className="flex justify-center mt-8 space-x-4">
          <button 
            onClick={() => {
              const container = containerRef.current;
              if (container) {
                container.scrollBy({ left: -cardWidth * visibleCards, behavior: 'smooth' });
              }
            }}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Previous team members"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => {
              const container = containerRef.current;
              if (container) {
                container.scrollBy({ left: cardWidth * visibleCards, behavior: 'smooth' });
              }
            }}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            aria-label="Next team members"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>*/}
        </div> 
      </div>
    </section>
  );
};

export default TeamSection;