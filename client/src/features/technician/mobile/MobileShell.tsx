/**
 * MobileShell — the PWA entrypoint for technicians.
 *
 * Rendered at /tech/mobile. Replaces the desktop layout entirely with a
 * phone-native feel: full-height stack, no sidebar, hardware-back-friendly
 * navigation.
 *
 * Screens:
 *  list   → MobileTicketList (all assigned tickets)
 *  detail → MobileTicketDetail (single ticket + actions)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Ticket } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUser } from '@/lib/api/auth';
import { MobileTicketList } from './MobileTicketList';
import { MobileTicketDetail } from './MobileTicketDetail';
import { PushSubscriptionManager } from './PushSubscriptionManager';
import { OfflineQueue } from './OfflineQueue';
import type { Ticket as TicketType } from '@/types';

type Screen = 'list' | 'detail';

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return isOnline;
}

export function MobileShell() {
  const [screen, setScreen] = useState<Screen>('list');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const isOnline = useOnlineStatus();
  const clearUser = useAuthStore(s => s.clearUser);
  const storeUser = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const user = storeUser ?? (getCurrentUser() as unknown as typeof storeUser);
  const displayName = user
    ? (user.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user.username)
    : 'Technician';

  const handleSelectTicket = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setScreen('detail');
  };

  const handleBack = () => {
    setScreen('list');
    setSelectedTicket(null);
  };

  const handleLogout = () => {
    clearUser();
    navigate('/auth', { replace: true });
  };

  return (
    // Safe-area insets for notched phones
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Top nav — only on list screen */}
      {screen === 'list' && (
        <header className="bg-white border-b border-border px-4 py-3 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-foreground">My Tickets</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{displayName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PushSubscriptionManager />
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground active:bg-gray-100"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </button>
          </div>
        </header>
      )}

      {/* Screen content */}
      <div className="flex-1 overflow-hidden">
        {screen === 'list' && (
          <MobileTicketList onSelect={handleSelectTicket} isOnline={isOnline} />
        )}
        {screen === 'detail' && selectedTicket && (
          <MobileTicketDetail ticket={selectedTicket} onBack={handleBack} isOnline={isOnline} />
        )}
      </div>

      {/* Offline queue processes pending mutations when back online */}
      <OfflineQueue isOnline={isOnline} />
    </div>
  );
}
