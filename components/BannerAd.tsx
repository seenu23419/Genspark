import React, { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { adService } from '../services/adService';

interface BannerAdProps {
    slot?: string; // For AdSense
    style?: React.CSSProperties;
}

const BannerAd: React.FC<BannerAdProps> = ({ slot, style }) => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (Capacitor.isNativePlatform()) {
            // Mobile AdMob logic
            adService.showBanner();

            return () => {
                adService.hideBanner();
            };
        } else if (import.meta.env.PROD) {
            // Web AdSense logic (only in production typically)
            try {
                // Only push if adsbygoogle is defined (script loaded)
                if ((window as any).adsbygoogle) {
                    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                }
            } catch (e) {
                console.error('AdSense error:', e);
            }
        }

    }, []);

    if (Capacitor.isNativePlatform()) {
        // AdMob overlays the banner, so we don't need a persistent spacer in the DOM flow
        return null;
    }

    // Web AdSense component
    const adClient = import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXX";
    const adSlot = slot || import.meta.env.VITE_ADSENSE_SLOT_ID || "XXXXXXXXXX";

    return (
        <div className="ad-container" style={{ textAlign: 'center', margin: '1rem 0', ...style }}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={adClient}
                data-ad-slot={adSlot}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    );
};


export default BannerAd;
