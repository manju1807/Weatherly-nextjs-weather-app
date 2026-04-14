import React, { memo } from 'react';
import { Github } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AppLanguage, t } from '@/lib/language/i18n';

interface FooterProps {
  className?: string;
  authorName?: string;
  githubUsername?: string;
  repoUrl?: string;
  language: AppLanguage;
}

const Footer = memo(
  ({
    className = '',
    authorName = 'Manjunath R',
    githubUsername = 'manju1807',
    repoUrl = 'Advanced-weather-app-nextjs',
    language,
  }: FooterProps) => {
    const currentYear = new Date().getFullYear();
    const githubProfileUrl = `https://github.com/${githubUsername}`;
    const githubRepoUrl = `${githubProfileUrl}/${repoUrl}`;

    return (
      <footer
        className={`w-full bg-background border-t border-border/40 mt-auto ${className}`}
        role="contentinfo"
        aria-label="Site footer"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span>{t(language, 'madeWith')}</span>
              <span
                className="text-red-500 inline-flex items-center"
                role="img"
                aria-label="love"
              >
                <span className="animate-pulse">♥</span>
              </span>
              <span>{t(language, 'by')}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={githubProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                    aria-label={`Visit ${authorName}'s GitHub profile`}
                  >
                    {authorName}
                  </a>
                </TooltipTrigger>
                <TooltipContent>{t(language, 'visitGithubProfile')}</TooltipContent>
              </Tooltip>
              <span className="mx-1">(c)</span>
              <span>{currentYear}</span>
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1 rounded-md hover:bg-primary/10 text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  aria-label={t(language, 'viewSourceCode')}
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  <span>{t(language, 'source')}</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>{t(language, 'viewSourceCode')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </footer>
    );
  },
);

Footer.displayName = 'Footer';

export default Footer;
