import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { LOTTIE_DOG_CONFIRM } from '../lib/lottieAssets';

export default function ToastLottie() {
  return (
    <DotLottieReact
      src={LOTTIE_DOG_CONFIRM}
      autoplay
      loop
      style={{ width: '100%', height: '100%' }}
    />
  );
}
