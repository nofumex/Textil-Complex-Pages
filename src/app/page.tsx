"use client";
import React, { useEffect, useState } from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { TrustSection } from '@/components/home/trust-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { ServicesSection } from '@/components/home/services-section';
import { ContactSection } from '@/components/home/contact-section';
import { LeadModal } from '@/components/home/lead-modal';

export default function HomePage() {
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadMessage, setLeadMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    const onClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const sampleBtn = target.closest('#cta-sample');
      const consultBtn = target.closest('#cta-consult');
      if (sampleBtn) {
        setLeadMessage('Хочу заказать образец');
        setLeadOpen(true);
      } else if (consultBtn) {
        setLeadMessage('Нужна консультация');
        setLeadOpen(true);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <HeroSection />
        <TrustSection />
        <FeaturedProducts />
        <ServicesSection />
        <ContactSection />
      </main>
      <LeadModal isOpen={leadOpen} onClose={() => setLeadOpen(false)} defaultMessage={leadMessage} />
    </div>
  );
}

