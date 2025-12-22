'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Linkedin, FileText, Github, Globe } from 'lucide-react';
import { resumeData } from '@/lib/resume-data';
import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { useRouter } from 'next/navigation';

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-card">
      <TopBar onHomeClick={() => router.push('/')} />
      <div className="pt-14 pb-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Contact</h1>
            <p className="text-muted-foreground">Get in touch with me</p>
          </div>
          
          <div className="flex flex-col gap-6 items-center">
            {/* Email Card */}
            <Card className="w-full max-w-3xl rounded-2xl border-2 border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[16px]">
                  <div className="p-1.5 bg-primary/20 rounded-full">
                    <Mail className="h-4 w-4" />
                  </div>
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <a 
                  href={`mailto:${resumeData.email}`}
                  className="flex w-full items-center gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 border border-border/20"
                >
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium">{resumeData.email}</span>
                    <span className="text-[13px] text-muted-foreground">Send me an email</span>
                  </div>
                </a>
              </CardContent>
            </Card>

            {/* Links Card */}
            <Card className="w-full max-w-3xl rounded-2xl border-2 border-border/70 bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[16px]">
                  <div className="p-1.5 bg-primary/20 rounded-full">
                    <Globe className="h-4 w-4" />
                  </div>
                  Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="https://www.linkedin.com/in/devadhathan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[180px] max-w-[220px] flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 border border-border/20"
                  >
                    <Linkedin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-medium">LinkedIn</span>
                      <span className="text-[13px] text-muted-foreground">Connect with me</span>
                    </div>
                  </a>
                  <a
                    href="#"
                    className="flex-1 min-w-[180px] max-w-[220px] flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 border border-border/20"
                  >
                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-medium">Resume</span>
                      <span className="text-[13px] text-muted-foreground">Download PDF</span>
                    </div>
                  </a>
                  <a
                    href="https://github.com/devadhathan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[180px] max-w-[220px] flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 hover:scale-[1.02] transition-all duration-200 border border-border/20"
                  >
                    <Github className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-medium">GitHub</span>
                      <span className="text-[13px] text-muted-foreground">View my work</span>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
