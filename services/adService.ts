import {
    AdMob,
    BannerAdOptions,
    BannerAdSize,
    BannerAdPosition,
    AdMobBannerSize
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export class AdService {
    private static instance: AdService;
    private initialized = false;

    private constructor() { }

    public static getInstance(): AdService {
        if (!AdService.instance) {
            AdService.instance = new AdService();
        }
        return AdService.instance;
    }

    public async initialize(): Promise<void> {
        if (this.initialized || !Capacitor.isNativePlatform()) return;

        try {
            await AdMob.initialize({
                testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Optional: Add your test device ID
                initializeForTesting: true,
            });
            this.initialized = true;
            console.log('AdMob initialized');
        } catch (e) {
            console.error('AdMob initialization failed', e);
        }
    }

    public async showBanner(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;

        const options: BannerAdOptions = {
            adId: 'ca-app-pub-3940256099942544/6300978111', // Test Unit ID
            adSize: BannerAdSize.ADAPTIVE_BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: true,
        };

        try {
            await AdMob.showBanner(options);
        } catch (e) {
            console.error('Failed to show banner', e);
        }
    }

    public async hideBanner(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await AdMob.hideBanner();
        } catch (e) {
            console.error('Failed to hide banner', e);
        }
    }

    public async resumeBanner(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await AdMob.resumeBanner();
        } catch (e) {
            console.error('Failed to resume banner', e);
        }
    }

    public async removeBanner(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await AdMob.removeBanner();
        } catch (e) {
            console.error('Failed to remove banner', e);
        }
    }
}

export const adService = AdService.getInstance();
