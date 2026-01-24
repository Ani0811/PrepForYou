import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import LandingNav from '@/components/LandingNav';
import { Brain, BookOpen, Target, Sparkles, ArrowRight, CheckCircle, Zap, Users } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Generate personalized study plans and practice questions tailored to your needs'
    },
    {
      icon: BookOpen,
      title: 'Smart Note Building',
      description: 'Create, organize, and review notes with intelligent suggestions'
    },
    {
      icon: Target,
      title: 'Practice Tests',
      description: 'Master concepts with adaptive practice questions and instant feedback'
    },
    {
      icon: Sparkles,
      title: 'Progress Tracking',
      description: 'Visualize your learning journey with detailed analytics and insights'
    }
  ];

  const stats = [
    { label: 'Active Learners', value: '10K+' },
    { label: 'Questions Generated', value: '50K+' },
    { label: 'Study Hours Saved', value: '100K+' },
    { label: 'Success Rate', value: '95%' }
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-foreground overflow-hidden">
      <LandingNav />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 lg:px-24 pt-16">
        {/* Hero Glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-40"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.2) 0%, transparent 70%)'
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-block mb-6">
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium tracking-wide">
              ✨ Your AI Study Companion
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Master Any Subject
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Prepare with Confidence
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            PrepForYou combines AI-powered study tools, practice questions, and smart note-taking to help you ace interviews, exams, and learning goals.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              data-testid="get-started-btn"
              size="lg"
              className="h-14 px-8 text-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-transform duration-200 rounded-full"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              data-testid="login-btn"
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg border-primary/20 hover:bg-primary/10 hover:scale-105 transition-transform duration-200 rounded-full"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to accelerate your learning and boost your confidence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  data-testid={`feature-card-${index}`}
                  className="p-8 bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 h-full"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-transparent to-primary/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Start Learning in Minutes
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Sign Up Free', desc: 'Create your account in seconds' },
              { step: '02', title: 'Set Your Goals', desc: 'Tell us what you want to master' },
              { step: '03', title: 'Start Learning', desc: 'Access AI-powered study tools instantly' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-primary/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 md:px-12 lg:px-24 relative">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 70%)'
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join thousands of learners who are already preparing smarter, not harder.
          </p>
          <Button
            data-testid="cta-get-started-btn"
            size="lg"
            className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 hover:scale-105 transition-transform duration-200 rounded-full"
            onClick={() => navigate('/signup')}
          >
            Start Learning Now
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 PrepForYou. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
