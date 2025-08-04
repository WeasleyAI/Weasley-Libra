import { RecoilRoot } from 'recoil';
import { DndProvider } from 'react-dnd';
import { RouterProvider } from 'react-router-dom';
import * as RadixToast from '@radix-ui/react-toast';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toast, ThemeProvider, ToastProvider } from '@librechat/client';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { ScreenshotProvider, useApiErrorBoundary } from './hooks';
import { getThemeFromEnv } from './utils/getThemeFromEnv';
import { LiveAnnouncer } from '~/a11y';
import { router } from './routes';
import { useEffect } from 'react';
// Removed ThemeDebug import - using direct logging instead

const App = () => {
  const { setError } = useApiErrorBoundary();

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error?.response?.status === 401) {
          setError(error);
        }
      },
    }),
  });

  // Load theme from environment variables if available
  const envTheme = getThemeFromEnv();

  // Direct logging for theme debugging - runs on component mount
  useEffect(() => {
    console.log('🎨 App Component - Theme Debugging (on mount):');
    console.log('Theme from env:', envTheme);
    console.log('localStorage color-theme:', localStorage.getItem('color-theme'));
    console.log('localStorage theme-colors:', localStorage.getItem('theme-colors'));
    console.log('localStorage theme-name:', localStorage.getItem('theme-name'));
    
    // Log computed CSS variables
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    console.log('CSS Variables:');
    console.log('--primary:', computedStyle.getPropertyValue('--primary'));
    console.log('--secondary:', computedStyle.getPropertyValue('--secondary'));
    console.log('--accent:', computedStyle.getPropertyValue('--accent'));
    console.log('--background:', computedStyle.getPropertyValue('--background'));
    console.log('--foreground:', computedStyle.getPropertyValue('--foreground'));
  }, []); // Empty dependency array = runs only on mount

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <LiveAnnouncer>
          <ThemeProvider
            // Only pass initialTheme and themeRGB if environment theme exists
            // This allows localStorage values to persist when no env theme is set
            {...(envTheme && { initialTheme: 'system', themeRGB: envTheme })}
          >
            {/* The ThemeProvider will automatically:
                1. Apply dark/light mode classes
                2. Apply custom theme colors if envTheme is provided
                3. Otherwise use stored theme preferences from localStorage
                4. Fall back to default theme colors if nothing is stored */}
            <RadixToast.Provider>
              <ToastProvider>
                <DndProvider backend={HTML5Backend}>
                  <RouterProvider router={router} />
                  <ReactQueryDevtools initialIsOpen={false} position="top-right" />
                  <Toast />
                  <RadixToast.Viewport className="pointer-events-none fixed inset-0 z-[1000] mx-auto my-2 flex max-w-[560px] flex-col items-stretch justify-start md:pb-5" />
                </DndProvider>
              </ToastProvider>
            </RadixToast.Provider>
          </ThemeProvider>
        </LiveAnnouncer>
      </RecoilRoot>
    </QueryClientProvider>
  );
};

export default () => (
  <ScreenshotProvider>
    <App />
    <iframe
      src="/assets/silence.mp3"
      allow="autoplay"
      id="audio"
      title="audio-silence"
      style={{
        display: 'none',
      }}
    />
  </ScreenshotProvider>
);
