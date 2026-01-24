import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Clock, User, Share2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';

export default function BlogPost() {
  const navigate = useNavigate();
  const { id } = useParams();

  const post = {
    title: 'Mastering React Hooks: A Comprehensive Guide',
    author: 'Sarah Johnson',
    date: 'January 15, 2025',
    readTime: '12 min read',
    category: 'React',
    content: `
      <h2>Introduction</h2>
      <p>React Hooks have revolutionized the way we write React components. Introduced in React 16.8, hooks allow you to use state and other React features without writing a class.</p>
      
      <h2>Why Hooks?</h2>
      <p>Before hooks, managing state in functional components was impossible. You had to convert your component to a class, which often led to verbose code and confusion about the 'this' keyword.</p>
      
      <h3>Key Benefits:</h3>
      <ul>
        <li><strong>Simpler Code:</strong> Functional components are easier to read and test</li>
        <li><strong>Reusable Logic:</strong> Custom hooks allow you to extract and share stateful logic</li>
        <li><strong>Better Performance:</strong> Hooks optimize re-renders more effectively</li>
      </ul>
      
      <h2>useState Hook</h2>
      <p>The most basic hook for managing state in functional components:</p>
      <pre><code>const [count, setCount] = useState(0);</code></pre>
      
      <h2>useEffect Hook</h2>
      <p>useEffect lets you perform side effects in function components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.</p>
      
      <h2>Custom Hooks</h2>
      <p>One of the most powerful features is the ability to create your own hooks. This allows you to extract component logic into reusable functions.</p>
      
      <h2>Best Practices</h2>
      <ul>
        <li>Only call hooks at the top level</li>
        <li>Only call hooks from React functions</li>
        <li>Use the ESLint plugin for hooks</li>
        <li>Keep your effects focused on single responsibilities</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>React Hooks have become an essential part of modern React development. By understanding and mastering them, you'll write cleaner, more maintainable code.</p>
    `
  };

  const relatedPosts = [
    { id: 2, title: 'Advanced React Patterns', category: 'React' },
    { id: 3, title: 'State Management with Context', category: 'React' },
    { id: 4, title: 'Performance Optimization Tips', category: 'React' }
  ];

  const handleShare = () => {
    toast.success('Link copied to clipboard!');
  };

  const handleBookmark = () => {
    toast.success('Article bookmarked!');
  };

  return (
    <div className="min-h-screen bg-[#030712]">
      <Header />
      <main className="px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Back Button */}
          <Button
            data-testid="back-to-blog-btn"
            variant="ghost"
            className="mb-8 hover:bg-primary/10"
            onClick={() => navigate('/blog')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>

          {/* Article Header */}
          <article>
            <Badge className="mb-4 bg-primary">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {post.title}
            </h1>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
                <span>{post.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  data-testid="share-btn"
                  variant="outline" 
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  data-testid="bookmark-btn"
                  variant="outline" 
                  size="icon"
                  onClick={handleBookmark}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator className="mb-12" />

            {/* Article Content */}
            <Card className="p-8 md:p-12 bg-card border-border mb-12">
              <div 
                data-testid="article-content"
                className="prose prose-invert prose-lg max-w-none"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  lineHeight: '1.8'
                }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </Card>

            {/* Related Posts */}
            <Card className="p-8 bg-card border-border">
              <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Related Articles
              </h2>
              <div className="space-y-4">
                {relatedPosts.map((related) => (
                  <div
                    key={related.id}
                    data-testid={`related-post-${related.id}`}
                    className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/blog/${related.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">{related.category}</Badge>
                        <h3 className="font-semibold">{related.title}</h3>
                      </div>
                      <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </article>
        </motion.div>
      </main>
    </div>
  );
}
