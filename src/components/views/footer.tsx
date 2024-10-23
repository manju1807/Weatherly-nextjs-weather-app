import React from 'react';
import { Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-background border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>
            Made with{' '}
            <span className="text-red-500 animate-pulse inline-block" aria-label="love">
              ❤️
            </span>{' '}
            by{' '}
            <a
              href="https://github.com/manju1807"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Manjunath R
            </a>{' '}
            © {new Date().getFullYear()}
          </span>
          <a
            href="https://github.com/manju1807/Advanced-weather-app-nextjs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-primary/10 text-primary hover:text-primary/80 transition-colors"
            title="View source code on GitHub"
          >
            <Github className="h-4 w-4" />
            <span>Source</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
