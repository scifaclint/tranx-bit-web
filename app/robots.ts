import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/home', '/auth', '/buy-giftcards', '/sell-giftcards', '/about', '/privacy-policy', '/terms-of-service'],
            disallow: [
                '/dashboard/',
                '/orders/',
                '/transactions/',
                '/profile/',
                '/settings/',
                '/payment/',
                '/internal-portal-Trx13/',
                '/api/',
            ],
        },
        sitemap: 'https://tranxbit.com/sitemap.xml',
    }
}
