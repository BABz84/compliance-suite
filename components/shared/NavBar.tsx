"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User } from 'lucide-react';

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  if (!user) return null;
  
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold text-xl"><span className="text-primary">Gen-AI</span> Compliance</Link>
        </div>
        
        <div className="ml-auto flex items-center space-x-4">
          <nav className="flex items-center space-x-2">
            <Link 
              href="/documents" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/documents' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground/60 hover:text-foreground hover:bg-accent'
              }`}
            >
              Documents
            </Link>
            <Link 
              href="/regulatory-qa" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/regulatory-qa' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground/60 hover:text-foreground hover:bg-accent'
              }`}
            >
              Regulatory Q&A
            </Link>
            <Link 
              href="/contract-review" 
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/contract-review' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-foreground/60 hover:text-foreground hover:bg-accent'
              }`}
            >
              Contract Review
            </Link>
          </nav>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
} 