import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionStorage } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';
 
const INACTIVITY_TIMEOUT = 20*60* 1000;
 
export function useAutoLogout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
 
  const logout = () => {
    sessionStorage.clear();
    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity',
      variant: 'destructive',
    });
    navigate('/');
  };
 
  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
 
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  };
 
  useEffect(() => {
    // Events to track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
 
    // Reset timer on any user activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });
 
    // Initialize timer
    resetTimer();
 
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, []);
 
  return null;
}
 