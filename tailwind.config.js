/** Tokens mirror the Wedding Quest design system. */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wood: { 900: '#243a31', 800: '#344d40', 700: '#526b55', 600: '#647c68', 400: '#cbd3c5' },
        parchment: { 100: '#fffef9', 200: '#f8f6ef', 300: '#eef1e7', 400: '#e3e8dc' },
        ink: { 900: '#344d40', 600: '#566557', muted: '#617260', onwood: '#f8f6ef' },
        gold: { 300: '#ece1c8', 400: '#e0d4b9', 500: '#b6a586', 700: '#8d7957', 900: '#6b5c43' },
        emerald: { 500: '#2d4a3e', 300: '#4f7a66', 100: '#ddeae2' },
        maroon: { 900: '#240508' },
        wax: { 500: '#61775b', 400: '#819779' },
        rose: { 100: '#f7e0e4', 700: '#9f1239' },
        sky: { 400: '#7ec8e3' },
      },
      fontFamily: {
        pixel: ['"Plus Jakarta Sans"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', '"PingFang SC"', '"Microsoft YaHei"', 'system-ui', '-apple-system', 'sans-serif'],
        arabic: ['Amiri', '"Scheherazade New"', '"Geeza Pro"', 'serif'],
      },
      borderRadius: { sm: '4px', md: '8px', lg: '14px', xl: '22px' },
      boxShadow: {
        raised: '0 4px 0 0 #526b55',
        'raised-gold': '0 4px 0 0 #6b5c43',
        pressed: 'inset 0 3px 0 0 #526b55',
        card: '0 2px 0 0 #e3e8dc',
        modal: '0 18px 44px #243a3180',
        focus: '0 0 0 3px #e0d4b9',
      },
      maxWidth: { stage: '480px' },
      minHeight: { tap: '44px' },
    },
  },
  plugins: [],
};
