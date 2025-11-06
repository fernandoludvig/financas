'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'
import UserMenu from './user-menu'

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contas', label: 'Contas' },
    { href: '/relatorios', label: 'Relatórios' },
    { href: '/configuracoes', label: 'Configurações' },
  ]

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Wallet className="h-6 w-6" />
              <span className="text-xl font-bold">Ludvig Finanças</span>
            </Link>
            <div className="hidden md:flex gap-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? 'default' : 'ghost'}
                    className="h-9"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          <UserMenu />
        </div>
      </div>
    </nav>
  )
}

