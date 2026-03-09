'use client';

import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { LISTING_LIMIT } from '@/app/hooks/useListingViewLimit';

const SignupPrompt = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  return (
    <div className="w-full py-12 px-4 text-center bg-gradient-to-b from-white to-neutral-100 border-t border-neutral-200">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-neutral-800 mb-3">
          You&apos;ve viewed {LISTING_LIMIT} listings
        </h2>
        <p className="text-neutral-600 mb-6">
          Sign up for free to continue exploring and unlock unlimited access to all listings.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={registerModal.onOpen}
            className="
              px-6
              py-3
              bg-rose-500
              text-white
              font-semibold
              rounded-lg
              hover:bg-rose-600
              transition
            "
          >
            Sign up for free
          </button>
          <button
            onClick={loginModal.onOpen}
            className="
              px-6
              py-3
              border
              border-neutral-300
              text-neutral-700
              font-semibold
              rounded-lg
              hover:bg-neutral-50
              transition
            "
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPrompt;
