export default function manifest() {
  return {
    name: 'J.A.R.V.I.S. // Mark I',
    short_name: 'J.A.R.V.I.S.',
    description:
      'Just A Rather Very Intelligent System: a voice-first desktop assistant with a holographic display',
    start_url: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#000814',
    theme_color: '#000814',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

