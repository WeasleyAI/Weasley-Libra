import { useForm } from 'react-hook-form';
import React, { useContext, useState, useEffect } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { ThemeContext, Spinner, Button } from '@librechat/client';
import { useNavigate, useOutletContext, useLocation, useSearchParams } from 'react-router-dom';
import { useRegisterUserMutation } from 'librechat-data-provider/react-query';
import type { TRegisterUser, TError } from 'librechat-data-provider';
import type { TLoginLayoutContext } from '~/common';
import { useLocalize, TranslationKeys } from '~/hooks';
import { useAutoLogin } from '~/hooks/useAutoLogin';
import { ErrorMessage } from './ErrorMessage';

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const localize = useLocalize();
  const { theme } = useContext(ThemeContext);
  const { startupConfig, startupConfigError, isFetching } = useOutletContext<TLoginLayoutContext>();
  const { autoLogin, isLoading: isAutoLoginLoading } = useAutoLogin();

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TRegisterUser>({ mode: 'onChange' });
  const password = watch('password');

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState<number>(3);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [hasTriggeredAutoLogin, setHasTriggeredAutoLogin] = useState(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const disableAutoLogin = searchParams.get('autoLogin') === 'false';
  const validTheme = theme === 'dark' ? 'dark' : 'light';

  // only require captcha if we have a siteKey
  const requireCaptcha = Boolean(startupConfig?.turnstile?.siteKey);

  // Auto-login effect - triggers when component mounts and conditions are met
  useEffect(() => {
    if (
      !disableAutoLogin && 
      !hasTriggeredAutoLogin && 
      !isAutoLoginLoading &&
      startupConfig
    ) {
      console.log('Triggering auto-login from registration...');
      setHasTriggeredAutoLogin(true);
      autoLogin();
    }
  }, [disableAutoLogin, hasTriggeredAutoLogin, isAutoLoginLoading, startupConfig, autoLogin]);

  const registerUser = useRegisterUserMutation({
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSuccess: () => {
      setIsSubmitting(false);
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            navigate('/c/new', { replace: true });
            return 0;
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);
    },
    onError: (error: unknown) => {
      setIsSubmitting(false);
      if ((error as TError).response?.data?.message) {
        setErrorMessage((error as TError).response?.data?.message ?? '');
      }
    },
  });

  const renderInput = (id: string, label: TranslationKeys, type: string, validation: object) => (
    <div className="mb-4">
      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={id}
          aria-label={localize(label)}
          {...register(
            id as 'name' | 'email' | 'username' | 'password' | 'confirm_password',
            validation,
          )}
          aria-invalid={!!errors[id]}
          className="webkit-dark-styles transition-color peer w-full rounded-2xl border border-border-light bg-surface-primary px-3.5 pb-2.5 pt-3 text-text-primary duration-200 focus:border-green-500 focus:outline-none"
          placeholder=" "
          data-testid={id}
        />
        <label
          htmlFor={id}
          className="absolute start-3 top-1.5 z-10 origin-[0] -translate-y-4 scale-75 transform bg-surface-primary px-2 text-sm text-text-secondary-alt duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-1.5 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 peer-focus:text-green-500 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4"
        >
          {localize(label)}
        </label>
      </div>
      {errors[id] && (
        <span role="alert" className="mt-1 text-sm text-red-500">
          {String(errors[id]?.message) ?? ''}
        </span>
      )}
    </div>
  );

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
      {errorMessage && (
        <ErrorMessage>
          {localize('com_auth_error_create')} {errorMessage}
        </ErrorMessage>
      )}
      {registerUser.isSuccess && countdown > 0 && (
        <div
          className="rounded-md border border-green-500 bg-green-500/10 px-3 py-2 text-sm text-gray-600 dark:text-gray-200"
          role="alert"
        >
          {localize(
            startupConfig?.emailEnabled
              ? 'com_auth_registration_success_generic'
              : 'com_auth_registration_success_insecure',
          ) +
            ' ' +
            localize('com_auth_email_verification_redirecting', { 0: countdown.toString() })}
        </div>
      )}
      
      {/* Show manual registration option if auto-login is disabled */}
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
          
          {startupConfig?.registrationEnabled === true && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                    Or create permanent account
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}
      
      {!startupConfigError && !isFetching && (disableAutoLogin || hasTriggeredAutoLogin) && (
        <>
          <form
            className="mt-6"
            aria-label="Registration form"
            method="POST"
            onSubmit={handleSubmit((data: TRegisterUser) =>
              registerUser.mutate({ ...data, token: token ?? undefined }),
            )}
          >
            {renderInput('name', 'com_auth_full_name', 'text', {
              required: localize('com_auth_name_required'),
              minLength: {
                value: 3,
                message: localize('com_auth_name_min_length'),
              },
              maxLength: {
                value: 80,
                message: localize('com_auth_name_max_length'),
              },
            })}
            {renderInput('username', 'com_auth_username', 'text', {
              minLength: {
                value: 2,
                message: localize('com_auth_username_min_length'),
              },
              maxLength: {
                value: 80,
                message: localize('com_auth_username_max_length'),
              },
            })}
            {renderInput('email', 'com_auth_email', 'email', {
              required: localize('com_auth_email_required'),
              minLength: {
                value: 1,
                message: localize('com_auth_email_min_length'),
              },
              maxLength: {
                value: 120,
                message: localize('com_auth_email_max_length'),
              },
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: localize('com_auth_email_pattern'),
              },
            })}
            {renderInput('password', 'com_auth_password', 'password', {
              required: localize('com_auth_password_required'),
              minLength: {
                value: 8,
                message: localize('com_auth_password_min_length'),
              },
              maxLength: {
                value: 128,
                message: localize('com_auth_password_max_length'),
              },
            })}
            {renderInput('confirm_password', 'com_auth_password_confirm', 'password', {
              validate: (value: string) =>
                value === password || localize('com_auth_password_not_match'),
            })}

            {startupConfig?.turnstile?.siteKey && (
              <div className="my-4 flex justify-center">
                <Turnstile
                  siteKey={startupConfig.turnstile.siteKey}
                  options={{
                    ...startupConfig.turnstile.options,
                    theme: validTheme,
                  }}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>
            )}

            <div className="mt-6">
              <Button
                disabled={
                  Object.keys(errors).length > 0 ||
                  isSubmitting ||
                  (requireCaptcha && !turnstileToken)
                }
                type="submit"
                aria-label="Submit registration"
                variant="submit"
                className="h-12 w-full rounded-2xl"
              >
                {isSubmitting ? <Spinner /> : localize('com_auth_continue')}
              </Button>
            </div>
          </form>

          <p className="my-4 text-center text-sm font-light text-gray-700 dark:text-white">
            {localize('com_auth_already_have_account')}{' '}
            <a
              href="/login?autoLogin=false"
              aria-label="Login"
              className="inline-flex p-1 text-sm font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              {localize('com_auth_login')}
            </a>
          </p>
        </>
      )}
    </>
  );
};

export default Registration;
