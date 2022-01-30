import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe.js';
import styles from './styles.module.scss';


interface SubscribeButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId } : SubscribeButtonProps) {

    const { data: session } = useSession();
    const router = useRouter();

    async function handleSubscribe() {

        if(!session) {
            signIn('github');
            return;
        }

        // Caso já tenha inscrição redireciona para posts
        if(session.activeSubscription) {
            router.push('/posts');
            return;
        }


        // criação de checkout session

        try {
            // stripe agindo no back-end
            const response = await api.post('/subscribe');
            const { sessionId } = response.data;

            // stripe agindo no front-end
            const stripe = await getStripeJs();
            await stripe.redirectToCheckout({ sessionId });

        } catch (error) {
            alert(error.message);
        }

    }


    return (
        <button
        type="button"
        className={styles.subscribeButton}
        onClick={handleSubscribe}>
            Subscribe Now
        </button>
    );
}