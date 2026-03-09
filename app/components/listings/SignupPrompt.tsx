'use client';

import useLoginModal from '@/app/hooks/useLoginModal';
import useRegisterModal from '@/app/hooks/useRegisterModal';

interface SignupPromptProps {
  viewedCount: number;
}

const SignupPrompt: React.FC<SignupPromptProps> = ({ viewedCount }) => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-neutral-800 mb-3">
          You&apos;ve viewed {viewedCount} listings
        </h2>
        <p className="text-neutral-600 mb-6">
          Sign up for free to continue exploring more listings and unlock all features.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={registerModal.onOpen}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Sign up for free
          </button>
          <button
            onClick={loginModal.onOpen}
            className="w-full bg-white hover:bg-neutral-100 text-neutral-800 font-semibold py-3 px-6 rounded-lg border border-neutral-300 transition"
          >
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPrompt;
