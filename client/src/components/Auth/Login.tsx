import { useOutletContext, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { OpenIDIcon } from '@librechat/client';
import type { TLoginLayoutContext } from '~/common';
import { ErrorMessage } from '~/components/Auth/ErrorMessage';
import SocialButton from '~/components/Auth/SocialButton';
import { useAuthContext } from '~/hooks/AuthContext';
import { useAutoLogin } from '~/hooks/useAutoLogin';
import { getLoginError } from '~/utils';
import { useLocalize } from '~/hooks';
import LoginForm from './LoginForm';

function Login() {
  const localize = useLocalize();
  const { error, setError, login } = useAuthContext();
  const { startupConfig } = useOutletContext<TLoginLayoutContext>();
  const { autoLogin, isLoading: isAutoLoginLoading } = useAutoLogin();

  const [searchParams, setSearchParams] = useSearchParams();
  // Determine if auto-redirect should be disabled based on the URL parameter
  const disableAutoRedirect = searchParams.get('redirect') === 'false';
  const disableAutoLogin = searchParams.get('autoLogin') === 'false';

  // Persist the disable flag locally so that once detected, auto-redirect stays disabled.
  const [isAutoRedirectDisabled, setIsAutoRedirectDisabled] = useState(disableAutoRedirect);
  const [hasTriggeredAutoLogin, setHasTriggeredAutoLogin] = useState(false);

  // Once the disable flag is detected, update local state and remove the parameter from the URL.
  useEffect(() => {
    if (disableAutoRedirect) {
      setIsAutoRedirectDisabled(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('redirect');
      setSearchParams(newParams, { replace: true });
    }
  }, [disableAutoRedirect, searchParams, setSearchParams]);

  // Determine whether we should auto-redirect to OpenID.
  const shouldAutoRedirect =
    startupConfig?.openidLoginEnabled &&
    startupConfig?.openidAutoRedirect &&
    startupConfig?.serverDomain &&
    !isAutoRedirectDisabled;

  useEffect(() => {
    if (shouldAutoRedirect) {
      console.log('Auto-redirecting to OpenID provider...');
      window.location.href = `${startupConfig.serverDomain}/oauth/openid`;
    }
  }, [shouldAutoRedirect, startupConfig]);

  // Auto-login effect - triggers when component mounts and conditions are met
  useEffect(() => {
    if (
      !disableAutoLogin && 
      !shouldAutoRedirect && 
      !hasTriggeredAutoLogin && 
      !isAutoLoginLoading &&
      startupConfig
    ) {
      console.log('Triggering auto-login...');
      setHasTriggeredAutoLogin(true);
      autoLogin();
    }
  }, [disableAutoLogin, shouldAutoRedirect, hasTriggeredAutoLogin, isAutoLoginLoading, startupConfig, autoLogin]);

  // Render fallback UI if auto-redirect is active.
  if (shouldAutoRedirect) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-lg font-semibold">
          {localize('com_ui_redirecting_to_provider', { 0: startupConfig.openidLabel })}
        </p>
        <div className="mt-4">
          <SocialButton
            key="openid"
            enabled={startupConfig.openidLoginEnabled}
            serverDomain={startupConfig.serverDomain}
            oauthPath="openid"
            Icon={() =>
              startupConfig.openidImageUrl ? (
                <img src={startupConfig.openidImageUrl} alt="OpenID Logo" className="h-5 w-5" />
              ) : (
                <OpenIDIcon />
              )
            }
            label={startupConfig.openidLabel}
            id="openid"
          />
        </div>
      </div>
    );
  }

  // Render loading UI if auto-login is in progress
  if (isAutoLoginLoading || (hasTriggeredAutoLogin && !disableAutoLogin)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <p className="mt-4 text-lg font-semibold">
          Creating your session...
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You'll be automatically logged in as a temporary user
        </p>
      </div>
    );
  }

  return (
    <>
      {error != null && <ErrorMessage>{localize(getLoginError(error))}</ErrorMessage>}
      
      {/* Show manual login option if auto-login is disabled */}
      {(disableAutoLogin || hasTriggeredAutoLogin) && (
        <>
          <div className="mb-6 text-center">
            <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Welcome to LibreChat MVP
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              For quick testing, we'll create a temporary account for you
            </p>
          </div>
          
          {!hasTriggeredAutoLogin && (
            <button
              onClick={() => {
                setHasTriggeredAutoLogin(true);
                autoLogin();
              }}
              className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              disabled={isAutoLoginLoading}
            >
              {isAutoLoginLoading ? 'Creating Account...' : 'Start Testing (Create Temporary Account)'}
            </button>
          )}
          
          {startupConfig?.emailLoginEnabled === true && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                    Or use existing account
                  </span>
                </div>
              </div>
              
              <LoginForm
                onSubmit={login}
                startupConfig={startupConfig}
                error={error}
                setError={setError}
              />
            </>
          )}
          
          {startupConfig?.registrationEnabled === true && (
            <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
              {' '}
              {localize('com_auth_no_account')}{' '}
              <a
                href="/register?autoLogin=false"
                className="inline-flex p-1 text-sm font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                {localize('com_auth_sign_up')}
              </a>
            </p>
          )}
        </>
      )}
    </>
  );
}

export default Login;
