import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, User, ArrowRight, TrendingUp } from 'lucide-react';

export default function Blog() {
  const navigate = useNavigate();

  const featuredPost = {
    id: 1,
    title: 'Mastering React Hooks: A Comprehensive Guide',
    excerpt: 'Learn how to use React Hooks effectively to build better applications. From useState to custom hooks, we cover everything you need to know.',
    author: 'Sarah Johnson',
    date: '3 days ago',
    readTime: '12 min read',
    category: 'React',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee'
  };

  const blogPosts = [
    {
      id: 2,
      title: 'Top 10 JavaScript Interview Questions in 2025',
      excerpt: 'Prepare for your next interview with these commonly asked JavaScript questions and expert answers.',
      author: 'Mike Chen',
      date: '1 week ago',
      readTime: '8 min read',
      category: 'JavaScript'
    },
    {
      id: 3,
      title: 'System Design Interview Tips',
      excerpt: 'Essential strategies and patterns for acing your system design interviews.',
      author: 'Emily Rodriguez',
      date: '2 weeks ago',
      readTime: '15 min read',
      category: 'System Design'
    },
    {
      id: 4,
      title: 'Data Structures Every Developer Should Know',
      excerpt: 'A deep dive into fundamental data structures and when to use them.',
      author: 'James Wilson',
      date: '3 weeks ago',
      readTime: '10 min read',
      category: 'Data Structures'
    },
    {
      id: 5,
      title: 'Building Scalable APIs with Node.js',
      excerpt: 'Best practices for creating robust and scalable backend services.',
      author: 'Lisa Kumar',
      date: '1 month ago',
      readTime: '12 min read',
      category: 'Backend'
    },
    {
      id: 6,
      title: 'CSS Grid vs Flexbox: When to Use Each',
      excerpt: 'Understanding the differences and use cases for CSS Grid and Flexbox.',
      author: 'Tom Anderson',
      date: '1 month ago',
      readTime: '7 min read',
      category: 'CSS'
    }
  ];

  const categories = ['All', 'JavaScript', 'React', 'System Design', 'Data Structures', 'Backend', 'CSS'];

  return (
    <div className="min-h-screen bg-[#030712]">
      <Header />
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Learning Blog
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Expert tips, tutorials, and insights to accelerate your learning
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                data-testid="blog-search-input"
                type="text"
                placeholder="Search articles..."
                className="pl-10 h-12 bg-secondary/50 border-transparent focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-12">
            {categories.map((category, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-4 py-2 cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors whitespace-nowrap"
              >
                {category}
              </Badge>
            ))}
          </div>

          {/* Featured Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card 
              data-testid="featured-post"
              className="overflow-hidden bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate(`/blog/${featuredPost.id}`)}
            >
              <div className="md:flex">
                <div className="md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Badge className="mb-4 bg-primary">{featuredPost.category}</Badge>
                    <TrendingUp className="h-16 w-16 text-primary mx-auto" />
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <Badge className="mb-4">Featured</Badge>
                  <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredPost.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  data-testid={`blog-post-${post.id}`}
                  className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <Badge variant="outline" className="mb-4 w-fit">{post.category}</Badge>
                  <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
